const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validateRequest = require('../validators/validateRequest');
const { registerSchema, loginSchema } = require('../validators/schemas');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);

// Protected routes
router.get('/profile', authenticateToken, authController.getUserProfile);

module.exports = router;
