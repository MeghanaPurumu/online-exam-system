from typing import List

from datetime import datetime

from pydantic import BaseModel, conint


class QuestionCreate(BaseModel):
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    # For backward compatibility, support both single and multiple correct options.
    correct_option: str | None = None
    correct_options: list[str] | None = None
    question_image: str | None = None
    option_a_image: str | None = None
    option_b_image: str | None = None
    option_c_image: str | None = None
    option_d_image: str | None = None


class QuestionOut(BaseModel):
    id: int
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    is_multi: bool = False
    question_image: str | None = None
    option_a_image: str | None = None
    option_b_image: str | None = None
    option_c_image: str | None = None
    option_d_image: str | None = None

    class Config:
        from_attributes = True


class ExamCreate(BaseModel):
    title: str
    description: str | None = None
    allow_multiple_attempts: bool = True
    start_at: datetime | None = None
    end_at: datetime | None = None
    questions: List[QuestionCreate]
    assigned_only: bool = False
    assigned_user_ids: list[int] | None = None


class ExamUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    allow_multiple_attempts: bool | None = None
    start_at: datetime | None = None
    end_at: datetime | None = None
    questions: List[QuestionCreate] | None = None
    assigned_only: bool | None = None
    assigned_user_ids: list[int] | None = None


class ExamOut(BaseModel):
    id: int
    title: str
    description: str | None
    allow_multiple_attempts: bool
    assigned_only: bool
    start_at: datetime | None
    end_at: datetime | None
    questions: List[QuestionOut]

    class Config:
        from_attributes = True


class ExamTakeOut(ExamOut):
    attempt_number: int


class Answer(BaseModel):
    question_id: int
    selected_option: str


class SubmissionCreate(BaseModel):
    answers: List[Answer]


class SubmissionOut(BaseModel):
    id: int
    exam_id: int
    student_id: int
    score: conint(ge=0)  # type: ignore
    attempt_number: int

    class Config:
        from_attributes = True


class QuestionReview(BaseModel):
    question_id: int
    text: str
    options: dict[str, str]
    correct_options: list[str]
    selected_options: list[str]
    question_image: str | None = None
    option_images: dict[str, str] | None = None


class SubmissionReview(BaseModel):
    submission_id: int
    exam_id: int
    score: int
    attempt_number: int
    questions: list[QuestionReview]


class ExamAttemptEntry(BaseModel):
    user_id: int
    email: str
    full_name: str | None
    has_attempted: bool
    last_score: int | None
    attempt_count: int
    assigned: bool


class LeaderboardEntry(BaseModel):
    student_id: int
    student_email: str
    score: int


class ExamStatusEntry(BaseModel):
    id: int
    title: str
    description: str | None
    allow_multiple_attempts: bool
    start_at: datetime | None
    end_at: datetime | None
    status: str  # "completed" | "upcoming" | "overdue"
    last_score: int | None
    last_attempt_at: datetime | None


class ProfileStats(BaseModel):
    total_exams_attempted: int
    total_score: int
    average_percentage: float
    days_active: int

