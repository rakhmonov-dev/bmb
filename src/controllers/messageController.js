const messageService = require('../services/messageService');
const asyncHandler = require('../utils/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const message = await messageService.create(req.body);
  res.status(201).json({
    success: true,
    message: "Xabaringiz muvaffaqiyatli yuborildi. Tez orada siz bilan bog'lanamiz.",
    data: message,
  });
});

const getAll = asyncHandler(async (req, res) => {
  const { isRead, page, limit } = req.query;
  const filters = {
    page,
    limit,
  };
  if (isRead !== undefined) {
    filters.isRead = isRead === 'true';
  }
  const result = await messageService.getAllPaginated(filters);
  res.status(200).json({ success: true, ...result });
});

const getById = asyncHandler(async (req, res) => {
  const message = await messageService.getById(req.params.id);
  res.status(200).json({ success: true, data: message });
});

const markAsRead = asyncHandler(async (req, res) => {
  const message = await messageService.markAsRead(req.params.id);
  res.status(200).json({ success: true, message: "Xabar o'qilgan deb belgilandi.", data: message });
});

const remove = asyncHandler(async (req, res) => {
  await messageService.remove(req.params.id);
  res.status(200).json({ success: true, message: "Xabar o'chirildi." });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await messageService.getUnreadCount();
  res.status(200).json({ success: true, data: { count } });
});

module.exports = { create, getAll, getById, markAsRead, remove, getUnreadCount };
