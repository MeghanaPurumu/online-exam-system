from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app import database
from app.models.user import User
from app.routes.auth import get_current_user, get_current_admin
from app.schemas.exam import (
    ExamCreate,
    ExamUpdate,
    ExamOut,
    ExamTakeOut,
    SubmissionCreate,
    SubmissionOut,
    LeaderboardEntry,
    ExamStatusEntry,
    ProfileStats,
    SubmissionReview,
    ExamAttemptEntry,
)
from app.services import exam_service


router = APIRouter()


@router.post("/", response_model=ExamOut, status_code=status.HTTP_201_CREATED)
def create_exam(
    payload: ExamCreate,
    db: Session = Depends(database.get_db),
    current_admin: User = Depends(get_current_admin),
):
    exam = exam_service.create_exam(db, payload, creator_id=current_admin.id)
    return exam


@router.put("/{exam_id}", response_model=ExamOut)
def update_exam(
    exam_id: int,
    payload: ExamUpdate,
    db: Session = Depends(database.get_db),
    current_admin: User = Depends(get_current_admin),
):
    exam = exam_service.update_exam(db, exam_id, payload, current_admin_id=current_admin.id)
    return exam


@router.get("/", response_model=List[ExamOut])
def list_exams(
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    exams = exam_service.list_exams(db, current_user_id=current_user.id, is_admin=current_user.is_admin)
    return exams


@router.get("/status", response_model=List[ExamStatusEntry])
def list_exam_status(
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    return exam_service.get_exam_status_for_user(db, student_id=current_user.id)


@router.get("/{exam_id}", response_model=ExamOut)
def get_exam(
    exam_id: int,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    exam = exam_service.get_exam(db, exam_id, current_user_id=current_user.id, is_admin=current_user.is_admin)
    return exam


@router.get("/{exam_id}/take", response_model=ExamTakeOut)
def take_exam(
    exam_id: int,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    exam, attempt_number = exam_service.take_exam(db, exam_id, student_id=current_user.id)
    setattr(exam, "attempt_number", attempt_number)
    return exam


@router.post("/{exam_id}/submit", response_model=SubmissionOut, status_code=status.HTTP_201_CREATED)
def submit_exam(
    exam_id: int,
    payload: SubmissionCreate,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    submission = exam_service.submit_exam(db, exam_id, student_id=current_user.id, payload=payload)
    return submission


@router.get("/{exam_id}/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(
    exam_id: int,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
    ):
    return exam_service.get_leaderboard(db, exam_id)


@router.get("/{exam_id}/review", response_model=SubmissionReview)
def review_submission(
    exam_id: int,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    return exam_service.get_submission_review(db, exam_id, student_id=current_user.id)


@router.get("/{exam_id}/attempts", response_model=list[ExamAttemptEntry])
def get_exam_attempts(
    exam_id: int,
    db: Session = Depends(database.get_db),
    current_admin: User = Depends(get_current_admin),
):
    return exam_service.get_exam_attempts(db, exam_id)

