const express = require('express');
const galleryController = require('../controllers/galleryController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { uploadGalleryImage } = require('../middlewares/uploadMiddleware');
const { galleryValidator } = require('../validators/contentValidator');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');

const router = express.Router();

// ---------------------- PUBLIC ----------------------
router.get('/', galleryController.getAllPublic);

// ---------------------- ADMIN (himoyalangan) ----------------------
router.get('/admin/all', requireAuth, galleryController.getAllAdmin);

router.post(
  '/',
  requireAuth,
  uploadGalleryImage.single('image'),
  galleryValidator,
  handleValidationErrors,
  galleryController.create
);

router.put('/:id', requireAuth, uploadGalleryImage.single('image'), galleryController.update);
router.delete('/:id', requireAuth, galleryController.remove);

module.exports = router;
