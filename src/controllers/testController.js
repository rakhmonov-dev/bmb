const testService = require('../services/testService');
const testQuestionService = require('../services/testQuestionService');
const asyncHandler = require('../utils/asyncHandler');

// ---------------------- PUBLIC: Darajani aniqlash testi ----------------------

const getQuestions = asyncHandler(async (req, res) => {
  const questions = await testService.getPublicQuestions(req.query.subject);
  res.status(200).json({ success: true, data: questions });
});

const submitTest = asyncHandler(async (req, res) => {
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || null;
  const result = await testService.submitTest(req.body.answers, ipAddress, req.body.subject);
  res.status(200).json({ success: true, data: result });
});

// ---------------------- ADMIN: Savollarni boshqarish ----------------------

const getAllQuestionsAdmin = asyncHandler(async (req, res) => {
  const questions = await testQuestionService.getAllForAdmin();
  res.status(200).json({ success: true, data: questions });
});

const getQuestionById = asyncHandler(async (req, res) => {
  const question = await testQuestionService.getById(req.params.id);
  res.status(200).json({ success: true, data: question });
});

const createQuestion = asyncHandler(async (req, res) => {
  const question = await testQuestionService.create(req.body);
  res.status(201).json({ success: true, message: "Savol muvaffaqiyatli qo'shildi.", data: question });
});

const updateQuestion = asyncHandler(async (req, res) => {
  const question = await testQuestionService.update(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Savol yangilandi.', data: question });
});

const removeQuestion = asyncHandler(async (req, res) => {
  await testQuestionService.remove(req.params.id);
  res.status(200).json({ success: true, message: "Savol o'chirildi." });
});

module.exports = {
  getQuestions,
  submitTest,
  getAllQuestionsAdmin,
  getQuestionById,
  createQuestion,
  updateQuestion,
  removeQuestion,
};
