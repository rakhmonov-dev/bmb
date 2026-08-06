const express = require('express');
const courseController = require('../controllers/courseController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { courseValidator } = require('../validators/contentValidator');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');

const router = express.Router();

// ---------------------- PUBLIC ----------------------
// GET /api/courses — Barcha faol kurslar ro'yxati
router.get('/', courseController.getAllPublic);

// GET /api/courses/slug/:slug — Kurs sahifasi uchun (SEO-friendly URL)
router.get('/slug/:slug', courseController.getBySlug);

// ---------------------- ADMIN (himoyalangan) ----------------------
router.get('/admin/all', requireAuth, courseController.getAllAdmin);
router.get('/:id', requireAuth, courseController.getById);

router.post('/', requireAuth, courseValidator, handleValidationErrors, courseController.create);
router.put('/:id', requireAuth, courseController.update);
router.delete('/:id', requireAuth, courseController.remove);

module.exports = router;
