const settingsService = require('../services/settingsService');
const asyncHandler = require('../utils/asyncHandler');

const getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getPublicSettings();
  res.status(200).json({ success: true, data: settings });
});

const getAllAdmin = asyncHandler(async (req, res) => {
  const settings = await settingsService.getAllForAdmin();
  res.status(200).json({ success: true, data: settings });
});

const getByGroup = asyncHandler(async (req, res) => {
  const settings = await settingsService.getByGroup(req.params.group);
  res.status(200).json({ success: true, data: settings });
});

/**
 * Body format: { updates: [{ key: 'hero_title', value: 'Yangi matn' }, ...] }
 */
const bulkUpdate = asyncHandler(async (req, res) => {
  const settings = await settingsService.bulkUpdate(req.body.updates);
  res.status(200).json({ success: true, message: 'Sozlamalar muvaffaqiyatli yangilandi.', data: settings });
});

module.exports = { getPublicSettings, getAllAdmin, getByGroup, bulkUpdate };
