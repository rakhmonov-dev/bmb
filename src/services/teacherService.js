const teacherRepository = require('../repositories/teacherRepository');

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
    this.name = 'NotFoundError';
  }
}

async function getAll(includeInactive = false) {
  return teacherRepository.findAll({ includeInactive });
}

async function getById(id) {
  const teacher = await teacherRepository.findById(id);
  if (!teacher) throw new NotFoundError("O'qituvchi topilmadi.");
  return teacher;
}

async function create(data) {
  return teacherRepository.create(data);
}

async function update(id, data) {
  await getById(id); // mavjudligini tekshirish, aks holda 404
  return teacherRepository.update(id, data);
}

async function remove(id) {
  await getById(id);
  return teacherRepository.remove(id);
}

module.exports = { getAll, getById, create, update, remove, NotFoundError };
