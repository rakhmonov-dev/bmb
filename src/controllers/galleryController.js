const galleryService = require('../services/galleryService');
const asyncHandler = require('../utils/asyncHandler');
const { ALLOWED_VIDEO_MIME_TYPES } = require('../middlewares/uploadMiddleware');
const { uploadBufferToR2 } = require('../config/r2');

const R2_FOLDER = 'bmg-school/gallery';

/**
 * Multer orqali kelgan faylning mimetype'iga qarab "image" yoki "video"
 * deb belgilaydi — bu qiymat frontendga yuboriladi va u yerda <img> yoki
 * <video> tegini tanlash uchun ishlatiladi.
 */
function detectMediaType(file) {
  return ALLOWED_VIDEO_MIME_TYPES.includes(file.mimetype) ? 'video' : 'image';
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
    return res.status(400).json({ success: false, message: 'Rasm yoki video fayli yuklanishi shart.' });
  }

  const { url } = await uploadBufferToR2(req.file.buffer, R2_FOLDER, req.file.mimetype, req.file.originalname);

  const image = await galleryService.create({
    imageUrl: url,
    mediaType: detectMediaType(req.file),
    caption: req.body.caption || null,
    category: req.body.category || null,
    displayOrder: req.body.displayOrder ? Number(req.body.displayOrder) : 0,
  });

  res.status(201).json({ success: true, message: "Fayl muvaffaqiyatli qo'shildi.", data: image });
});

const update = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };

  if (req.file) {
    const { url } = await uploadBufferToR2(req.file.buffer, R2_FOLDER, req.file.mimetype, req.file.originalname);
    updateData.imageUrl = url;
    updateData.mediaType = detectMediaType(req.file);
  }
  if (updateData.displayOrder !== undefined) updateData.displayOrder = Number(updateData.displayOrder);
  if (updateData.isActive !== undefined) {
    updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true ? 1 : 0;
  }

  const image = await galleryService.update(req.params.id, updateData);
  res.status(200).json({ success: true, message: 'Fayl yangilandi.', data: image });
});

const remove = asyncHandler(async (req, res) => {
  await galleryService.remove(req.params.id);
  res.status(200).json({ success: true, message: "Fayl o'chirildi." });
});

module.exports = { getAllPublic, getAllAdmin, create, update, remove };
