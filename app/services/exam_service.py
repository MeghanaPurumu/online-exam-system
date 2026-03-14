from datetime import datetime, timezone
import hashlib
import random

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.exam import Question, Submission
from app.repositories import exam_repository
from app.schemas.exam import (
    ExamCreate,
    ExamUpdate,
    SubmissionCreate,
    LeaderboardEntry,
    ExamStatusEntry,
    ProfileStats,
    SubmissionReview,
    QuestionReview,
    ExamAttemptEntry,
)


def create_exam(db: Session, payload: ExamCreate, creator_id: int):
    questions_data = [q.dict() for q in payload.questions]
    exam = exam_repository.create_exam(
        db,
        title=payload.title,
        description=payload.description,
        created_by_id=creator_id,
        allow_multiple_attempts=payload.allow_multiple_attempts,
        assigned_only=payload.assigned_only,
        start_at=payload.start_at,
        end_at=payload.end_at,
        questions=questions_data,
        assigned_user_ids=payload.assigned_user_ids,
    )
    return exam


def update_exam(db: Session, exam_id: int, payload: ExamUpdate, current_admin_id: int):
    exam = exam_repository.get_exam(db, exam_id)
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")

    # Only creator or any admin can update; here we accept any admin.
    updated = exam_repository.update_exam(
        db,
        exam_id,
        title=payload.title,
        description=payload.description,
        allow_multiple_attempts=payload.allow_multiple_attempts,
        assigned_only=payload.assigned_only,
        start_at=payload.start_at,
        end_at=payload.end_at,
        questions=[q.dict() for q in payload.questions] if payload.questions is not None else None,
        assigned_user_ids=payload.assigned_user_ids,
    )
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    return updated


def _ensure_exam_visible(db: Session, exam_id: int, student_id: int):
    exam = exam_repository.get_exam(db, exam_id)
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    if exam.assigned_only and not exam_repository.is_user_assigned_to_exam(db, exam_id, student_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not assigned to this exam")
    return exam


def _shuffle_questions_for_user_attempt(exam_id: int, student_id: int, attempt_number: int, questions: list[Question]):
    seed_src = f"{exam_id}:{student_id}:{attempt_number}".encode("utf-8")
    seed_int = int(hashlib.sha256(seed_src).hexdigest(), 16)
    rng = random.Random(seed_int)
    qs = list(questions)
    rng.shuffle(qs)
    return qs


def take_exam(db: Session, exam_id: int, student_id: int):
    exam = _ensure_exam_visible(db, exam_id, student_id)

    existing_count = exam_repository.count_submissions_for_student_exam(db, exam_id, student_id)
    if not exam.allow_multiple_attempts and existing_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Multiple attempts are not allowed for this exam",
        )
    attempt_number = existing_count + 1
    exam.questions = _shuffle_questions_for_user_attempt(exam_id, student_id, attempt_number, exam.questions)
    return exam, attempt_number


def submit_exam(db: Session, exam_id: int, student_id: int, payload: SubmissionCreate):
    exam = _ensure_exam_visible(db, exam_id, student_id)

    if not exam.allow_multiple_attempts:
        existing = exam_repository.get_student_submission_for_exam(db, exam_id, student_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Multiple attempts are not allowed for this exam",
            )

    questions_by_id: dict[int, Question] = {q.id: q for q in exam.questions}
    score = 0
    normalized_answers: list[dict] = []
    for ans in payload.answers:
        question = questions_by_id.get(ans.question_id)
        if not question:
            continue

        selected_raw = ans.selected_option
        selected = selected_raw.upper()

        # Prefer multi-correct field when available.
        if question.correct_options:
            correct_set = {opt.strip().upper() for opt in question.correct_options.split(",") if opt.strip()}
            # Expect comma-separated selections for multi-answer questions.
            selected_set = {opt.strip().upper() for opt in selected.split(",") if opt.strip()}
            if selected_set and selected_set == correct_set:
                score += 1
        else:
            if selected == question.correct_option.upper():
                score += 1

        normalized_answers.append(
            {
                "question_id": question.id,
                "selected_options": ",".join(sorted({opt.strip().upper() for opt in selected_raw.split(",") if opt.strip()}))
                or "",
            }
        )

    attempt_number = exam_repository.count_submissions_for_student_exam(db, exam_id, student_id) + 1
    submission = exam_repository.create_submission(
        db,
        exam_id=exam_id,
        student_id=student_id,
        score=score,
        attempt_number=attempt_number,
    )
    if normalized_answers:
        exam_repository.save_submission_answers(
            db,
            submission_id=submission.id,
            answers=normalized_answers,
        )
    return submission


