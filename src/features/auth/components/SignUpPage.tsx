import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '@/services/http/client';
import { Link } from 'react-router-dom';
import LanguageSwitcher from '@/components/LanguageSwitcher';
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
  UserCheck
} from 'lucide-react';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
    rol: 'cliente', // Automáticamente cliente
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
    if (!isPasswordValid) {
      setMessage(t('auth.signup.errors.passwordReqs'));
      setMessageType('error');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setMessage(t('auth.signup.errors.passwordMismatch'));
      setMessageType('error');
      return false;
    }
    if (form.documento.length < 5) {
      setMessage(t('auth.signup.errors.documentMinLength'));
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
      
      setMessage(t('auth.signup.success'));
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
        rol: 'cliente',
      });

    } catch (err: unknown) {
      console.error("❌ Error al registrar:", err);
      const error = err as { message?: string };
      setMessage(error.message || t('auth.signup.errors.generic'));
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF7F0] flex flex-col">
      {/* Top bar */}
      <div className="fixed top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between z-10">
        <Link 
          to="/" 
          className="flex items-center space-x-2 text-[#4894AD] hover:text-[#195083] transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="font-medium hidden sm:inline">{t('auth.backToHome')}</span>
        </Link>
        <LanguageSwitcher />
      </div>

      {/* Contenedor principal con flex-grow */}
      <div className="flex-grow flex items-center justify-center p-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4894AD] to-[#195083] px-4 md:px-8 py-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white mb-2">{t('auth.signup.title')}</h1>
          <p className="text-white/80 text-sm">{t('auth.signup.subtitle')}</p>
        </div>

        {/* Form */}
        <div className="p-4 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#195083]">
                  {t('auth.signup.nameLabel')}
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
                    placeholder={t('auth.signup.namePlaceholder')}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#195083]">
                  {t('auth.signup.lastNameLabel')}
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
                    placeholder={t('auth.signup.lastNamePlaceholder')}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#195083]">
                {t('auth.signup.emailLabel')}
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
                  placeholder={t('auth.signup.emailPlaceholder')}
                  required
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#195083]">
                  {t('auth.signup.passwordLabel')}
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
                    placeholder={t('auth.signup.passwordPlaceholder')}
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
                  {t('auth.signup.confirmPasswordLabel')}
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
                    placeholder={t('auth.signup.confirmPasswordPlaceholder')}
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
                <p className="text-sm font-medium text-[#195083] mb-3">{t('auth.signup.passwordReqs.title')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center space-x-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-red-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.minLength ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>{t('auth.signup.passwordReqs.minLength')}</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-red-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.hasUppercase ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>{t('auth.signup.passwordReqs.uppercase')}</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-red-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.hasLowercase ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>{t('auth.signup.passwordReqs.lowercase')}</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.hasNumber ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>{t('auth.signup.passwordReqs.number')}</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordValidation.hasSymbol ? 'text-green-600' : 'text-red-500'} sm:col-span-2`}>
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.hasSymbol ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>{t('auth.signup.passwordReqs.symbol')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Documento y Teléfono */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#195083]">
                  {t('auth.signup.documentLabel')}
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
                    placeholder={t('auth.signup.documentPlaceholder')}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#195083]">
                  {t('auth.signup.phoneLabel')}
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
                    placeholder={t('auth.signup.phonePlaceholder')}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Tipo de persona */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#195083]">
                {t('auth.signup.personTypeLabel')}
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
                  <option value="">{t('auth.signup.personTypes.select')}</option>
                  <option value="natural">{t('auth.signup.personTypes.natural')}</option>
                  <option value="juridica">{t('auth.signup.personTypes.legal')}</option>
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
                {t('auth.signup.birthDateLabel')}
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
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t('auth.signup.submitting')}</span>
                </div>
              ) : (
                <>
                  <span>{t('auth.signup.submit')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

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
                  onClick={() => navigate('/auth/login')}
                  className="block w-full mt-3 bg-[#4894AD] hover:bg-[#195083] text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  {t('auth.signup.goToLoginBtn')}
                </button>
              )}
            </div>
          )}

          {/* Sign In Link */}
          <div className="mt-6 md:mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              {t('auth.signup.hasAccount')}{' '}
              <Link
                to="/auth/login"
                className="text-[#4894AD] hover:text-[#195083] font-medium transition-colors"
              >
                {t('auth.signup.goToLogin')}
              </Link>
            </p>
          </div>
        </div>
      </div>
      </div>

      {/* Footer - Ahora fuera del contenedor principal */}
      <footer className="text-center py-4 text-xs text-gray-500 bg-[#FCF7F0]">
        {t('common.footer.copyright', { year: new Date().getFullYear() })}
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