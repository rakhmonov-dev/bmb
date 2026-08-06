const applicationService = require('../services/applicationService');
const asyncHandler = require('../utils/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const application = await applicationService.create(req.body);
  res.status(201).json({
    success: true,
    message: "Arizangiz muvaffaqiyatli qabul qilindi. Tez orada siz bilan bog'lanamiz.",
    data: application,
  });
});

const getAll = asyncHandler(async (req, res) => {
  const { status, courseId, search, dateFrom, dateTo, page, limit } = req.query;

  const result = await applicationService.getAllPaginated(
    { status, courseId, search, dateFrom, dateTo },
    { page, limit }
  );

  res.status(200).json({ success: true, ...result });
});

const getById = asyncHandler(async (req, res) => {
  const application = await applicationService.getById(req.params.id);
  res.status(200).json({ success: true, data: application });
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;
  const application = await applicationService.updateStatus(req.params.id, status, adminNote);
  res.status(200).json({ success: true, message: 'Ariza statusi yangilandi.', data: application });
});

const remove = asyncHandler(async (req, res) => {
  await applicationService.remove(req.params.id);
  res.status(200).json({ success: true, message: "Ariza o'chirildi." });
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await applicationService.getDashboardStats();
  res.status(200).json({ success: true, data: stats });
});

module.exports = { create, getAll, getById, updateStatus, remove, getDashboardStats };
