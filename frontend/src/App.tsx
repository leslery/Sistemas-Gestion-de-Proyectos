import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import { ToastProvider, GlobalToast } from './components/ui/Toast';
import { ProjectDetailProvider } from './contexts/ProjectDetailContext';

// Dashboard Pages
import Dashboard from './pages/Dashboard';
import DashboardEjecutivo from './pages/DashboardEjecutivo';
import DashboardPortafolio from './pages/dashboards/DashboardPortafolio';
import DashboardFinanciero from './pages/dashboards/DashboardFinanciero';
import DashboardGobernanza from './pages/dashboards/DashboardGobernanza';
import CentroReportes from './pages/dashboards/CentroReportes';

// Existing Pages
import WorkflowPipeline from './pages/WorkflowPipeline';
import Iniciativas from './pages/Iniciativas';
import IniciativaDetalle from './pages/IniciativaDetalle';
import NuevaIniciativa from './pages/NuevaIniciativa';
import Proyectos from './pages/Proyectos';
import ProyectoDetalle from './pages/ProyectoDetalle';
import Evaluaciones from './pages/Evaluaciones';
import BancoReserva from './pages/BancoReserva';
import PlanAnual from './pages/PlanAnual';
import Configuracion from './pages/Configuracion';

// Activación Module
import PlanificacionEstrategica from './pages/activacion/PlanificacionEstrategica';
import InformeFactibilidad from './pages/activacion/InformeFactibilidad';
import ComiteExpertos from './pages/activacion/ComiteExpertos';
import ActivacionIndividual from './pages/activacion/ActivacionIndividual';
import IngresoExtraordinario from './pages/activacion/IngresoExtraordinario';

// Implementación Module
import KickOff from './pages/implementacion/KickOff';
import AnalisisDiseno from './pages/implementacion/AnalisisDiseno';
import Construccion from './pages/implementacion/Construccion';
import Pruebas from './pages/implementacion/Pruebas';
import Transicion from './pages/implementacion/Transicion';
import GoLive from './pages/implementacion/GoLive';

// Seguimiento y Control Module
import ControlPresupuestario from './pages/seguimiento/ControlPresupuestario';
import ControlPlanificacion from './pages/seguimiento/ControlPlanificacion';
import GestionRiesgos from './pages/seguimiento/GestionRiesgos';
import ControlGobernanza from './pages/seguimiento/ControlGobernanza';
import GestionDocumental from './pages/seguimiento/GestionDocumental';
import EvaluacionMetricas from './pages/seguimiento/EvaluacionMetricas';

// Historia Module
import ProcesoCierre from './pages/historia/ProcesoCierre';
import ProyectosCerrados from './pages/historia/ProyectosCerrados';
import ProyectosRechazados from './pages/historia/ProyectosRechazados';

// Compras Module
import SolicitudesSinContrato from './pages/compras/SolicitudesSinContrato';
import EvaluacionProveedores from './pages/compras/EvaluacionProveedores';
import Contratos from './pages/compras/Contratos';
import Ordenes from './pages/compras/Ordenes';

// Configuración Module
import FlujosTrabajo from './pages/configuracion/FlujosTrabajo';
import Plantillas from './pages/configuracion/Plantillas';
import Integraciones from './pages/configuracion/Integraciones';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { token, fetchUser, isLoading } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token, fetchUser]);

  if (token && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <ToastProvider>
    <ProjectDetailProvider>
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard Routes */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="dashboard-ejecutivo" element={<DashboardEjecutivo />} />
        <Route path="dashboards/portafolio" element={<DashboardPortafolio />} />
        <Route path="dashboards/financiero" element={<DashboardFinanciero />} />
        <Route path="dashboards/gobernanza" element={<DashboardGobernanza />} />
        <Route path="dashboards/reportes" element={<CentroReportes />} />

        {/* Activación y Aprobación Routes */}
        <Route path="pipeline" element={<WorkflowPipeline />} />
        <Route path="iniciativas" element={<Iniciativas />} />
        <Route path="iniciativas/nueva" element={<NuevaIniciativa />} />
        <Route path="iniciativas/:id" element={<IniciativaDetalle />} />
        <Route path="evaluaciones" element={<Evaluaciones />} />
        <Route path="banco-reserva" element={<BancoReserva />} />
        <Route path="plan-anual" element={<PlanAnual />} />
        <Route path="activacion/planificacion" element={<PlanificacionEstrategica />} />
        <Route path="activacion/factibilidad" element={<InformeFactibilidad />} />
        <Route path="activacion/comite" element={<ComiteExpertos />} />
        <Route path="activacion/individual" element={<ActivacionIndividual />} />
        <Route path="activacion/extraordinario" element={<IngresoExtraordinario />} />

        {/* Implementación Routes */}
        <Route path="proyectos" element={<Proyectos />} />
        <Route path="proyectos/:id" element={<ProyectoDetalle />} />
        <Route path="implementacion/kickoff" element={<KickOff />} />
        <Route path="implementacion/analisis" element={<AnalisisDiseno />} />
        <Route path="implementacion/construccion" element={<Construccion />} />
        <Route path="implementacion/pruebas" element={<Pruebas />} />
        <Route path="implementacion/transicion" element={<Transicion />} />
        <Route path="implementacion/golive" element={<GoLive />} />

        {/* Seguimiento y Control Routes */}
        <Route path="seguimiento/presupuesto" element={<ControlPresupuestario />} />
        <Route path="seguimiento/planificacion" element={<ControlPlanificacion />} />
        <Route path="seguimiento/riesgos" element={<GestionRiesgos />} />
        <Route path="seguimiento/gobernanza" element={<ControlGobernanza />} />
        <Route path="seguimiento/documentos" element={<GestionDocumental />} />
        <Route path="seguimiento/metricas" element={<EvaluacionMetricas />} />

        {/* Historia Routes */}
        <Route path="historia/cierre" element={<ProcesoCierre />} />
        <Route path="historia/cerrados" element={<ProyectosCerrados />} />
        <Route path="historia/rechazados" element={<ProyectosRechazados />} />

        {/* Gestión de Compras Routes */}
        <Route path="compras/solicitudes" element={<SolicitudesSinContrato />} />
        <Route path="compras/proveedores" element={<EvaluacionProveedores />} />
        <Route path="compras/contratos" element={<Contratos />} />
        <Route path="compras/ordenes" element={<Ordenes />} />

        {/* Configuración Routes */}
        <Route path="configuracion" element={<Configuracion />} />
        <Route path="configuracion/flujos" element={<FlujosTrabajo />} />
        <Route path="configuracion/plantillas" element={<Plantillas />} />
        <Route path="configuracion/integraciones" element={<Integraciones />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </ProjectDetailProvider>
    <GlobalToast />
    </ToastProvider>
  );
}

export default App;
