const { body } = require('express-validator');
const submitTestValidator = [
  body('subject').optional().isIn(['english', 'math']),
  body('answers').isArray({ min: 1 }).withMessage("Javoblar ro'yxati bo'sh bo'lishi mumkin emas."),
  body('answers.*.questionId').isInt({ min: 1 }).withMessage("Savol ID noto'g'ri."),
  body('answers.*.selectedOption').isIn(['a','b','c','d']).withMessage("Tanlangan javob noto'g'ri."),
];
const questionValidator = [
  body('questionText').trim().notEmpty(), body('optionA').trim().notEmpty(), body('optionB').trim().notEmpty(),
  body('optionC').trim().notEmpty(), body('optionD').trim().notEmpty(), body('correctOption').isIn(['a','b','c','d']),
  body('subject').optional().isIn(['english','math']),
  body('cefrLevel').if(body('subject').not().equals('math')).isIn(['A1','A2','B1','B2','C1']),
  body('gradeLevel').if(body('subject').equals('math')).isInt({ min: 5, max: 11 }),
  body('points').optional().isInt({ min: 1, max: 10 }),
];
module.exports = { submitTestValidator, questionValidator };
