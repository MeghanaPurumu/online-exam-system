from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, exams
from app.database import init_db


def create_app() -> FastAPI:
    app = FastAPI(title="Xam Mate")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(exams.router, prefix="/exams", tags=["exams"])

    init_db()

    return app


app = create_app()

