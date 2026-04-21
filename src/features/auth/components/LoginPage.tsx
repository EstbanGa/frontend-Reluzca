import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '@/services/http/client';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Home, AlertCircle, CheckCircle } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    nombre: string;
    apellido: string;
    correo: string;
    rol: 'admin' | 'cliente' | 'empleada';
    estado: string;
    [key: string]: string | number | boolean | null | undefined;
  };
  expires_in: number;
  message: string;
}

export default function SignInPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'warning'>('success');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Limpiar mensaje cuando el usuario empiece a escribir
    if (message) setMessage('');
  };

  const validateForm = (): boolean => {
    if (!form.email.trim()) {
      setMessage(t('auth.login.errors.emailRequired'));
      setMessageType('error');
      return false;
    }

    if (!form.password) {
      setMessage(t('auth.login.errors.passwordRequired'));
      setMessageType('error');
      return false;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setMessage(t('auth.login.errors.invalidEmail'));
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
      const response: LoginResponse = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      // Guardar token en localStorage
      localStorage.setItem('access_token', response.access_token);
      
      // Obtener información del usuario con el token
      const userResponse = await apiFetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${response.access_token}`,
        },
      });
      
      localStorage.setItem('user', JSON.stringify(userResponse));

      setMessage(t('auth.login.success'));
      setMessageType('success');

      // Redireccionar según el rol después de 1.5 segundos
      setTimeout(() => {
        const dashboardRoutes: Record<string, string> = {
          'admin': '/admin/index',
          'empleada': '/empleada/index',
          'cliente': '/cliente/index'
        };

        const route = dashboardRoutes[userResponse.rol] || '/';
        navigate(route);
      }, 1500);

    } catch (error: unknown) {
      console.error('❌ Error en login:', error);
      const err = error as { message?: string; status?: number };
      
      let errorMessage = t('auth.login.errors.generic');
      let errorType: 'error' | 'warning' = 'error';
      
      // Verificar si el error contiene HTML (error de Django sin procesar)
      if (typeof err.message === 'string' && err.message.includes('<!DOCTYPE html>')) {
        console.error('Error de servidor Django detectado');
        errorMessage = t('auth.login.errors.server');
        
        // Log completo para desarrollo
        if (process.env.NODE_ENV === 'development') {
          console.error('Error HTML completo:', err.message);
        }
      } else if (err.message) {
        errorMessage = err.message;
        
        // Casos especiales
        if (err.message.includes('pendiente de verificación')) {
          errorType = 'warning';
        }
      } else if (err.status) {
        switch (err.status) {
          case 401:
            errorMessage = t('auth.login.errors.credentials');
            break;
          case 403:
            errorMessage = t('auth.login.errors.pendingVerification');
            errorType = 'warning';
            break;
          case 500:
            errorMessage = t('auth.login.errors.serverLate');
            break;
          case 404:
            errorMessage = t('auth.login.errors.notFound');
            break;
          default:
            errorMessage = t('auth.login.errors.connection');
        }
      }
      
      setMessage(errorMessage);
      setMessageType(errorType);
    } finally {
      setLoading(false);
    }
  };

  const getMessageIcon = () => {
    switch (messageType) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF7F0] flex items-center justify-center p-4">
      {/* Top bar */}
      <div className="fixed top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between z-10">
        <a 
          href="/" 
          className="flex items-center space-x-2 text-[#4894AD] hover:text-[#195083] transition-colors group"
        >
          <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">{t('auth.backToHome')}</span>
        </a>
        <LanguageSwitcher />
      </div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4894AD] to-[#195083] px-8 py-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{t('auth.login.title')}</h1>
          <p className="text-white/80 text-sm">{t('auth.login.subtitle')}</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[#195083]">
                {t('auth.login.emailLabel')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4894AD]/70" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                             text-[#195083] placeholder-gray-500 
                             focus:ring-2 focus:ring-[#4894AD] focus:border-transparent 
                             outline-none transition-all disabled:bg-gray-100"
                  placeholder={t('auth.login.emailPlaceholder')}
                  disabled={loading}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[#195083]">
                {t('auth.login.passwordLabel')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4894AD]/70" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg 
                             text-[#195083] placeholder-gray-500 
                             focus:ring-2 focus:ring-[#4894AD] focus:border-transparent 
                             outline-none transition-all disabled:bg-gray-100"
                  placeholder={t('auth.login.passwordPlaceholder')}
                  disabled={loading}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4894AD]/70 hover:text-[#195083] transition-colors disabled:opacity-50"
                  disabled={loading}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
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
                  <span>{t('auth.login.submitting')}</span>
                </div>
              ) : (
                <>
                  <span>{t('auth.login.submit')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Message */}
          {message && (
            <div className={`mt-6 p-4 rounded-lg text-sm flex items-center space-x-2 ${
              messageType === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : messageType === 'warning'
                ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {getMessageIcon()}
              <span>{message}</span>
            </div>
          )}

          {/* Forgot Password Link */}
          <div className="mt-6 text-center">
            <button
              type="button"
              className="text-[#4894AD] hover:text-[#195083] text-sm font-medium transition-colors hover:underline"
            >
              {t('auth.login.forgotPassword')}
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              {t('auth.login.noAccount')}{' '}
              <Link
                to="/auth/sign_up"
                className="text-[#4894AD] hover:text-[#195083] font-medium transition-colors hover:underline"
              >
                {t('auth.login.createAccount')}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#D95B26]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#4894AD]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#195083]/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-center w-full text-xs text-gray-500">
        {t('common.footer.copyright', { year: new Date().getFullYear() })}
      </footer>
    </div>
  );
}