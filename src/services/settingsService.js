const settingsRepository = require('../repositories/settingsRepository');

async function getPublicSettings() {
  const rows = await settingsRepository.findAll();
  return settingsRepository.toKeyValueMap(rows);
}

async function getAllForAdmin() {
  return settingsRepository.findAll();
}

async function getByGroup(group) {
  return settingsRepository.findByGroup(group);
}

/**
 * @param {Array<{key: string, value: string}>} updates
 */
async function bulkUpdate(updates) {
  if (!Array.isArray(updates) || updates.length === 0) {
    const error = new Error("Yangilanishlar ro'yxati bo'sh bo'lishi mumkin emas.");
    error.statusCode = 400;
    throw error;
  }
  return settingsRepository.bulkUpdate(updates);
}

module.exports = { getPublicSettings, getAllForAdmin, getByGroup, bulkUpdate };
