const { validationResult } = require('express-validator');

/**
 * Har bir validator array'idan keyin ishlatiladi. express-validator
 * to'plagan xatolarni tekshiradi va bo'lsa, 422 status bilan qaytaradi.
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Kiritilgan ma'lumotlarda xatolik bor.",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
}

module.exports = { handleValidationErrors };
