const express = require('express');
const galleryController = require('../controllers/galleryController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { uploadGalleryMedia } = require('../middlewares/uploadMiddleware');
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
  uploadGalleryMedia.single('media'),
  galleryValidator,
  handleValidationErrors,
  galleryController.create
);

router.put('/:id', requireAuth, uploadGalleryMedia.single('media'), galleryController.update);
router.delete('/:id', requireAuth, galleryController.remove);

module.exports = router;
