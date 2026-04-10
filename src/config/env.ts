/**
 * Configuración centralizada de la aplicación
 */

// URL base del API backend
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Otras configuraciones
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
