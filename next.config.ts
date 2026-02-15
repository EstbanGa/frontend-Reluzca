import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Requerido para export estático
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Comentado ya que rewrites no funciona con export estático
  // Deberás configurar las rutas API directamente en tu código o usar variables de entorno
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://127.0.0.1:8000/api/:path*',
  //     },
  //   ];
  // },
};

export default nextConfig;
