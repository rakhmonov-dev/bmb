const authService = require('../services/authService');

/**
 * Admin panel yo'llarini himoya qiladi. Authorization header'da
 * "Bearer <token>" bo'lishi kerak.
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Avtorizatsiya talab qilinadi. Iltimos, tizimga kiring.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await authService.verifyToken(token);

    req.admin = {
      id: decoded.adminId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(error.statusCode || 403).json({
      success: false,
      message: error.message || 'Token yaroqsiz.',
    });
  }
}

/**
 * Faqat super_admin roliga ega bo'lganlar uchun (masalan boshqa admin
 * yaratish kabi kritik amallar uchun ishlatilishi mumkin).
 */
function requireSuperAdmin(req, res, next) {
  if (req.admin?.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Bu amal uchun super administrator huquqi talab qilinadi.',
    });
  }
  next();
}

module.exports = { requireAuth, requireSuperAdmin };
