const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const validateRequest = require('../validators/validateRequest');
const { bookingSchema } = require('../validators/schemas');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Get all bookings - admin only
router.get(
  '/',
  authenticateToken,
  authorizeRole(['admin']),
  bookingController.getAllBookings
);

// Check expired bookings - admin only
router.post(
  '/check-expired',
  authenticateToken,
  authorizeRole(['admin']),
  bookingController.checkExpiredBookings
);

// Create booking - authenticated users
router.post(
  '/',
  authenticateToken,
  validateRequest(bookingSchema),
  bookingController.createBooking
);

// Get user's bookings
router.get(
  '/user/my-bookings',
  authenticateToken,
  bookingController.getUserBookings
);

// Get booking by ID
router.get(
  '/:id',
  authenticateToken,
  bookingController.getBookingById
);

// Confirm payment
router.patch(
  '/:id/confirm-payment',
  authenticateToken,
  bookingController.confirmPayment
);

// Cancel booking
router.patch(
  '/:id/cancel',
  authenticateToken,
  bookingController.cancelBooking
);

module.exports = router;
