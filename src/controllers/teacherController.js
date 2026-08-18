const teacherService = require('../services/teacherService');
const asyncHandler = require('../utils/asyncHandler');
const { uploadBufferToR2, deleteFromR2 } = require('../config/r2');

const R2_FOLDER = 'bmg-school/teachers';

const getAllPublic = asyncHandler(async (req, res) => {
  const teachers = await teacherService.getAll(false);
  res.status(200).json({ success: true, data: teachers });
});

const getAllAdmin = asyncHandler(async (req, res) => {
  const teachers = await teacherService.getAll(true);
  res.status(200).json({ success: true, data: teachers });
});

const getById = asyncHandler(async (req, res) => {
  const teacher = await teacherService.getById(req.params.id);
  res.status(200).json({ success: true, data: teacher });
});

const create = asyncHandler(async (req, res) => {
  const photoUrl = req.file
    ? (await uploadBufferToR2(req.file.buffer, R2_FOLDER, req.file.mimetype, req.file.originalname)).url
    : null;

  const teacher = await teacherService.create({
    fullName: req.body.fullName,
    photoUrl,
    specialty: req.body.specialty,
    experienceYears: req.body.experienceYears ? Number(req.body.experienceYears) : null,
    bio: req.body.bio,
    cefrLevels: req.body.cefrLevels,
    displayOrder: req.body.displayOrder ? Number(req.body.displayOrder) : 0,
  });

  res.status(201).json({ success: true, message: "O'qituvchi muvaffaqiyatli qo'shildi.", data: teacher });
});

const update = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };

  if (req.file) {
    // Eski rasm R2'da endi ishlatilmaydi — bo'sh joy egallamasligi
    // uchun yangisi yuklangandan keyin o'chiramiz
    const existing = await teacherService.getById(req.params.id);
    const { url } = await uploadBufferToR2(req.file.buffer, R2_FOLDER, req.file.mimetype, req.file.originalname);
    updateData.photoUrl = url;
    if (existing.photo_url) deleteFromR2(existing.photo_url);
  }
  if (updateData.experienceYears !== undefined) {
    updateData.experienceYears = Number(updateData.experienceYears);
  }
  if (updateData.displayOrder !== undefined) {
    updateData.displayOrder = Number(updateData.displayOrder);
  }
  if (updateData.isActive !== undefined) {
    updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true ? 1 : 0;
  }

  const teacher = await teacherService.update(req.params.id, updateData);
  res.status(200).json({ success: true, message: "O'qituvchi ma'lumotlari yangilandi.", data: teacher });
});

const remove = asyncHandler(async (req, res) => {
  const existing = await teacherService.getById(req.params.id);
  await teacherService.remove(req.params.id);
  if (existing.photo_url) deleteFromR2(existing.photo_url);
  res.status(200).json({ success: true, message: "O'qituvchi o'chirildi." });
});

module.exports = { getAllPublic, getAllAdmin, getById, create, update, remove };
