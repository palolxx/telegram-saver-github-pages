/**
 * Calendar Handler
 * Manages calendar-related functionality
 */

const { formatPersianDate, formatGregorianDate } = require('./date-utils');

/**
 * Handle calendar intent
 */
function handleCalendarIntent(data) {
  try {
    const { action, date, query } = data;
    
    switch (action) {
      case 'convert':
        // Convert Gregorian to Persian date
        const gregorianDate = new Date(date);
        const persianDate = formatPersianDate(gregorianDate);
        return `📅 تاریخ ${formatGregorianDate(gregorianDate)} برابر است با ${persianDate} در تقویم شمسی.`;
      
      case 'holiday':
        // Check if date is a holiday
        // This would require a holiday database
        return `🗓️ اطلاعات تعطیلات برای تاریخ ${formatPersianDate(new Date(date))} در دسترس نیست.`;
      
      case 'date_info':
        // Get information about the date
        const today = new Date();
        const targetDate = new Date(date);
        const diffTime = Math.abs(targetDate - today);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (targetDate > today) {
          return `📆 تاریخ ${formatPersianDate(targetDate)} ${diffDays} روز دیگر است.`;
        } else if (targetDate < today) {
          return `📆 تاریخ ${formatPersianDate(targetDate)} ${diffDays} روز پیش بوده است.`;
        } else {
          return `📆 تاریخ ${formatPersianDate(targetDate)} امروز است.`;
        }
      
      default:
        return `❓ عملیات نامعتبر برای تقویم.`;
    }
  } catch (error) {
    console.error('Error handling calendar intent:', error);
    return `❌ متأسفانه در پردازش اطلاعات تقویم مشکلی پیش آمد.`;
  }
}

/**
 * Convert Gregorian date to Persian date
 */
function convertToPersianDate(gregorianDate) {
  // In a real implementation, you would use a proper date conversion library
  return formatPersianDate(new Date(gregorianDate));
}

/**
 * Convert Persian date to Gregorian date
 */
function convertToGregorianDate(persianDate) {
  // In a real implementation, you would use a proper date conversion library
  // This is just a placeholder
  console.warn('Persian to Gregorian conversion not fully implemented:', persianDate);
  return new Date();
}

/**
 * Get day of week for a date
 */
function getDayOfWeek(date) {
  const days = {
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    fa: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه']
  };
  
  const dayIndex = new Date(date).getDay();
  return {
    en: days.en[dayIndex],
    fa: days.fa[dayIndex]
  };
}

module.exports = {
  handleCalendarIntent,
  convertToPersianDate,
  convertToGregorianDate,
  getDayOfWeek
};