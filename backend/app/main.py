from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import settings
from .database import engine, Base
from .routers import (
    auth_router, usuarios_router, iniciativas_router,
    proyectos_router, evaluaciones_router, planificacion_router,
    presupuesto_router, seguimiento_router, dashboard_router
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: crear tablas si no existen
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    Sistema de Gestión de Iniciativas y Proyectos (SGIP)

    API para gestionar el ciclo de vida de proyectos digitales en CGE,
    desde la planificación anual hasta la activación individual.

    ## Módulos principales:
    - **Autenticación**: Login y gestión de sesión con JWT
    - **Usuarios**: Gestión de usuarios y áreas
    - **Iniciativas**: Creación, scoring y clasificación de iniciativas
    - **Evaluaciones**: Panel del comité de expertos
    - **Proyectos**: Gestión y seguimiento de proyectos
    - **Planificación**: Plan anual y banco de reserva
    - **Presupuesto**: Control CAPEX/OPEX
    - **Dashboard**: Vistas ejecutivas y KPIs
    """,
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth_router)
app.include_router(usuarios_router)
app.include_router(iniciativas_router)
app.include_router(proyectos_router)
app.include_router(evaluaciones_router)
app.include_router(planificacion_router)
app.include_router(presupuesto_router)
app.include_router(seguimiento_router)
app.include_router(dashboard_router)


@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
