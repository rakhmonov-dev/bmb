const { body } = require('express-validator');

const courseValidator = [
  body('title').trim().notEmpty().withMessage('Kurs nomi kiritilishi shart.'),
  body('description').trim().notEmpty().withMessage('Tavsif kiritilishi shart.'),
  body('cefrLevelFrom')
    .isIn(['Boshlangich', 'A1', 'A2', 'B1', 'B2', 'C1']).withMessage("Boshlang'ich daraja noto'g'ri."),
  body('cefrLevelTo')
    .isIn(['Boshlangich', 'A1', 'A2', 'B1', 'B2', 'C1']).withMessage("Yakuniy daraja noto'g'ri."),
  body('durationMonths').isInt({ min: 1, max: 36 }).withMessage("Davomiylik noto'g'ri."),
  body('priceAmount').isFloat({ min: 0 }).withMessage("Narx noto'g'ri."),
  body('originalPrice').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage("Asl narx noto'g'ri."),
  body('pricePeriod').optional().isIn(['oylik', 'kurs_uchun']),
  body('lessonsPerWeek').optional().isInt({ min: 1, max: 14 }),
  body('groupSizeMax').optional({ checkFalsy: true }).isInt({ min: 1, max: 50 }),
  body('teacherId').optional({ checkFalsy: true }).isInt({ min: 1 }),
];

const teacherValidator = [
  body('fullName').trim().notEmpty().withMessage('Ism familiya kiritilishi shart.'),
  body('specialty').optional({ checkFalsy: true }).trim(),
  body('experienceYears').optional({ checkFalsy: true }).isInt({ min: 0, max: 60 }),
  body('bio').optional({ checkFalsy: true }).trim().isLength({ max: 3000 }),
];

const testimonialValidator = [
  body('fullName').trim().notEmpty().withMessage('Ism familiya kiritilishi shart.'),
  body('quoteText').trim().notEmpty().withMessage('Fikr matni kiritilishi shart.'),
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('achievedLevel').optional({ checkFalsy: true }).isIn(['Boshlangich', 'A1', 'A2', 'B1', 'B2', 'C1']),
];

const faqValidator = [
  body('question').trim().notEmpty().withMessage('Savol kiritilishi shart.'),
  body('answer').trim().notEmpty().withMessage('Javob kiritilishi shart.'),
];

const messageValidator = [
  body('fullName').trim().notEmpty().withMessage('Ism familiya kiritilishi shart.'),
  body('messageText').trim().notEmpty().withMessage('Xabar matni kiritilishi shart.').isLength({ max: 3000 }),
  body('phone').optional({ checkFalsy: true }).trim().matches(/^\+?[0-9\s\-()]{9,20}$/),
  body('email').optional({ checkFalsy: true }).trim().isEmail(),
];

const galleryValidator = [
  body('caption').optional({ checkFalsy: true }).trim().isLength({ max: 255 }),
  body('category').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
];

const aiChatValidator = [
  body('message').trim().notEmpty().withMessage('Xabar matni bo\'sh bo\'lishi mumkin emas.').isLength({ max: 1000 }),
  body('sessionId').trim().notEmpty().withMessage("Session ID talab qilinadi."),
];

const aiKnowledgeValidator = [
  body('topic').trim().notEmpty().withMessage('Mavzu kiritilishi shart.'),
  body('content').trim().notEmpty().withMessage('Matn kiritilishi shart.'),
];

module.exports = {
  courseValidator,
  teacherValidator,
  testimonialValidator,
  faqValidator,
  messageValidator,
  galleryValidator,
  aiChatValidator,
  aiKnowledgeValidator,
};
