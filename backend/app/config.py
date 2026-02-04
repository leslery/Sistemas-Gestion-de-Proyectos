from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database (SQLite para desarrollo, PostgreSQL para producción)
    DATABASE_URL: str = "sqlite:///./sgip.db"
    # Para usar PostgreSQL, cambiar a:
    # DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/sgip_db"

    # JWT
    SECRET_KEY: str = "tu-clave-secreta-muy-segura-cambiar-en-produccion"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 horas

    # Application
    APP_NAME: str = "Sistema de Gestión de Iniciativas y Proyectos"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # CORS
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000"]

    # Umbrales de presupuesto (en CLP)
    UMBRAL_CAPEX: int = 500000
    UMBRAL_NIIF16: int = 5000000

    # Umbrales de clasificación de inversión
    UMBRAL_ESTANDAR: int = 300000000  # 300M
    UMBRAL_ALTA: int = 1500000000  # 1500M

    # Umbral de aprobación del comité
    UMBRAL_APROBACION_COMITE: int = 80

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()
