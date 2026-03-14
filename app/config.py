import os
from functools import lru_cache

from pydantic import AnyUrl

# Import BaseSettings safely
try:
    from pydantic_settings import BaseSettings
except ModuleNotFoundError:
    from pydantic import BaseSettings

<<<<<<< HEAD
=======
from dotenv import load_dotenv

load_dotenv()

>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a

class Settings(BaseSettings):
    app_name: str = "Xam Mate"
    environment: str = "development"

    database_url: AnyUrl

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()

