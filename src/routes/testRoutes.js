const express = require('express');
const testController = require('../controllers/testController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { submitTestValidator, questionValidator } = require('../validators/testValidator');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');

const router = express.Router();

// ---------------------- PUBLIC: Darajani aniqlash testi ----------------------
// GET /api/test/questions — Test savollari (to'g'ri javobsiz)
router.get('/questions', testController.getQuestions);

// POST /api/test/submit — Javoblarni yuborish, ball va daraja olish
router.post('/submit', submitTestValidator, handleValidationErrors, testController.submitTest);

// ---------------------- ADMIN: Savollarni boshqarish ----------------------
router.get('/admin/questions', requireAuth, testController.getAllQuestionsAdmin);
router.get('/admin/questions/:id', requireAuth, testController.getQuestionById);

router.post(
  '/admin/questions',
  requireAuth,
  questionValidator,
  handleValidationErrors,
  testController.createQuestion
);

router.put('/admin/questions/:id', requireAuth, testController.updateQuestion);
router.delete('/admin/questions/:id', requireAuth, testController.removeQuestion);

module.exports = router;
