const express = require('express');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { loginValidator } = require('../validators/authValidator');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');
const { loginLimiter, loginByEmailLimiter } = require('../middlewares/rateLimitMiddleware');

const router = express.Router();

// POST /api/auth/login — Admin tizimga kirishi
// Ikkita cheklov qatlami: IP bo'yicha va email bo'yicha, taqsimlangan
// brute-force hujumlarning oldini olish uchun.
router.post(
  '/login',
  loginLimiter,
  loginByEmailLimiter,
  loginValidator,
  handleValidationErrors,
  authController.login
);

// GET /api/auth/profile — Joriy admin profilini olish (himoyalangan)
router.get('/profile', requireAuth, authController.getProfile);

module.exports = router;
