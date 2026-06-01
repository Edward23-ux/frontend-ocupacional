import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute.jsx'
import MainLayout from './layouts/MainLayout.jsx'
import { useAuth } from './hooks/useAuth.js'
import { APP_NAME, ROLES, ROUTES } from './utils/constants.js'
import DashboardPage from './pages/Dashboard/DashboardPage.jsx'
import LoginPage from './pages/Login/LoginPage.jsx'
import ConsultasPage from './pages/Consultas/ConsultasPage.jsx'
import ConsultaDetallePage from './pages/Consultas/ConsultaDetallePage.jsx'
import ConsultaFormPage from './pages/Consultas/ConsultaFormPage.jsx'
import PacientesPage from './pages/Pacientes/PacientesPage.jsx'
import PacienteHistorialPage from './pages/Pacientes/PacienteHistorialPage.jsx'
import PersonalPage from './pages/Personal/PersonalPage.jsx'
import PersonalFormPage from './pages/Personal/PersonalFormPage.jsx'
import EmpresasPage from './pages/Empresas/EmpresasPage.jsx'
import ProtocolosPage from './pages/Protocolos/ProtocolosPage.jsx'
import ProtocoloFormPage from './pages/Protocolos/ProtocoloFormPage.jsx'
import ConfiguracionPage from './pages/Configuracion/ConfiguracionPage.jsx'

function SectionPage({ title, description }) {
  return (
    <main className="app-page">
      <section className="page-card">
        <span className="page-eyebrow">{APP_NAME}</span>
        <h1 className="page-title">{title}</h1>
        <p className="page-description">{description}</p>
      </section>
    </main>
  )
}

const pageFactory = (title, description) => () => (
  <SectionPage title={title} description={description} />
)

const MisConsultasPage = pageFactory(
  'Mis consultas',
  'Historial de atenciones asignadas al usuario autenticado.',
)

const MisAntecedentesPage = pageFactory(
  'Mis antecedentes',
  'Registro de antecedentes clínicos visibles para el paciente.',
)

const MiPerfilPage = pageFactory(
  'Mi perfil',
  'Información personal, rol activo y configuración básica de cuenta.',
)

const EmpresaPortalPage = pageFactory(
  'Portal de empresa',
  'Acceso para clientes con sus indicadores, consultas y documentos.',
)

function LoadingScreen() {
  return (
    <div className="screen-center">
      <div className="screen-message">
        <div className="screen-spinner" />
        <h1>Cargando sesión</h1>
        <p>Preparando el acceso seguro a la plataforma clínica.</p>
      </div>
    </div>
  )
}

function RootRedirect() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return <Navigate to={isAuthenticated ? ROUTES.dashboard : ROUTES.login} replace />
}

function App() {
  return (
    <Routes>
      <Route path={ROUTES.root} element={<RootRedirect />} />
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.dashboard} element={<DashboardPage />} />
        <Route path={ROUTES.consultas} element={<ConsultasPage />} />
        <Route path={ROUTES.consultaDetalle()} element={<ConsultaDetallePage />} />
        <Route path={ROUTES.consultaNueva} element={<ConsultaFormPage />} />
        <Route path={ROUTES.consultaEditar()} element={<ConsultaFormPage />} />
        <Route path={ROUTES.pacientes} element={<ProtectedRoute allowedRoles={[ROLES.MEDICO]}><PacientesPage /></ProtectedRoute>} />
        <Route path={ROUTES.pacienteHistorial()} element={<ProtectedRoute allowedRoles={[ROLES.MEDICO]}><PacienteHistorialPage /></ProtectedRoute>} />
        <Route path={ROUTES.personal} element={<ProtectedRoute allowedRoles={[ROLES.MEDICO]}><PersonalPage /></ProtectedRoute>} />
        <Route path={ROUTES.personalNuevo} element={<ProtectedRoute allowedRoles={[ROLES.MEDICO]}><PersonalFormPage /></ProtectedRoute>} />
        <Route path={ROUTES.personalEditar()} element={<ProtectedRoute allowedRoles={[ROLES.MEDICO]}><PersonalFormPage /></ProtectedRoute>} />
        <Route path={ROUTES.empresas} element={<ProtectedRoute allowedRoles={[ROLES.MEDICO, ROLES.ADMIN, ROLES.CLIENTE]}><EmpresasPage /></ProtectedRoute>} />
        <Route path={ROUTES.protocolos} element={<ProtectedRoute allowedRoles={[ROLES.MEDICO, ROLES.BIOLOGO, ROLES.ENFERMERO]}><ProtocolosPage /></ProtectedRoute>} />
        <Route path={ROUTES.protocoloNuevo} element={<ProtectedRoute allowedRoles={[ROLES.MEDICO]}><ProtocoloFormPage /></ProtectedRoute>} />
        <Route path={ROUTES.protocoloEditar()} element={<ProtectedRoute allowedRoles={[ROLES.MEDICO]}><ProtocoloFormPage /></ProtectedRoute>} />
        <Route
          path={ROUTES.configuracion}
          element={
            <ProtectedRoute allowedRoles={[ROLES.MEDICO]}>
              <ConfiguracionPage />
            </ProtectedRoute>
          }
        />
        <Route path={ROUTES.misConsultas} element={<MisConsultasPage />} />
        <Route path={ROUTES.misAntecedentes} element={<MisAntecedentesPage />} />
        <Route path={ROUTES.miPerfil} element={<MiPerfilPage />} />
        <Route path={ROUTES.empresaPortal} element={<EmpresaPortalPage />} />
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
    </Routes>
  )
}

export default App
