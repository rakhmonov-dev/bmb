const express = require('express');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { loginValidator } = require('../validators/authValidator');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');
const { loginLimiter } = require('../middlewares/rateLimitMiddleware');

const router = express.Router();

// POST /api/auth/login — Admin tizimga kirishi
router.post('/login', loginLimiter, loginValidator, handleValidationErrors, authController.login);

// GET /api/auth/profile — Joriy admin profilini olish (himoyalangan)
router.get('/profile', requireAuth, authController.getProfile);

module.exports = router;
