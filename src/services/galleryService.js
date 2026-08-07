const fs = require('fs');
const path = require('path');
const galleryRepository = require('../repositories/galleryRepository');

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
    this.name = 'NotFoundError';
  }
}

async function getAll(includeInactive = false) {
  return galleryRepository.findAll({ includeInactive });
}

async function getById(id) {
  const image = await galleryRepository.findById(id);
  if (!image) throw new NotFoundError('Surat topilmadi.');
  return image;
}

async function create(data) {
  return galleryRepository.create(data);
}

/**
 * Yangi rasm bilan almashtirilganda, eski jismoniy faylni diskdan
 * o'chiradi — aks holda uploads/gallery papkasi ishlatilmayotgan
 * fayllarga to'lib qoladi.
 */
async function update(id, data) {
  const existing = await getById(id);

  if (data.imageUrl && data.imageUrl !== existing.image_url) {
    deletePhysicalFile(existing.image_url);
  }

  return galleryRepository.update(id, data);
}

async function remove(id) {
  const existing = await getById(id);
  deletePhysicalFile(existing.image_url);
  return galleryRepository.remove(id);
}

/**
 * image_url to'liq URL (masalan https://api.../uploads/gallery/xxx.jpg)
 * shaklida saqlanadi; bu yerdan haqiqiy disk yo'lini ajratib olamiz.
 * URL formati noto'g'ri bo'lsa yoki fayl allaqachon yo'q bo'lsa, xato
 * tashlamaymiz — bu ma'lumot yo'qolishiga olib kelmasligi kerak,
 * shunchaki diskda "yetim" fayl qoladi, bu kritik emas.
 */
function deletePhysicalFile(imageUrl) {
  try {
    const urlParts = imageUrl.split('/uploads/');
    if (urlParts.length < 2) return;

    const relativePath = urlParts[1]; // masalan "gallery/gallery-123.jpg"
    const filePath = path.join(__dirname, '..', '..', 'uploads', relativePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('⚠️  Galereya faylini o\'chirishda xatolik (e\'tiborsiz qoldirildi):', error.message);
  }
}

module.exports = { getAll, getById, create, update, remove, NotFoundError };
