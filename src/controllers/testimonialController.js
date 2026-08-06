const testimonialService = require('../services/testimonialService');
const asyncHandler = require('../utils/asyncHandler');

function buildPhotoUrl(req, filename) {
  return `${req.protocol}://${req.get('host')}/uploads/testimonials/${filename}`;
}

const getAllPublic = asyncHandler(async (req, res) => {
  const testimonials = await testimonialService.getAll(false);
  res.status(200).json({ success: true, data: testimonials });
});

const getAllAdmin = asyncHandler(async (req, res) => {
  const testimonials = await testimonialService.getAll(true);
  res.status(200).json({ success: true, data: testimonials });
});

const create = asyncHandler(async (req, res) => {
  const photoUrl = req.file ? buildPhotoUrl(req, req.file.filename) : null;

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
    updateData.photoUrl = buildPhotoUrl(req, req.file.filename);
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
  await testimonialService.remove(req.params.id);
  res.status(200).json({ success: true, message: "Fikr o'chirildi." });
});

module.exports = { getAllPublic, getAllAdmin, create, update, remove };
