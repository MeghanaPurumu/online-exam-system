from typing import List, Optional

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.exam import Exam, Question, Submission, ExamAssignment, SubmissionAnswer
from app.models.user import User
from datetime import datetime

def create_exam(
    db: Session,
    *,
    title: str,
    description: str | None,
    created_by_id: int,
    allow_multiple_attempts: bool,
    assigned_only: bool = False,
    start_at: datetime | None,
    end_at: datetime | None,
    questions: list[dict],
    assigned_user_ids: list[int] | None = None,
) -> Exam:
    exam = Exam(
        title=title,
        description=description,
        created_by_id=created_by_id,
        allow_multiple_attempts=allow_multiple_attempts,
        assigned_only=assigned_only or bool(assigned_user_ids),
        start_at=start_at,
        end_at=end_at,
    )
    db.add(exam)
    db.flush()

    for q in questions:
        correct_options = q.get("correct_options") or []
        if isinstance(correct_options, list):
            correct_options_str = ",".join(sorted({opt.upper() for opt in correct_options}))
        else:
            correct_options_str = ""

        question = Question(
            exam_id=exam.id,
            text=q["text"],
            option_a=q["option_a"],
            option_b=q["option_b"],
            option_c=q["option_c"],
            option_d=q["option_d"],
            correct_option=(q.get("correct_option") or (correct_options[0] if correct_options else "A")),
            correct_options=correct_options_str or None,
            question_image=q.get("question_image"),
            option_a_image=q.get("option_a_image"),
            option_b_image=q.get("option_b_image"),
            option_c_image=q.get("option_c_image"),
            option_d_image=q.get("option_d_image"),
        )
        db.add(question)

    if assigned_user_ids:
        for user_id in assigned_user_ids:
            db.add(ExamAssignment(exam_id=exam.id, user_id=user_id))

    db.commit()
    db.refresh(exam)
    return exam


def update_exam(
    db: Session,
    exam_id: int,
    *,
    title: str | None = None,
    description: str | None = None,
    allow_multiple_attempts: bool | None = None,
    assigned_only: bool | None = None,
    start_at: datetime | None = None,
    end_at: datetime | None = None,
    questions: list[dict] | None = None,
    assigned_user_ids: list[int] | None = None,
) -> Optional[Exam]:
    exam = get_exam(db, exam_id)
    if not exam:
        return None

    if title is not None:
        exam.title = title
    if description is not None:
        exam.description = description
    if allow_multiple_attempts is not None:
        exam.allow_multiple_attempts = allow_multiple_attempts
    if start_at is not None:
        exam.start_at = start_at
    if end_at is not None:
        exam.end_at = end_at

    if questions is not None:
        # Replace all questions. Any existing submission answers (and their submissions)
        # that reference the current questions must be removed first to avoid FK errors.
        question_ids = [q.id for q in exam.questions]
        if question_ids:
            (
                db.query(SubmissionAnswer)
                .filter(SubmissionAnswer.question_id.in_(question_ids))
                .delete(synchronize_session=False)
            )
            (
                db.query(Submission)
                .filter(Submission.exam_id == exam.id)
                .delete(synchronize_session=False)
            )
            db.flush()

        # Now safely delete existing questions and recreate them from the payload.
        for q in list(exam.questions):
            db.delete(q)
        db.flush()
        for q in questions:
            correct_options = q.get("correct_options") or []
            if isinstance(correct_options, list):
                correct_options_str = ",".join(sorted({opt.upper() for opt in correct_options}))
            else:
                correct_options_str = ""

            question = Question(
                exam_id=exam.id,
                text=q["text"],
                option_a=q["option_a"],
                option_b=q["option_b"],
                option_c=q["option_c"],
                option_d=q["option_d"],
                correct_option=(q.get("correct_option") or (correct_options[0] if correct_options else "A")),
                correct_options=correct_options_str or None,
                question_image=q.get("question_image"),
                option_a_image=q.get("option_a_image"),
                option_b_image=q.get("option_b_image"),
                option_c_image=q.get("option_c_image"),
                option_d_image=q.get("option_d_image"),
            )
            db.add(question)

    if assigned_user_ids is not None:
        # Replace assignments.
        for a in list(exam.assignments):
            db.delete(a)
        db.flush()
        for user_id in assigned_user_ids:
            db.add(ExamAssignment(exam_id=exam.id, user_id=user_id))
        exam.assigned_only = bool(assigned_user_ids) if assigned_only is None else assigned_only
    elif assigned_only is not None:
        exam.assigned_only = assigned_only

    db.commit()
    db.refresh(exam)
    return exam


