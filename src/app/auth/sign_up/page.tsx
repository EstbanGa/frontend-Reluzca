'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight, 
  Home, 
  User, 
  FileText, 
  Phone, 
  Calendar,
  UserCheck,
  Users
} from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    documento: '',
    telefono: '',
    tipo_persona: '',
    fecha_nacimiento: '',
    rol: '', // Nuevo campo para el rol
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (message) setMessage('');
  };

  // Validaciones de contraseña en tiempo real
  const passwordValidation = {
    hasUppercase: /[A-Z]/.test(form.password),
    hasLowercase: /[a-z]/.test(form.password),
    hasNumber: /\d/.test(form.password),
    hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(form.password),
    minLength: form.password.length >= 8,
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const validateForm = () => {
    if (!form.rol) {
      setMessage('Debes seleccionar si eres Cliente o Empleada');
      setMessageType('error');
      return false;
    }
    if (!isPasswordValid) {
      setMessage('La contraseña no cumple con todos los requisitos');
      setMessageType('error');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      setMessageType('error');
      return false;
    }
    if (form.documento.length < 5) {
      setMessage('El documento debe tener al menos 5 caracteres');
      setMessageType('error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          nombre: form.nombre,
          apellido: form.apellido,
          documento: form.documento,
          telefono: form.telefono,
          tipo_persona: form.tipo_persona,
          fecha_nacimiento: form.fecha_nacimiento,
          rol: form.rol, // Enviamos el rol seleccionado
        }),
      });
      
      setMessage('Usuario creado correctamente');
      setMessageType('success');
      
      setForm({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        confirmPassword: '',
        documento: '',
        telefono: '',
        tipo_persona: '',
        fecha_nacimiento: '',
        rol: '',
      });

    } catch (err: unknown) {
      console.error("❌ Error al registrar:", err);
      const error = err as { message?: string };
      setMessage(error.message || 'Error al crear la cuenta. Intenta nuevamente.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF7F0] flex flex-col">
      {/* Botón de regreso al inicio */}
      <Link 
        href="/" 
        className="fixed top-4 left-4 md:top-6 md:left-6 flex items-center space-x-2 text-[#4894AD] hover:text-[#195083] transition-colors z-10"
      >
        <Home className="w-5 h-5" />
        <span className="font-medium hidden sm:inline">Volver al inicio</span>
      </Link>

      {/* Contenedor principal con flex-grow */}
      <div className="flex-grow flex items-center justify-center p-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4894AD] to-[#195083] px-4 md:px-8 py-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white mb-2">Crear Cuenta</h1>
          <p className="text-white/80 text-sm">Únete a la comunidad Reluzca</p>
        </div>

        {/* Form */}
        <div className="p-4 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rol de usuario - Nuevo campo al inicio */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#195083]">
                ¿Cómo te quieres registrar?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div 
                  className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    form.rol === 'cliente' 
                      ? 'border-[#4894AD] bg-[#4894AD]/5' 
                      : 'border-gray-300 hover:border-[#4894AD]/50'
                  }`}
                  onClick={() => setForm({ ...form, rol: 'cliente' })}
                >
                  <input
                    type="radio"
                    name="rol"
                    value="cliente"
                    checked={form.rol === 'cliente'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      form.rol === 'cliente' ? 'bg-[#4894AD] text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-[#195083]">Cliente</p>
                      <p className="text-xs text-gray-500">Busco servicios de belleza</p>
                    </div>
                  </div>
                  {form.rol === 'cliente' && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#4894AD] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                <div 
                  className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    form.rol === 'empleada' 
                      ? 'border-[#D95B26] bg-[#D95B26]/5' 
                      : 'border-gray-300 hover:border-[#D95B26]/50'
                  }`}
                  onClick={() => setForm({ ...form, rol: 'empleada' })}
                >
                  <input
                    type="radio"
                    name="rol"
                    value="empleada"
                    checked={form.rol === 'empleada'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      form.rol === 'empleada' ? 'bg-[#D95B26] text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-[#195083]">Empleada</p>
                      <p className="text-xs text-gray-500">Ofrezco servicios de belleza</p>
                    </div>
                  </div>
                  {form.rol === 'empleada' && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#D95B26] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#195083]">
                  Nombre
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4894AD]/70" />
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                               text-[#195083] placeholder-gray-500 
                               focus:ring-2 focus:ring-[#4894AD] focus:border-transparent 
                               outline-none transition-all"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#195083]">
                  Apellido
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4894AD]/70" />
                  <input
                    type="text"
                    name="apellido"
                    value={form.apellido}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                               text-[#195083] placeholder-gray-500 
                               focus:ring-2 focus:ring-[#4894AD] focus:border-transparent 
                               outline-none transition-all"
                    placeholder="Tu apellido"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#195083]">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4894AD]/70" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                             text-[#195083] placeholder-gray-500 
                             focus:ring-2 focus:ring-[#4894AD] focus:border-transparent 
                             outline-none transition-all"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#195083]">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4894AD]/70" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg 
                               text-[#195083] placeholder-gray-500 
                               focus:ring-2 focus:ring-[#4894AD] focus:border-transparent 
                               outline-none transition-all"
                    placeholder="Contraseña segura"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4894AD]/70 hover:text-[#195083] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#195083]">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4894AD]/70" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg 
                               text-[#195083] placeholder-gray-500 
                               focus:ring-2 focus:ring-[#4894AD] focus:border-transparent 
                               outline-none transition-all"
                    placeholder="Repetir contraseña"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4894AD]/70 hover:text-[#195083] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Validación de contraseña en tiempo real */}
            {form.password && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-[#195083] mb-3">Requisitos de contraseña:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center space-x-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-red-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.minLength ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Mínimo 8 caracteres</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-red-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.hasUppercase ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Una mayúscula (A-Z)</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-red-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.hasLowercase ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Una minúscula (a-z)</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.hasNumber ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Un número (0-9)</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordValidation.hasSymbol ? 'text-green-600' : 'text-red-500'} sm:col-span-2`}>
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.hasSymbol ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Un símbolo (!@#$%^&*)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Documento y Teléfono */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#195083]">
                  Documento
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4894AD]/70" />
                  <input
                    type="text"
                    name="documento"
                    value={form.documento}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                               text-[#195083] placeholder-gray-500 
                               focus:ring-2 focus:ring-[#4894AD] focus:border-transparent 
                               outline-none transition-all"
                    placeholder="Número de documento"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#195083]">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4894AD]/70" />
                  <input
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                               text-[#195083] placeholder-gray-500 
                               focus:ring-2 focus:ring-[#4894AD] focus:border-transparent 
                               outline-none transition-all"
                    placeholder="Número de teléfono"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Tipo de persona */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#195083]">
                Tipo de persona
              </label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4894AD]/70" />
                <select
                  name="tipo_persona"
                  onChange={handleChange}
                  value={form.tipo_persona}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                             text-[#195083] 
                             focus:ring-2 focus:ring-[#4894AD] focus:border-transparent 
                             outline-none transition-all bg-white appearance-none cursor-pointer"
                  required
                >
                  <option value="">Seleccione tipo de persona</option>
                  <option value="natural">Persona Natural</option>
                  <option value="juridica">Persona Jurídica</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-[#4894AD]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Fecha de nacimiento */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#195083]">
                Fecha de nacimiento
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4894AD]/70" />
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={form.fecha_nacimiento}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                             text-[#195083] 
                             focus:ring-2 focus:ring-[#4894AD] focus:border-transparent 
                             outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#D95B26] hover:bg-[#D95B26]/90 text-white py-3 px-4 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group"
              disabled={loading || !form.rol}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creando cuenta...</span>
                </div>
              ) : (
                <>
                  <span>Crear Cuenta</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {!form.rol && (
              <p className="text-sm text-red-500 text-center -mt-2">
                Por favor selecciona cómo te quieres registrar
              </p>
            )}
          </form>

          {/* Message */}
          {message && (
            <div className={`mt-6 p-4 rounded-lg text-sm text-center ${
              messageType === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
              {messageType === 'success' && (
                <button
                  onClick={() => router.push('/auth/login')}
                  className="block w-full mt-3 bg-[#4894AD] hover:bg-[#195083] text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Ir a iniciar sesión
                </button>
              )}
            </div>
          )}

          {/* Sign In Link */}
          <div className="mt-6 md:mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link
                href="/auth/login"
                className="text-[#4894AD] hover:text-[#195083] font-medium transition-colors"
              >
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
      </div>

      {/* Footer - Ahora fuera del contenedor principal */}
      <footer className="text-center py-4 text-xs text-gray-500 bg-[#FCF7F0]">
        © {new Date().getFullYear()} Reluzca. Todos los derechos reservados.
      </footer>

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#D95B26]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#4894AD]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#195083]/10 rounded-full blur-2xl"></div>
      </div>

    </div>
  );
}