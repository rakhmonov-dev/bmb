const { body } = require('express-validator');

const submitTestValidator = [
  body('answers')
    .isArray({ min: 1 }).withMessage('Javoblar ro\'yxati bo\'sh bo\'lishi mumkin emas.'),
  body('answers.*.questionId')
    .isInt({ min: 1 }).withMessage("Savol ID noto'g'ri."),
  body('answers.*.selectedOption')
    .isIn(['a', 'b', 'c', 'd']).withMessage("Tanlangan javob 'a', 'b', 'c' yoki 'd' bo'lishi kerak."),
];

const questionValidator = [
  body('questionText')
    .trim()
    .notEmpty().withMessage('Savol matni kiritilishi shart.'),
  body('optionA').trim().notEmpty().withMessage("A varianti kiritilishi shart."),
  body('optionB').trim().notEmpty().withMessage("B varianti kiritilishi shart."),
  body('optionC').trim().notEmpty().withMessage("C varianti kiritilishi shart."),
  body('optionD').trim().notEmpty().withMessage("D varianti kiritilishi shart."),
  body('correctOption')
    .isIn(['a', 'b', 'c', 'd']).withMessage("To'g'ri javob 'a', 'b', 'c' yoki 'd' bo'lishi kerak."),
  body('cefrLevel')
    .isIn(['A1', 'A2', 'B1', 'B2', 'C1']).withMessage("CEFR darajasi noto'g'ri."),
  body('points')
    .optional()
    .isInt({ min: 1, max: 10 }),
];

module.exports = { submitTestValidator, questionValidator };
