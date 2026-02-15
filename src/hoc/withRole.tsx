"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


type UserRole = 'admin' | 'empleada' | 'cliente';

export function withAdminRole<P extends object>(Component: React.ComponentType<P>) {
  return function AdminProtected(props: P) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const token = localStorage.getItem("access_token");
          
          if (!token) {
            router.replace("/usuario/auth/login");
            return;
          }

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          if (res.status === 401) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            router.replace("/usuario/auth/login");
            return;
          }

          if (!res.ok) {
            router.replace("/unauthorized");
            return;
          }

          const data = await res.json();
          
          // El backend devuelve el usuario directamente, no envuelto en { user: {...} }
          if (data.rol !== 'admin') {
            router.replace("/unauthorized");
            return;
          }

          setAuthorized(true);
        } catch (error) {
          router.replace("/unauthorized");
        }
      };

      checkAuth();
    }, [router]);

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
    const router = useRouter();
    const [authorized, setAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const token = localStorage.getItem("access_token");
          
          if (!token) {
            router.replace("/usuario/auth/login");
            return;
          }

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (res.status === 401) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            router.replace("/usuario/auth/login");
            return;
          }

          if (!res.ok) {
            router.replace("/unauthorized");
            return;
          }

          const data = await res.json();
          
          // El backend devuelve el usuario directamente, no envuelto en { user: {...} }
          if (data.rol !== 'empleada') {
            router.replace("/unauthorized");
            return;
          }

          setAuthorized(true);
        } catch (error) {
          router.replace("/unauthorized");
        }
      };

      checkAuth();
    }, [router]);

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
    const router = useRouter();
    const [authorized, setAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
      const checkAuth = () => {
        try {
          // Validación simplificada: solo verifica localStorage
          const userStr = localStorage.getItem("user");
          
          if (!userStr) {
            router.replace("/usuario/auth/login");
            return;
          }

          const userData = JSON.parse(userStr);
          
          // Verificar que tenga rol de cliente
          if (userData.rol !== 'cliente') {
            router.replace("/unauthorized");
            return;
          }

          setAuthorized(true);
        } catch (error) {
          router.replace("/usuario/auth/login");
        }
      };

      checkAuth();
    }, [router]);

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