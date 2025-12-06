/**
 * Date Helpers - Centralisation des conversions Date/string
 * Résout les 3 problèmes racines identifiés dans l'audit
 * BMad Method - Chunk 12 & 14 Implementation
 */

// Union type pour flexibilité d'entrée
export type DateInput = Date | string | number;

/**
 * Convertit n'importe quel input date en string ISO
 * Résout: Conversions Date→string redondantes
 */
export function toISOString(date: DateInput): string {
  if (!date) return new Date().toISOString();
  
  if (date instanceof Date) {
    return date.toISOString();
  }
  
  if (typeof date === 'string') {
    return new Date(date).toISOString();
  }
  
  if (typeof date === 'number') {
    return new Date(date).toISOString();
  }
  
  return new Date().toISOString();
}

/**
 * Parse sécurisé de date avec validation
 * Résout: Guards défensifs multiples
 */
export function parseDate(date: DateInput): Date {
  if (!date) return new Date();
  
  if (date instanceof Date) {
    return isValidDate(date) ? date : new Date();
  }
  
  const parsed = new Date(date);
  return isValidDate(parsed) ? parsed : new Date();
}

/**
 * Validation robuste de date
 */
export function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Format d'affichage français DD/MM/YYYY
 */
export function formatDisplay(date: DateInput): string {
  const parsedDate = parseDate(date);
  return parsedDate.toLocaleDateString('fr-FR');
}

/**
 * Format date-time français DD/MM/YYYY HH:MM
 */
export function formatDateTime(date: DateInput): string {
  const parsedDate = parseDate(date);
  return parsedDate.toLocaleDateString('fr-FR') + ' ' + 
         parsedDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Format pour input HTML date (YYYY-MM-DD)
 */
export function toInputValue(date: DateInput): string {
  const parsedDate = parseDate(date);
  return parsedDate.toISOString().split('T')[0];
}

/**
 * Format pour input HTML datetime-local (YYYY-MM-DDTHH:MM)
 */
export function toDateTimeInputValue(date: DateInput): string {
  const parsedDate = parseDate(date);
  const offset = parsedDate.getTimezoneOffset();
  const localDate = new Date(parsedDate.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().slice(0, 16);
}

/**
 * Comparaison jour uniquement (ignore heures)
 */
export function isSameDay(date1: DateInput, date2: DateInput): boolean {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

/**
 * Vérifie si date est aujourd'hui
 */
export function isToday(date: DateInput): boolean {
  return isSameDay(date, new Date());
}

/**
 * Vérifie si date est dans le futur
 */
export function isFuture(date: DateInput): boolean {
  return parseDate(date).getTime() > Date.now();
}

/**
 * Vérifie si date est dans le passé
 */
export function isPast(date: DateInput): boolean {
  return parseDate(date).getTime() < Date.now();
}

/**
 * Ajoute des jours à une date
 */
export function addDays(date: DateInput, days: number): Date {
  const result = parseDate(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Différence en jours entre deux dates
 */
export function daysDifference(date1: DateInput, date2: DateInput): number {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format temps relatif (il y a X heures/jours)
 */
export function formatRelative(date: DateInput): string {
  const parsedDate = parseDate(date);
  const now = new Date();
  const diffMs = now.getTime() - parsedDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  }
  
  if (diffHours > 0) {
    return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  }
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes > 0) {
    return `il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  }
  
  return 'à l\'instant';
}

// Export par défaut pour compatibilité
export default {
  toISOString,
  parseDate,
  isValidDate,
  formatDisplay,
  formatDateTime,
  toInputValue,
  toDateTimeInputValue,
  isSameDay,
  isToday,
  isFuture,
  isPast,
  addDays,
  daysDifference,
  formatRelative
};
