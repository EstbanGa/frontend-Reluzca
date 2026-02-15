/**
 * Utilidades para manejo de fechas sin problemas de zona horaria
 */

/**
 * Formatea una fecha sin aplicar conversión de zona horaria
 * @param dateString - Fecha en formato string (YYYY-MM-DD o ISO)
 * @param options - Opciones de formato
 * @returns Fecha formateada
 */
export function formatDate(
  dateString: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string {
  if (!dateString) return 'N/A';
  
  // Si la fecha viene sin hora (YYYY-MM-DD), agregarle T00:00:00 para que se interprete como local
  let dateToFormat = dateString;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    dateToFormat = `${dateString}T00:00:00`;
  }
  
  return new Date(dateToFormat).toLocaleDateString('es-CO', options);
}

/**
 * Formatea una fecha con hora sin aplicar conversión de zona horaria
 * @param dateString - Fecha en formato ISO
 * @returns Fecha y hora formateadas
 */
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  
  return new Date(dateString).toLocaleString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formatea solo la hora
 * @param timeString - Hora en formato HH:MM:SS o HH:MM
 * @returns Hora formateada
 */
export function formatTime(timeString: string | null | undefined): string {
  if (!timeString) return 'N/A';
  
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formatea fecha para modales con fecha y hora completa
 * @param dateString - Fecha en formato ISO
 * @returns Fecha y hora formateadas
 */
export function formatDateForModal(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  
  return new Date(dateString).toLocaleString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
