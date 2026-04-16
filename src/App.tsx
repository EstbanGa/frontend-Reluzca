import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from '@/features/landing/components/LandingPage';
import LoginPage from '@/features/auth/components/LoginPage';
import SignUpPage from '@/features/auth/components/SignUpPage';
import EmailVerificationPage from '@/features/auth/components/EmailVerificationPage';
import UnauthorizedPage from '@/features/auth/components/UnauthorizedPage';

import AdminLayout from '@/features/admin/components/AdminLayout';
import AdminDashboard from '@/features/admin/components/AdminDashboard';
import AdminUsuarios from '@/features/admin/components/AdminUsuarios';
import AdminUsuarioDetalle from '@/features/admin/components/AdminUsuarioDetalle';
import AdminEditarUsuario from '@/features/admin/components/AdminEditarUsuario';
import AdminCrearUsuario from '@/features/admin/components/AdminCrearUsuario';
import AdminReservas from '@/features/admin/components/AdminReservas';
import AdminEditarReserva from '@/features/admin/components/AdminEditarReserva';
import AdminPlanesActividades from '@/features/admin/components/AdminPlanesActividades';
import AdminPQRS from '@/features/admin/components/AdminPQRS';
import AdminNotificaciones from '@/features/admin/components/AdminNotificaciones';
import AdminConfiguracion from '@/features/admin/components/AdminConfiguracion';

import ClienteLayout from '@/features/cliente/components/ClienteLayout';
import ClienteDashboard from '@/features/cliente/components/ClienteDashboard';
import ClienteReservas from '@/features/cliente/components/ClienteReservas';
import ClienteCrearReserva from '@/features/cliente/components/ClienteCrearReserva';
import ClienteEditarReserva from '@/features/cliente/components/ClienteEditarReserva';
import ClienteUbicaciones from '@/features/cliente/components/ClienteUbicaciones';
import ClienteCrearUbicacion from '@/features/cliente/components/ClienteCrearUbicacion';
import ClienteCalificaciones from '@/features/cliente/components/ClienteCalificaciones';
import ClienteNotificaciones from '@/features/cliente/components/ClienteNotificaciones';
import ClientePQRS from '@/features/cliente/components/ClientePQRS';
import ClientePerfil from '@/features/cliente/components/ClientePerfil';

import EmpleadaLayout from '@/features/empleada/components/EmpleadaLayout';
import EmpleadaDashboard from '@/features/empleada/components/EmpleadaDashboard';
import EmpleadaReservas from '@/features/empleada/components/EmpleadaReservas';
import EmpleadaReservaActiva from '@/features/empleada/components/EmpleadaReservaActiva';
import EmpleadaCalificaciones from '@/features/empleada/components/EmpleadaCalificaciones';
import EmpleadaNotificaciones from '@/features/empleada/components/EmpleadaNotificaciones';
import EmpleadaGanancias from '@/features/empleada/components/EmpleadaGanancias';
import EmpleadaPerfil from '@/features/empleada/components/EmpleadaPerfil';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/sign_up" element={<SignUpPage />} />
        <Route path="/auth/email" element={<EmailVerificationPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="index" element={<AdminDashboard />} />
          <Route path="usuarios/index" element={<AdminUsuarios />} />
          <Route path="usuarios/crear" element={<AdminCrearUsuario />} />
          <Route path="usuarios/editar" element={<AdminEditarUsuario />} />
          <Route path="usuarios/detalle/:id" element={<AdminUsuarioDetalle />} />
          <Route path="reservas/index" element={<AdminReservas />} />
          <Route path="reservas/editar" element={<AdminEditarReserva />} />
          <Route path="planes/index" element={<AdminPlanesActividades />} />
          <Route path="pqrs/index" element={<AdminPQRS />} />
          <Route path="notificaciones/index" element={<AdminNotificaciones />} />
          <Route path="configuracion/index" element={<AdminConfiguracion />} />
          <Route index element={<Navigate to="index" replace />} />
        </Route>

        {/* Cliente */}
        <Route path="/cliente" element={<ClienteLayout />}>
          <Route path="index" element={<ClienteDashboard />} />
          <Route path="reservas/index" element={<ClienteReservas />} />
          <Route path="reservas/crear" element={<ClienteCrearReserva />} />
          <Route path="reservas/editar" element={<ClienteEditarReserva />} />
          <Route path="ubicaciones/index" element={<ClienteUbicaciones />} />
          <Route path="ubicaciones/crear" element={<ClienteCrearUbicacion />} />
          <Route path="calificaciones/index" element={<ClienteCalificaciones />} />
          <Route path="notificaciones/index" element={<ClienteNotificaciones />} />
          <Route path="pqrs/index" element={<ClientePQRS />} />
          <Route path="perfil" element={<ClientePerfil />} />
          <Route index element={<Navigate to="index" replace />} />
        </Route>

        {/* Empleada */}
        <Route path="/empleada" element={<EmpleadaLayout />}>
          <Route path="index" element={<EmpleadaDashboard />} />
          <Route path="reservas/index" element={<EmpleadaReservas />} />
          <Route path="reserva-activa" element={<EmpleadaReservaActiva />} />
          <Route path="calificaciones/index" element={<EmpleadaCalificaciones />} />
          <Route path="notificaciones/index" element={<EmpleadaNotificaciones />} />
          <Route path="ganancias/index" element={<EmpleadaGanancias />} />
          <Route path="perfil" element={<EmpleadaPerfil />} />
          <Route index element={<Navigate to="index" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
