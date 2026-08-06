const { body } = require('express-validator');

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email kiritilishi shart.')
    .isEmail().withMessage("Email formati noto'g'ri."),
  body('password')
    .notEmpty().withMessage('Parol kiritilishi shart.')
    .isLength({ min: 6 }).withMessage('Parol kamida 6 belgidan iborat bo\'lishi kerak.'),
];

module.exports = { loginValidator };
