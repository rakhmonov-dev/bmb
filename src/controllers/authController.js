const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  res.status(200).json({
    success: true,
    message: 'Muvaffaqiyatli kirildi.',
    data: result,
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const admin = await authService.getProfile(req.admin.id);

  res.status(200).json({
    success: true,
    data: admin,
  });
});

module.exports = { login, getProfile };
