from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func, UniqueConstraint, Text
from sqlalchemy.orm import relationship

from app.models.base import Base


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    allow_multiple_attempts = Column(Boolean, default=True, nullable=False)
    assigned_only = Column(Boolean, default=False, nullable=False)
    start_at = Column(DateTime(timezone=True), nullable=True)
    end_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")
    assignments = relationship("ExamAssignment", back_populates="exam", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    text = Column(String, nullable=False)
    option_a = Column(String, nullable=False)
    option_b = Column(String, nullable=False)
    option_c = Column(String, nullable=False)
    option_d = Column(String, nullable=False)
    correct_option = Column(String(1), nullable=False)  # single-correct legacy field
    correct_options = Column(String, nullable=True)  # comma-separated multi-correct, e.g. "A,B"
    question_image = Column(Text, nullable=True)
    option_a_image = Column(Text, nullable=True)
    option_b_image = Column(Text, nullable=True)
    option_c_image = Column(Text, nullable=True)
    option_d_image = Column(Text, nullable=True)

    exam = relationship("Exam", back_populates="questions")

    @property
    def is_multi(self) -> bool:
        """
        True when the question supports multiple correct answers.
        This is safe to expose to students (does not reveal which answers are correct).
        """
        if not self.correct_options:
            return False
        # Accept both "A,B" and single "A" representations.
        parts = [p.strip() for p in self.correct_options.split(",") if p.strip()]
        return len(parts) > 1


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score = Column(Integer, nullable=False)
    attempt_number = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class SubmissionAnswer(Base):
    __tablename__ = "submission_answers"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False, index=True)
    selected_options = Column(String, nullable=False)  # comma-separated, e.g. "A,B"


class ExamAssignment(Base):
    __tablename__ = "exam_assignments"
    __table_args__ = (UniqueConstraint("exam_id", "user_id", name="uq_exam_assignment"),)

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    exam = relationship("Exam", back_populates="assignments")

