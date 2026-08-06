const express = require('express');
const teacherController = require('../controllers/teacherController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { uploadTeacherPhoto } = require('../middlewares/uploadMiddleware');
const { teacherValidator } = require('../validators/contentValidator');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');

const router = express.Router();

// ---------------------- PUBLIC ----------------------
// GET /api/teachers — "Biz haqimizda" sahifasida ko'rsatiladigan o'qituvchilar
router.get('/', teacherController.getAllPublic);

// ---------------------- ADMIN (himoyalangan) ----------------------
router.get('/admin/all', requireAuth, teacherController.getAllAdmin);
router.get('/:id', requireAuth, teacherController.getById);

router.post(
  '/',
  requireAuth,
  uploadTeacherPhoto.single('photo'),
  teacherValidator,
  handleValidationErrors,
  teacherController.create
);

router.put(
  '/:id',
  requireAuth,
  uploadTeacherPhoto.single('photo'),
  teacherController.update
);

router.delete('/:id', requireAuth, teacherController.remove);

module.exports = router;
