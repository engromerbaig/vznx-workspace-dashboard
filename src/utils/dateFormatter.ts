// utils/dateFormatter.ts

/**
 * Global date and time formatter utilities with MongoDB compatibility
 * Provides consistent current time handling and date operations
 */

/**
 * Get the current date/time consistently across the application
 * This ensures all "now" references use the same method
 */
export const getCurrentDateTime = (): Date => {
  return new Date();
};

/**
 * Get current date/time as UTC ISO string for MongoDB operations
 */
export const getCurrentDateTimeUTC = (): string => {
  return new Date().toISOString();
};

/**
 * Get current date/time as MongoDB Date object
 * Use this when inserting dates into MongoDB documents
 */
export const getMongoDBDate = (dateInput?: Date | string | any): Date => {
  if (!dateInput) {
    return new Date();
  }
  return safeDateConvert(dateInput);
};

/**
 * Safely convert any date input to a consistent Date object
 * Handles MongoDB Date objects, ISO strings, timestamps, etc.
 */
const safeDateConvert = (dateInput: Date | string | any): Date => {
  // If it's already a Date object
  if (dateInput instanceof Date) {
    return dateInput;
  }
  
  // If it's a string (ISO string, etc.)
  if (typeof dateInput === 'string') {
    const date = new Date(dateInput);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  // If it's an object with $date (MongoDB extended JSON format)
  if (dateInput && typeof dateInput === 'object' && dateInput.$date) {
    const date = new Date(dateInput.$date);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  // If it's a timestamp (number)
  if (typeof dateInput === 'number') {
    const date = new Date(dateInput);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  // Fallback: try to create date anyway
  const date = new Date(dateInput);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  // If all else fails, return current date
  console.warn('Invalid date provided to formatter:', dateInput);
  return getCurrentDateTime();
};

/**
 * Format options for different date/time display needs
 */
export interface FormatOptions {
  includeTime?: boolean;
  includeSeconds?: boolean;
  timeOnly?: boolean;
  dateOnly?: boolean;
  relative?: boolean;
  timezone?: string;
}

/**
 * Main date formatting function with multiple output options
 * @param dateInput - The date input (MongoDB Date, ISO string, timestamp, etc.)
 * @param options - Formatting options
 * @returns Formatted date/time string
 */
export const formatDateTime = (
  dateInput: Date | string | any, 
  options: FormatOptions = {}
): string => {
  const date = safeDateConvert(dateInput);
  
  if (options.relative) {
    return formatRelativeTime(date);
  }
  
  if (options.timeOnly) {
    return options.includeSeconds ? formatTimeWithSeconds(date) : formatTime(date);
  }
  
  if (options.dateOnly) {
    return formatDate(date);
  }
  
  return options.includeSeconds 
    ? `${formatDate(date)}, ${formatTimeWithSeconds(date)}`
    : `${formatDate(date)}, ${formatTime(date)}`;
};

/**
 * Format date in "DD MMM YYYY" format (e.g., "5 Nov 2025")
 * Handles MongoDB dates safely
 */
export const formatDate = (dateInput: Date | string | any): string => {
  const date = safeDateConvert(dateInput);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Format weekday name (e.g., "Monday", "Tuesday")
 * Handles MongoDB dates safely
 */
export const formatWeekday = (dateInput: Date | string | any): string => {
  const date = safeDateConvert(dateInput);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

/**
 * Format weekday short (e.g., "Mon", "Tue")
 * Handles MongoDB dates safely
 */
export const formatWeekdayShort = (dateInput: Date | string | any): string => {
  const date = safeDateConvert(dateInput);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

/**
 * Format month name (e.g., "November")
 * Handles MongoDB dates safely
 */
export const formatMonth = (dateInput: Date | string | any): string => {
  const date = safeDateConvert(dateInput);
  return date.toLocaleDateString('en-US', { month: 'long' });
};

/**
 * Format month short (e.g., "Nov")
 * Handles MongoDB dates safely
 */
export const formatMonthShort = (dateInput: Date | string | any): string => {
  const date = safeDateConvert(dateInput);
  return date.toLocaleDateString('en-US', { month: 'short' });
};

/**
 * Format year (e.g., "2025")
 * Handles MongoDB dates safely
 */
export const formatYear = (dateInput: Date | string | any): string => {
  const date = safeDateConvert(dateInput);
  return date.getFullYear().toString();
};

/**
 * Format time in "h:mm AM/PM" format (e.g., "1:50 PM")
 * Handles MongoDB dates safely
 */
export const formatTime = (dateInput: Date | string | any): string => {
  const date = safeDateConvert(dateInput);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format time with seconds in "h:mm:ss AM/PM" format (e.g., "1:50:30 PM")
 * Handles MongoDB dates safely
 */
export const formatTimeWithSeconds = (dateInput: Date | string | any): string => {
  const date = safeDateConvert(dateInput);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 * Handles MongoDB dates safely
 * Uses getCurrentDateTime() for consistency
 */
export const formatRelativeTime = (dateInput: Date | string | any): string => {
  const date = safeDateConvert(dateInput);
  const now = getCurrentDateTime();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date);
  }
};

/**
 * Check if a date is valid after conversion
 */
export const isValidDate = (dateInput: Date | string | any): boolean => {
  try {
    const date = safeDateConvert(dateInput);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};

/**
 * Get UTC date string for consistent database operations
 */
export const toUTCString = (dateInput: Date | string | any): string => {
  const date = safeDateConvert(dateInput);
  return date.toISOString();
};

/**
 * Compare two dates (useful for sorting, filtering)
 */
export const compareDates = (
  date1: Date | string | any, 
  date2: Date | string | any
): number => {
  const d1 = safeDateConvert(date1);
  const d2 = safeDateConvert(date2);
  return d1.getTime() - d2.getTime();
};

/**
 * Check if a date is today
 */
export const isToday = (dateInput: Date | string | any): boolean => {
  const date = safeDateConvert(dateInput);
  const today = getCurrentDateTime();
  return date.toDateString() === today.toDateString();
};

/**
 * Check if a date is within a specific range
 */
export const isDateInRange = (
  dateInput: Date | string | any,
  startDate: Date | string | any,
  endDate: Date | string | any
): boolean => {
  const date = safeDateConvert(dateInput).getTime();
  const start = safeDateConvert(startDate).getTime();
  const end = safeDateConvert(endDate).getTime();
  return date >= start && date <= end;
};

/**
 * Get start of day (00:00:00)
 */
export const getStartOfDay = (dateInput?: Date | string | any): Date => {
  const date = dateInput ? safeDateConvert(dateInput) : getCurrentDateTime();
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Get end of day (23:59:59)
 */
export const getEndOfDay = (dateInput?: Date | string | any): Date => {
  const date = dateInput ? safeDateConvert(dateInput) : getCurrentDateTime();
  date.setHours(23, 59, 59, 999);
  return date;
};

/**
 * Add days to a date
 */
export const addDays = (dateInput: Date | string | any, days: number): Date => {
  const date = safeDateConvert(dateInput);
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * Subtract days from a date
 */
export const subtractDays = (dateInput: Date | string | any, days: number): Date => {
  return addDays(dateInput, -days);
};

/**
 * Format for MongoDB query (always returns Date object)
 * Use this when building MongoDB queries with date filters
 */
export const prepareForMongoQuery = (dateInput: Date | string | any): Date => {
  return safeDateConvert(dateInput);
};

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export const formatForInput = (dateInput: Date | string | any): string => {
  const date = safeDateConvert(dateInput);
  return date.toISOString().split('T')[0];
};

/**
 * Get current timestamp (milliseconds since epoch)
 */
export const getCurrentTimestamp = (): number => {
  return getCurrentDateTime().getTime();
};