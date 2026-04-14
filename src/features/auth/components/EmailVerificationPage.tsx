import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '@/config/env';

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Obtenemos el token desde los parámetros de búsqueda
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      // Validación temprana del token
      if (!token || token.trim() === '') {
        console.error('Token no encontrado o vacío');
        setStatus('error');
        setMessage(t('auth.verify.tokenNotFoundMsg'));
        return;
      }

      // Evitar múltiples llamadas simultáneas
      if (isVerifying) return;
      
      setIsVerifying(true);

      try {
        const response = await fetch(`${API_BASE_URL}/usuario/auth/email/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: token.trim() }),
        });
        
        // Intentamos parsear la respuesta
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error('Error parseando respuesta JSON:', parseError);
          throw new Error(t('auth.verify.invalidResponse'));
        }

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || t('auth.verify.successMessage'));
          
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            navigate('/auth/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.detail || data.message || `Error del servidor (${response.status})`);
        }
      } catch (error) {
        console.error('Error verificando correo:', error);
        setStatus('error');
        
        if (error instanceof Error) {
          setMessage(`${t('auth.verify.connectionError')}: ${error.message}`);
        } else {
          setMessage(t('auth.verify.connectionErrorGeneric'));
        }
      } finally {
        setIsVerifying(false);
      }
    };

    // Solo ejecutar si tenemos un token
    if (token) {
      verifyEmail();
    }
}, [token, navigate, isVerifying]);

  // Si no hay token, mostrar error inmediatamente
  if (!token) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-red-600 mb-2">{t('auth.verify.tokenNotFound')}</h3>
        <p className="text-gray-700 mb-6">
          {t('auth.verify.tokenNotFoundDesc')}
        </p>
        <div className="space-y-3">
          <Link 
            to="/auth/sign_up"
            className="block bg-[#D95B26] text-white px-6 py-2 rounded-lg hover:bg-[#195083] transition-colors duration-200"
          >
            {t('auth.verify.registerAgain')}
          </Link>
          <Link 
            to="/auth/login"
            className="block bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            {t('auth.verify.goToLogin')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {status === 'loading' && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4894AD] mx-auto mb-4"></div>
          <p className="text-[#4894AD] text-lg">{t('auth.verify.verifying')}</p>
          <p className="text-sm text-gray-500 mt-2">Token: {token.substring(0, 10)}...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-green-600 mb-2">{t('auth.verify.successTitle')}</h3>
          <p className="text-gray-700 mb-6">{message}</p>
          <p className="text-sm text-gray-500 mb-4">
            {t('auth.verify.redirecting')}
          </p>
          <Link 
            to="/auth/login"
            className="inline-block bg-[#4894AD] text-white px-6 py-2 rounded-lg hover:bg-[#195083] transition-colors duration-200"
          >
            {t('auth.verify.goToLogin')}
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-red-600 mb-2">{t('auth.verify.errorTitle')}</h3>
          <p className="text-gray-700 mb-6">{message}</p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="block w-full bg-[#4894AD] text-white px-6 py-2 rounded-lg hover:bg-[#195083] transition-colors duration-200"
            >
              {t('auth.verify.tryAgain')}
            </button>
            <Link 
              to="/auth/sign_up"
              className="block bg-[#D95B26] text-white px-6 py-2 rounded-lg hover:bg-[#195083] transition-colors duration-200"
            >
              {t('auth.verify.registerAgain')}
            </Link>
            <Link 
              to="/auth/login"
              className="block bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              {t('auth.verify.goToLogin')}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCF7F0] px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-[#195083] mb-2">
            Reluzca
          </h1>
          <h2 className="text-2xl font-bold text-[#4894AD] mb-2">
            {t('auth.verify.title')}
          </h2>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <Suspense fallback={
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4894AD] mx-auto mb-4"></div>
              <p className="text-[#4894AD] text-lg">{t('common.loading')}</p>
            </div>
          }>
            <VerifyEmailContent />
          </Suspense>
        </div>

        <div className="text-center">
          <Link 
            to="/" 
            className="text-sm text-[#4894AD] hover:text-[#195083] transition-colors duration-200"
          >
            ← {t('common.backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}