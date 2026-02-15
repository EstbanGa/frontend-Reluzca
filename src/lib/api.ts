export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("access_token");

  // Normalizar headers
  let extraHeaders: Record<string, string> = {};
  if (options.headers instanceof Headers) {
    extraHeaders = Object.fromEntries(options.headers.entries());
  } else if (Array.isArray(options.headers)) {
    extraHeaders = Object.fromEntries(options.headers);
  } else if (options.headers) {
    extraHeaders = options.headers as Record<string, string>;
  }

  // Endpoints que NO necesitan token
  const publicEndpoints = ["/api/auth/register", "/api/auth/login/json"];

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders,
    ...(token && !publicEndpoints.includes(endpoint)
      ? { Authorization: `Bearer ${token}` }
      : {}),
  };

  // 🔍 DEBUG: Verificar URL completa
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, ''); // Eliminar barra final
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`; // Asegurar barra inicial
  const fullUrl = `${apiUrl}${cleanEndpoint}`;
  
  console.log('🔍 API Debug:', {
    apiUrl,
    endpoint,
    fullUrl,
    hasToken: !!token,
    method: options.method || 'GET'
  });

  // ⚠️ Validación crítica
  if (!apiUrl) {
    const errorMsg = '❌ NEXT_PUBLIC_API_URL no está definida. Verifica tu archivo .env.local';
    console.error(errorMsg);
    throw new Error('Error de configuración: URL del API no definida. Contacta con soporte.');
  }

  if (apiUrl === 'undefined' || apiUrl === 'null') {
    console.error('❌ NEXT_PUBLIC_API_URL tiene un valor inválido:', apiUrl);
    throw new Error('Error de configuración del servidor. Recarga la página.');
  }

  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers,
    });

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { message: text };
    }

    if (!res.ok) {
      const errorMessage =
        data?.message ||
        data?.error ||
        `Error ${res.status}: ${res.statusText}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // Si es un error de red (no se pudo conectar)
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('❌ Error de red:', {
        url: fullUrl,
        posiblesCausas: [
          'Backend no está corriendo',
          'URL incorrecta en .env.local',
          'Problema de CORS',
          'Sin conexión a internet'
        ]
      });
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté activo.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error de conexión. Verifica tu internet.");
  }
}

// Función auxiliar para logout (eliminar token)
export function logout() {
  localStorage.removeItem('access_token');
  window.location.href = '/auth/login';
}

// Función auxiliar para verificar si hay token
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('access_token');
}