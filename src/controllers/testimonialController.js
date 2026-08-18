const testimonialService = require('../services/testimonialService');
const asyncHandler = require('../utils/asyncHandler');
const { uploadBufferToR2, deleteFromR2 } = require('../config/r2');

const R2_FOLDER = 'bmg-school/testimonials';

const getAllPublic = asyncHandler(async (req, res) => {
  const testimonials = await testimonialService.getAll(false);
  res.status(200).json({ success: true, data: testimonials });
});

const getAllAdmin = asyncHandler(async (req, res) => {
  const testimonials = await testimonialService.getAll(true);
  res.status(200).json({ success: true, data: testimonials });
});

const create = asyncHandler(async (req, res) => {
  const photoUrl = req.file
    ? (await uploadBufferToR2(req.file.buffer, R2_FOLDER, req.file.mimetype, req.file.originalname)).url
    : null;

  const testimonial = await testimonialService.create({
    fullName: req.body.fullName,
    photoUrl,
    achievedLevel: req.body.achievedLevel,
    quoteText: req.body.quoteText,
    rating: req.body.rating ? Number(req.body.rating) : 5,
    displayOrder: req.body.displayOrder ? Number(req.body.displayOrder) : 0,
  });

  res.status(201).json({ success: true, message: "Fikr muvaffaqiyatli qo'shildi.", data: testimonial });
});

const update = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };

  if (req.file) {
    const existing = await testimonialService.getById(req.params.id);
    const { url } = await uploadBufferToR2(req.file.buffer, R2_FOLDER, req.file.mimetype, req.file.originalname);
    updateData.photoUrl = url;
    if (existing.photo_url) deleteFromR2(existing.photo_url);
  }
  if (updateData.rating !== undefined) updateData.rating = Number(updateData.rating);
  if (updateData.displayOrder !== undefined) updateData.displayOrder = Number(updateData.displayOrder);
  if (updateData.isActive !== undefined) {
    updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true ? 1 : 0;
  }

  const testimonial = await testimonialService.update(req.params.id, updateData);
  res.status(200).json({ success: true, message: 'Fikr yangilandi.', data: testimonial });
});

const remove = asyncHandler(async (req, res) => {
  const existing = await testimonialService.getById(req.params.id);
  await testimonialService.remove(req.params.id);
  if (existing.photo_url) deleteFromR2(existing.photo_url);
  res.status(200).json({ success: true, message: "Fikr o'chirildi." });
});

module.exports = { getAllPublic, getAllAdmin, create, update, remove };