def get_exam(db: Session, exam_id: int, current_user_id: int, is_admin: bool):
    exam = exam_repository.get_exam(db, exam_id)
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    if not is_admin and exam.assigned_only and not exam_repository.is_user_assigned_to_exam(db, exam_id, current_user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not assigned to this exam")
    return exam


def list_exams(db: Session, current_user_id: int, is_admin: bool):
    if is_admin:
        return exam_repository.list_exams(db)
    return exam_repository.list_exams_for_user(db, current_user_id)


def get_leaderboard(db: Session, exam_id: int) -> list[LeaderboardEntry]:
    submissions = exam_repository.get_leaderboard_for_exam(db, exam_id)
    if not submissions:
        return []
    entries: list[LeaderboardEntry] = []
    for sub in submissions:
        entries.append(
            LeaderboardEntry(
                student_id=sub.student_id,
                student_email=sub.student.email if hasattr(sub, "student") and sub.student else "",
                score=sub.score,
            )
        )
    return entries


def get_exam_status_for_user(db: Session, student_id: int) -> list[ExamStatusEntry]:
    exams = exam_repository.list_exams_for_user(db, student_id)
    submissions = exam_repository.get_submissions_for_user(db, student_id)

    # Map latest submission per exam
    latest_by_exam: dict[int, Submission] = {}
    for sub in submissions:
        if sub.exam_id not in latest_by_exam:
            latest_by_exam[sub.exam_id] = sub

    now = datetime.now(timezone.utc)
    status_entries: list[ExamStatusEntry] = []

    for exam in exams:
        latest = latest_by_exam.get(exam.id)
        if latest:
            status = "completed"
            last_score = latest.score
            last_attempt_at = latest.created_at
        else:
            last_score = None
            last_attempt_at = None
            if exam.end_at and now > exam.end_at:
                status = "overdue"
            else:
                status = "upcoming"

        status_entries.append(
            ExamStatusEntry(
                id=exam.id,
                title=exam.title,
                description=exam.description,
                allow_multiple_attempts=exam.allow_multiple_attempts,
                start_at=exam.start_at,
                end_at=exam.end_at,
                status=status,
                last_score=last_score,
                last_attempt_at=last_attempt_at,
            )
        )

    return status_entries


def get_profile_stats(db: Session, student_id: int) -> ProfileStats:
    submissions = exam_repository.get_submissions_for_user(db, student_id)
    total_exams_attempted = len(submissions)
    total_score = sum(sub.score for sub in submissions)

    if not submissions:
        return ProfileStats(
            total_exams_attempted=0,
            total_score=0,
            average_percentage=0.0,
            days_active=0,
        )

    # Approximate percentage: average of (score / question_count) across attempts
    percentages: list[float] = []
    days = set()

    for sub in submissions:
        exam = exam_repository.get_exam(db, sub.exam_id)
        question_count = len(exam.questions) if exam and exam.questions else 0
        if question_count > 0:
            percentages.append((sub.score / question_count) * 100.0)
        if sub.created_at:
            days.add(sub.created_at.date())

    average_percentage = sum(percentages) / len(percentages) if percentages else 0.0
    days_active = len(days)

    return ProfileStats(
        total_exams_attempted=total_exams_attempted,
        total_score=total_score,
        average_percentage=round(average_percentage, 2),
        days_active=days_active,
    )


def get_submission_review(db: Session, exam_id: int, student_id: int) -> SubmissionReview:
    submission = exam_repository.get_latest_submission_for_exam(db, exam_id, student_id)
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No submission found for this exam")

    exam = exam_repository.get_exam(db, exam_id)
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")

    answers = exam_repository.get_answers_for_submission(db, submission.id)
    answers_by_q = {a.question_id: a for a in answers}

    questions_review: list[QuestionReview] = []
    for q in exam.questions:
        ans = answers_by_q.get(q.id)
        selected_opts = (
            [opt for opt in ans.selected_options.split(",") if opt.strip()] if ans and ans.selected_options else []
        )
        if q.correct_options:
            correct = [opt for opt in q.correct_options.split(",") if opt.strip()]
        else:
            correct = [q.correct_option] if q.correct_option else []

        questions_review.append(
            QuestionReview(
                question_id=q.id,
                text=q.text,
                options={
                    "A": q.option_a,
                    "B": q.option_b,
                    "C": q.option_c,
                    "D": q.option_d,
                },
                correct_options=[opt.strip().upper() for opt in correct],
                selected_options=[opt.strip().upper() for opt in selected_opts],
                question_image=q.question_image,
                option_images={
                    "A": q.option_a_image or "",
                    "B": q.option_b_image or "",
                    "C": q.option_c_image or "",
                    "D": q.option_d_image or "",
                },
            )
        )

    return SubmissionReview(
        submission_id=submission.id,
        exam_id=exam.id,
        score=submission.score,
        attempt_number=submission.attempt_number,
        questions=questions_review,
    )


def get_exam_attempts(db: Session, exam_id: int) -> list[ExamAttemptEntry]:
    exam = exam_repository.get_exam(db, exam_id)
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    raw_entries = exam_repository.get_exam_attempts(db, exam_id)
    return [ExamAttemptEntry(**e) for e in raw_entries]

