const courseService = require('../services/courseService');
const asyncHandler = require('../utils/asyncHandler');

const getAllPublic = asyncHandler(async (req, res) => {
  const courses = await courseService.getAll(false);
  res.status(200).json({ success: true, data: courses });
});

const getAllAdmin = asyncHandler(async (req, res) => {
  const courses = await courseService.getAll(true);
  res.status(200).json({ success: true, data: courses });
});

const getBySlug = asyncHandler(async (req, res) => {
  const course = await courseService.getBySlug(req.params.slug);
  res.status(200).json({ success: true, data: course });
});

const getById = asyncHandler(async (req, res) => {
  const course = await courseService.getById(req.params.id);
  res.status(200).json({ success: true, data: course });
});

const create = asyncHandler(async (req, res) => {
  const course = await courseService.create(req.body);
  res.status(201).json({ success: true, message: "Kurs muvaffaqiyatli qo'shildi.", data: course });
});

const update = asyncHandler(async (req, res) => {
  const course = await courseService.update(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Kurs ma\'lumotlari yangilandi.', data: course });
});

const remove = asyncHandler(async (req, res) => {
  await courseService.remove(req.params.id);
  res.status(200).json({ success: true, message: "Kurs o'chirildi." });
});

module.exports = { getAllPublic, getAllAdmin, getBySlug, getById, create, update, remove };
