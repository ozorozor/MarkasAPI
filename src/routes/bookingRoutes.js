const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const validateRequest = require('../validators/validateRequest');
const { bookingSchema } = require('../validators/schemas');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// ================= USER =================

// Create booking
router.post(
  '/',
  authenticateToken,
  validateRequest(bookingSchema),
  bookingController.createBooking
);

// Upload bukti pembayaran
router.post(
  '/:id/upload-bukti',
  authenticateToken,
  upload.single('bukti'),
  bookingController.uploadBukti
);

// Get booking sendiri
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

// ================= ADMIN =================

// Get semua booking
router.get(
  '/',
  authenticateToken,
  authorizeRole(['admin']),
  bookingController.getAllBookings
);

// Confirm booking
router.patch(
  '/:id/admin-confirm',
  authenticateToken,
  authorizeRole(['admin']),
  bookingController.confirmByAdmin
);

// Reject booking
router.patch(
  '/:id/reject',
  authenticateToken,
  authorizeRole(['admin']),
  bookingController.rejectBooking
);

module.exports = router;