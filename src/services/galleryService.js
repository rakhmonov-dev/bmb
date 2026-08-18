const galleryRepository = require('../repositories/galleryRepository');
const { deleteFromR2 } = require('../config/r2');

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
 * Yangi rasm bilan almashtirilganda, eski faylni R2'dan o'chiradi —
 * aks holda bepul tarif kvotasi ishlatilmayotgan fayllarga to'lib qoladi.
 */
async function update(id, data) {
  const existing = await getById(id);

  if (data.imageUrl && data.imageUrl !== existing.image_url) {
    deleteFromR2(existing.image_url);
  }

  return galleryRepository.update(id, data);
}

async function remove(id) {
  const existing = await getById(id);
  deleteFromR2(existing.image_url);
  return galleryRepository.remove(id);
}

module.exports = { getAll, getById, create, update, remove, NotFoundError };
