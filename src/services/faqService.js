const faqRepository = require('../repositories/faqRepository');

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
    this.name = 'NotFoundError';
  }
}

async function getAll(includeInactive = false) {
  return faqRepository.findAll({ includeInactive });
}

async function getById(id) {
  const faq = await faqRepository.findById(id);
  if (!faq) throw new NotFoundError('Savol topilmadi.');
  return faq;
}

async function create(data) {
  return faqRepository.create(data);
}

async function update(id, data) {
  await getById(id);
  return faqRepository.update(id, data);
}

async function remove(id) {
  await getById(id);
  return faqRepository.remove(id);
}

module.exports = { getAll, getById, create, update, remove, NotFoundError };
