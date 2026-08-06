const express = require('express');
const testimonialController = require('../controllers/testimonialController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { uploadTestimonialPhoto } = require('../middlewares/uploadMiddleware');
const { testimonialValidator } = require('../validators/contentValidator');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');

const router = express.Router();

// ---------------------- PUBLIC ----------------------
router.get('/', testimonialController.getAllPublic);

// ---------------------- ADMIN (himoyalangan) ----------------------
router.get('/admin/all', requireAuth, testimonialController.getAllAdmin);

router.post(
  '/',
  requireAuth,
  uploadTestimonialPhoto.single('photo'),
  testimonialValidator,
  handleValidationErrors,
  testimonialController.create
);

router.put('/:id', requireAuth, uploadTestimonialPhoto.single('photo'), testimonialController.update);
router.delete('/:id', requireAuth, testimonialController.remove);

module.exports = router;
