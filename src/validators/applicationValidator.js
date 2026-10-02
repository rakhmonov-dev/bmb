const { body } = require('express-validator');
const { APPLICATION_STATUSES } = require('../config/constants');

const createApplicationValidator = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Ism familiya kiritilishi shart.')
    .isLength({ min: 3, max: 150 }).withMessage('Ism familiya 3-150 belgi orasida bo\'lishi kerak.'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Telefon raqami kiritilishi shart.')
    .matches(/^\+?[0-9\s\-()]{9,20}$/).withMessage("Telefon raqami formati noto'g'ri."),
  body('age')
    .notEmpty().withMessage('Yosh kiritilishi shart.')
    .isInt({ min: 5, max: 100 }).withMessage('Yosh 5 dan 100 gacha bo\'lishi kerak.'),
  body('telegramUsername')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Telegram username juda uzun.'),
  body('courseId')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 }).withMessage("Kurs ID noto'g'ri."),
  body('preferredTime')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }),
  body('testAttemptId')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 }),
  body('testScore')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 }),
  body('determinedLevel')
    .optional({ checkFalsy: true })
    .isIn(['Boshlangich', 'A1', 'A2', 'B1', 'B2', 'C1', '5-sinfgacha', '5-sinf', '6-sinf', '7-sinf', '8-sinf', '9-sinf', '10-sinf', '11-sinf']),
  body('comment')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 }).withMessage('Izoh juda uzun.'),
];

const updateStatusValidator = [
  body('status')
    .notEmpty().withMessage('Status kiritilishi shart.')
    .isIn(APPLICATION_STATUSES).withMessage("Noto'g'ri status qiymati."),
  body('adminNote')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 }),
];

module.exports = { createApplicationValidator, updateStatusValidator };
