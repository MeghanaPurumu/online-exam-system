from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session

from app.config import get_settings


settings = get_settings()

engine = create_engine(str(settings.database_url))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db() -> None:
    """
    Create database tables if they don't exist yet.
    This keeps local/dev setup simple without requiring migrations.
    """
    from app.models.base import Base
    # Ensure models are imported so they register with SQLAlchemy metadata
    from app.models import user as _user  # noqa: F401
    from app.models import exam as _exam  # noqa: F401

    Base.metadata.create_all(bind=engine)

    # Lightweight schema sync for local/dev: create_all() doesn't add new columns
    # to existing tables. We apply additive changes in a safe, idempotent way.
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE exams ADD COLUMN IF NOT EXISTS assigned_only BOOLEAN NOT NULL DEFAULT FALSE"))
            conn.execute(
                text("ALTER TABLE submissions ADD COLUMN IF NOT EXISTS attempt_number INTEGER NOT NULL DEFAULT 1")
            )
            conn.execute(
                text(
                    """
                    CREATE TABLE IF NOT EXISTS exam_assignments (
                        id SERIAL PRIMARY KEY,
                        exam_id INTEGER NOT NULL REFERENCES exams(id),
                        user_id INTEGER NOT NULL REFERENCES users(id),
                        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                        CONSTRAINT uq_exam_assignment UNIQUE (exam_id, user_id)
                    )
                    """
                )
            )
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_exam_assignments_exam_id ON exam_assignments (exam_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_exam_assignments_user_id ON exam_assignments (user_id)"))
    except Exception:
        # If the DB user lacks permissions for DDL, the app can still run against a fresh schema.
        # Concrete errors will surface in routes; keeping init resilient avoids startup crashes.
        pass


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

