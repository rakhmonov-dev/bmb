const testQuestionRepository = require('../repositories/testQuestionRepository');

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
    this.name = 'NotFoundError';
  }
}

async function getAllForAdmin() {
  return testQuestionRepository.findAllForAdmin();
}

async function getById(id) {
  const question = await testQuestionRepository.findById(id);
  if (!question) throw new NotFoundError('Savol topilmadi.');
  return question;
}

async function create(data) {
  return testQuestionRepository.create(data);
}

async function update(id, data) {
  await getById(id);
  return testQuestionRepository.update(id, data);
}

async function remove(id) {
  await getById(id);
  return testQuestionRepository.remove(id);
}

module.exports = { getAllForAdmin, getById, create, update, remove, NotFoundError };
