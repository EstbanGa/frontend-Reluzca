
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { tokenStorage } from "@/services/auth/tokenStorage";


type UserRole = 'admin' | 'empleada' | 'cliente';

export function withAdminRole<P extends object>(Component: React.ComponentType<P>) {
  return function AdminProtected(props: P) {
    const navigate = useNavigate();
    const [authorized, setAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const token = tokenStorage.getToken();
          
          if (!token) {
            navigate('/auth/login', { replace: true });
            return;
          }

          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/auth/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          if (res.status === 401) {
            tokenStorage.clear();
            navigate('/auth/login', { replace: true });
            return;
          }

          if (!res.ok) {
            navigate('/unauthorized', { replace: true });
            return;
          }

          const data = await res.json();
          
          // El backend devuelve el usuario directamente, no envuelto en { user: {...} }
          if (data.rol !== 'admin') {
            navigate('/unauthorized', { replace: true });
            return;
          }

          setAuthorized(true);
        } catch (error) {
          navigate('/unauthorized', { replace: true });
        }
      };

      checkAuth();
    }, [navigate]);

    if (authorized === null) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4894AD]"></div>
        </div>
      );
    }

    if (!authorized) return null;

    return <Component {...props} />;
  };
}

export function withEmpleadaRole<P extends object>(Component: React.ComponentType<P>) {
  return function EmpleadaProtected(props: P) {
    const navigate = useNavigate();
    const [authorized, setAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const token = tokenStorage.getToken();
          
          if (!token) {
            navigate('/auth/login', { replace: true });
            return;
          }

          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/auth/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (res.status === 401) {
            tokenStorage.clear();
            navigate('/auth/login', { replace: true });
            return;
          }

          if (!res.ok) {
            navigate('/unauthorized', { replace: true });
            return;
          }

          const data = await res.json();
          
          // El backend devuelve el usuario directamente, no envuelto en { user: {...} }
          if (data.rol !== 'empleada') {
            navigate('/unauthorized', { replace: true });
            return;
          }

          setAuthorized(true);
        } catch (error) {
          navigate('/unauthorized', { replace: true });
        }
      };

      checkAuth();
    }, [navigate]);

    if (authorized === null) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4894AD]"></div>
        </div>
      );
    }

    if (!authorized) return null;

    return <Component {...props} />;
  };
}

export function withClienteRole<P extends object>(Component: React.ComponentType<P>) {
  return function ClienteProtected(props: P) {
    const navigate = useNavigate();
    const [authorized, setAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const token = tokenStorage.getToken();
          
          if (!token) {
            navigate('/auth/login', { replace: true });
            return;
          }

          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/auth/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (res.status === 401) {
            tokenStorage.clear();
            navigate('/auth/login', { replace: true });
            return;
          }

          if (!res.ok) {
            navigate('/unauthorized', { replace: true });
            return;
          }

          const data = await res.json();
          
          // El backend devuelve el usuario directamente, no envuelto en { user: {...} }
          if (data.rol !== 'cliente') {
            navigate('/unauthorized', { replace: true });
            return;
          }

          setAuthorized(true);
        } catch (error) {
          navigate('/unauthorized', { replace: true });
        }
      };

      checkAuth();
    }, [navigate]);

    if (authorized === null) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4894AD]"></div>
        </div>
      );
    }

    if (!authorized) return null;

    return <Component {...props} />;
  };
}