def get_exam(db: Session, exam_id: int) -> Optional[Exam]:
    return db.query(Exam).filter(Exam.id == exam_id).first()


def list_exams(db: Session) -> List[Exam]:
    return db.query(Exam).all()


def list_exams_for_user(db: Session, user_id: int) -> List[Exam]:
    # Visible if exam is public OR explicitly assigned to the user.
    return (
        db.query(Exam)
        .outerjoin(ExamAssignment, ExamAssignment.exam_id == Exam.id)
        .filter(or_(Exam.assigned_only.is_(False), ExamAssignment.user_id == user_id))
        .distinct()
        .all()
    )


def is_user_assigned_to_exam(db: Session, exam_id: int, user_id: int) -> bool:
    return (
        db.query(ExamAssignment)
        .filter(and_(ExamAssignment.exam_id == exam_id, ExamAssignment.user_id == user_id))
        .first()
        is not None
    )


def get_submissions_for_user(db: Session, student_id: int) -> List[Submission]:
    return (
        db.query(Submission)
        .filter(Submission.student_id == student_id)
        .order_by(Submission.created_at.desc())
        .all()
    )


def count_submissions_for_student_exam(db: Session, exam_id: int, student_id: int) -> int:
    return db.query(Submission).filter(Submission.exam_id == exam_id, Submission.student_id == student_id).count()


def create_submission(
    db: Session,
    exam_id: int,
    student_id: int,
    score: int,
    attempt_number: int,
) -> Submission:
    submission = Submission(
        exam_id=exam_id,
        student_id=student_id,
        score=score,
        attempt_number=attempt_number,
    )
    db.add(submission)
    db.flush()
    return submission


def save_submission_answers(
    db: Session,
    submission_id: int,
    answers: list[dict],
) -> None:
    for ans in answers:
        db.add(
            SubmissionAnswer(
                submission_id=submission_id,
                question_id=ans["question_id"],
                selected_options=ans["selected_options"],
            )
        )
    db.commit()


def get_student_submission_for_exam(db: Session, exam_id: int, student_id: int) -> Optional[Submission]:
    return (
        db.query(Submission)
        .filter(Submission.exam_id == exam_id, Submission.student_id == student_id)
        .order_by(Submission.created_at.desc())
        .first()
    )


def get_latest_submission_for_exam(db: Session, exam_id: int, student_id: int) -> Optional[Submission]:
    return (
        db.query(Submission)
        .filter(Submission.exam_id == exam_id, Submission.student_id == student_id)
        .order_by(Submission.created_at.desc())
        .first()
    )


def get_leaderboard_for_exam(db: Session, exam_id: int) -> List[Submission]:
    return (
        db.query(Submission)
        .filter(Submission.exam_id == exam_id)
        .order_by(Submission.score.desc(), Submission.created_at.asc())
        .all()
    )


def get_answers_for_submission(db: Session, submission_id: int) -> List[SubmissionAnswer]:
    return db.query(SubmissionAnswer).filter(SubmissionAnswer.submission_id == submission_id).all()


def get_exam_attempts(db: Session, exam_id: int) -> list[dict]:
    submissions = (
        db.query(Submission)
        .filter(Submission.exam_id == exam_id)
        .order_by(Submission.created_at.desc())
        .all()
    )
    latest_by_user: dict[int, Submission] = {}
    attempt_counts: dict[int, int] = {}
    for sub in submissions:
        attempt_counts[sub.student_id] = attempt_counts.get(sub.student_id, 0) + 1
        if sub.student_id not in latest_by_user:
            latest_by_user[sub.student_id] = sub

    # Users explicitly assigned to the exam
    assigned_user_ids = {
        a.user_id for a in db.query(ExamAssignment).filter(ExamAssignment.exam_id == exam_id).all()
    }

    # All users that either are assigned or have submitted
    relevant_user_ids = set(latest_by_user.keys()) | assigned_user_ids
    if not relevant_user_ids:
        return []

    users = db.query(User).filter(User.id.in_(relevant_user_ids)).all()
    result: list[dict] = []
    for u in users:
        latest = latest_by_user.get(u.id)
        result.append(
            {
                "user_id": u.id,
                "email": u.email,
                "full_name": u.full_name,
                "has_attempted": latest is not None,
                "last_score": latest.score if latest else None,
                "attempt_count": attempt_counts.get(u.id, 0),
                "assigned": u.id in assigned_user_ids,
            }
        )
    return result

