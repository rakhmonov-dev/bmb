const testimonialRepository = require('../repositories/testimonialRepository');

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
    this.name = 'NotFoundError';
  }
}

async function getAll(includeInactive = false) {
  return testimonialRepository.findAll({ includeInactive });
}

async function getById(id) {
  const testimonial = await testimonialRepository.findById(id);
  if (!testimonial) throw new NotFoundError('Fikr topilmadi.');
  return testimonial;
}

async function create(data) {
  return testimonialRepository.create(data);
}

async function update(id, data) {
  await getById(id);
  return testimonialRepository.update(id, data);
}

async function remove(id) {
  await getById(id);
  return testimonialRepository.remove(id);
}

module.exports = { getAll, getById, create, update, remove, NotFoundError };
