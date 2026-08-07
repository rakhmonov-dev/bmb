const galleryService = require('../services/galleryService');
const asyncHandler = require('../utils/asyncHandler');

function buildImageUrl(req, filename) {
  return `${req.protocol}://${req.get('host')}/uploads/gallery/${filename}`;
}

const getAllPublic = asyncHandler(async (req, res) => {
  const images = await galleryService.getAll(false);
  res.status(200).json({ success: true, data: images });
});

const getAllAdmin = asyncHandler(async (req, res) => {
  const images = await galleryService.getAll(true);
  res.status(200).json({ success: true, data: images });
});

const create = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Rasm fayli yuklanishi shart.' });
  }

  const image = await galleryService.create({
    imageUrl: buildImageUrl(req, req.file.filename),
    caption: req.body.caption || null,
    category: req.body.category || null,
    displayOrder: req.body.displayOrder ? Number(req.body.displayOrder) : 0,
  });

  res.status(201).json({ success: true, message: "Surat muvaffaqiyatli qo'shildi.", data: image });
});

const update = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };

  if (req.file) {
    updateData.imageUrl = buildImageUrl(req, req.file.filename);
  }
  if (updateData.displayOrder !== undefined) updateData.displayOrder = Number(updateData.displayOrder);
  if (updateData.isActive !== undefined) {
    updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true ? 1 : 0;
  }

  const image = await galleryService.update(req.params.id, updateData);
  res.status(200).json({ success: true, message: 'Surat yangilandi.', data: image });
});

const remove = asyncHandler(async (req, res) => {
  await galleryService.remove(req.params.id);
  res.status(200).json({ success: true, message: "Surat o'chirildi." });
});

module.exports = { getAllPublic, getAllAdmin, create, update, remove };
