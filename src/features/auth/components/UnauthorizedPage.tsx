
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#FCF7F0] to-[#4894AD]/10 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md text-center">
        <div className="flex justify-center mb-4">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Acceso no autorizado
        </h1>
        <p className="text-gray-600 mb-6">
          No tienes permisos para acceder a esta página.
        </p>
        <div className="flex flex-col space-y-3">
          <Link
            to="/auth/login"
            className="w-full flex items-center justify-center space-x-2 bg-[#4894AD] text-white py-2 rounded-lg hover:bg-[#195083] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ir al inicio de sesión</span>
          </Link>
          <Link
            to="/"
            className="w-full text-[#4894AD] hover:underline"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
