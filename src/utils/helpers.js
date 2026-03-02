/**
 * Utility functions untuk helper tasks
 */

/**
 * Generate reset password token (untuk future implementation)
 */
const generateResetToken = () => {
  return require('crypto').randomBytes(32).toString('hex');
};

/**
 * Format date untuk database
 */
const formatDateForDB = (date) => {
  return new Date(date).toISOString();
};

/**
 * Check jika booking time slot overlaps
 */
const hasTimeOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};

/**
 * Calculate booking duration dalam jam
 */
const calculateDurationInHours = (startTime, endTime) => {
  const [hourStart, minStart] = startTime.split(':').map(Number);
  const [hourEnd, minEnd] = endTime.split(':').map(Number);

  const startMinutes = hourStart * 60 + minStart;
  const endMinutes = hourEnd * 60 + minEnd;

  if (endMinutes <= startMinutes) {
    return null;
  }

  return (endMinutes - startMinutes) / 60;
};

/**
 * Calculate total harga untuk booking
 */
const calculateTotalPrice = (pricePerHour, duration) => {
  return parseFloat(pricePerHour) * duration;
};

/**
 * Format currency ke IDR
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

/**
 * Check jika booking sudah expired
 */
const isBookingExpired = (paymentDeadline) => {
  return Date.now() > new Date(paymentDeadline).getTime();
};

/**
 * Get time remaining untuk payment
 */
const getTimeRemainingInSeconds = (paymentDeadline) => {
  const remaining = new Date(paymentDeadline).getTime() - Date.now();
  return Math.max(0, Math.floor(remaining / 1000));
};

/**
 * Format time remaining ke readable format
 */
const formatTimeRemaining = (seconds) => {
  if (seconds <= 0) return 'Waktu sudah habis';

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (minutes === 0) {
    return `${secs} detik`;
  }

  return `${minutes} menit ${secs} detik`;
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate time format (HH:MM)
 */
const isValidTimeFormat = (time) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * Generate unique booking reference number
 */
const generateBookingReference = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BK${timestamp}${random}`;
};

module.exports = {
  generateResetToken,
  formatDateForDB,
  hasTimeOverlap,
  calculateDurationInHours,
  calculateTotalPrice,
  formatCurrency,
  isBookingExpired,
  getTimeRemainingInSeconds,
  formatTimeRemaining,
  isValidEmail,
  isValidTimeFormat,
  generateBookingReference
};
