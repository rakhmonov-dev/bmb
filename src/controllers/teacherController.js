const teacherService = require('../services/teacherService');
const asyncHandler = require('../utils/asyncHandler');

function buildPhotoUrl(req, filename) {
  return `${req.protocol}://${req.get('host')}/uploads/teachers/${filename}`;
}

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
  const photoUrl = req.file ? buildPhotoUrl(req, req.file.filename) : null;

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
    updateData.photoUrl = buildPhotoUrl(req, req.file.filename);
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
  await teacherService.remove(req.params.id);
  res.status(200).json({ success: true, message: "O'qituvchi o'chirildi." });
});

module.exports = { getAllPublic, getAllAdmin, getById, create, update, remove };
