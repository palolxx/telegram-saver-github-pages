/**
 * Date Utilities
 * Handles date formatting and conversion
 */

/**
 * Format date in Persian
 */
function formatPersianDate(date) {
  // This is a simplified version. In a real implementation,
  // you would use a proper Gregorian to Persian date converter library
  try {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Intl.DateTimeFormat('fa-IR', options).format(date);
  } catch (error) {
    console.error('Error formatting Persian date:', error);
    // Fallback to ISO string if formatting fails
    return date.toISOString().split('T')[0];
  }
}

/**
 * Format date in Gregorian
 */
function formatGregorianDate(date) {
  try {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error('Error formatting Gregorian date:', error);
    // Fallback to ISO string if formatting fails
    return date.toISOString().split('T')[0];
  }
}

/**
 * Format time in Persian
 */
function formatPersianTime(time) {
  try {
    // Convert 24-hour format to Persian format
    const [hours, minutes] = time.split(':');
    return `${convertToPersianNumbers(hours)}:${convertToPersianNumbers(minutes)}`;
  } catch (error) {
    console.error('Error formatting Persian time:', error);
    return time;
  }
}

/**
 * Convert numbers to Persian digits
 */
function convertToPersianNumbers(input) {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return input.toString().replace(/\d/g, x => persianDigits[x]);
}

/**
 * Parse Persian date string to JavaScript Date
 * This is a simplified implementation and would need a proper library in production
 */
function parsePersianDate(persianDateStr) {
  // In a real implementation, you would use a proper Persian to Gregorian date converter
  // For now, we'll just return the current date as a placeholder
  console.warn('Persian date parsing not fully implemented:', persianDateStr);
  return new Date();
}

/**
 * Get current date and time in Persian format
 */
function getCurrentPersianDateTime() {
  const now = new Date();
  return {
    date: formatPersianDate(now),
    time: formatPersianTime(`${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`)
  };
}

module.exports = {
  formatPersianDate,
  formatGregorianDate,
  formatPersianTime,
  convertToPersianNumbers,
  parsePersianDate,
  getCurrentPersianDateTime
};