const messageRepository = require('../repositories/messageRepository');

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
    this.name = 'NotFoundError';
  }
}

async function getAllPaginated(filters) {
  return messageRepository.findAllPaginated(filters);
}

async function getById(id) {
  const message = await messageRepository.findById(id);
  if (!message) throw new NotFoundError('Xabar topilmadi.');
  return message;
}

async function create(data) {
  return messageRepository.create(data);
}

async function markAsRead(id) {
  await getById(id);
  return messageRepository.markAsRead(id);
}

async function remove(id) {
  await getById(id);
  return messageRepository.remove(id);
}

async function getUnreadCount() {
  return messageRepository.getUnreadCount();
}

module.exports = { getAllPaginated, getById, create, markAsRead, remove, getUnreadCount, NotFoundError };
