const express = require('express');
const router = express.Router();
const lapanganController = require('../controllers/lapanganController');
const validateRequest = require('../validators/validateRequest');
const { lapanganSchema } = require('../validators/schemas');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Get all lapangan - public
router.get('/', lapanganController.getAllLapangan);

// Get availability for specific date - public
router.get('/availability/check', lapanganController.getLapanganAvailability);

// Get lapangan per-hour status (06:00 - 23:00) - public
router.get('/:id/status-jam', lapanganController.getLapanganJamStatus);

// Get lapangan by ID - public
router.get('/:id', lapanganController.getLapanganById);

// Create lapangan - admin only
router.post(
  '/',
  authenticateToken,
  authorizeRole(['admin']),
  validateRequest(lapanganSchema),
  lapanganController.createLapangan
);

// Update lapangan - admin only
router.patch(
  '/:id',
  authenticateToken,
  authorizeRole(['admin']),
  lapanganController.updateLapangan
);

// Delete lapangan - admin only
router.delete(
  '/:id',
  authenticateToken,
  authorizeRole(['admin']),
  lapanganController.deleteLapangan
);

module.exports = router;
