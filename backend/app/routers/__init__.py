from .auth import router as auth_router
from .usuarios import router as usuarios_router
from .iniciativas import router as iniciativas_router
from .proyectos import router as proyectos_router
from .evaluaciones import router as evaluaciones_router
from .planificacion import router as planificacion_router
from .presupuesto import router as presupuesto_router
from .seguimiento import router as seguimiento_router
from .dashboard import router as dashboard_router

__all__ = [
    "auth_router",
    "usuarios_router",
    "iniciativas_router",
    "proyectos_router",
    "evaluaciones_router",
    "planificacion_router",
    "presupuesto_router",
    "seguimiento_router",
    "dashboard_router"
]
