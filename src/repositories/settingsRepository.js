const { pool } = require('../config/database');

/**
 * site_settings key-value jadval — Hero, Biz haqimizda, Aloqa matnlari.
 * Public uchun butun to'plam bir marta olinadi va frontend'da key bo'yicha
 * ishlatiladi (masalan settings.hero_title).
 */

async function findAll() {
  const [rows] = await pool.query('SELECT * FROM site_settings ORDER BY setting_group ASC, id ASC');
  return rows;
}

async function findByGroup(group) {
  const [rows] = await pool.query('SELECT * FROM site_settings WHERE setting_group = ? ORDER BY id ASC', [group]);
  return rows;
}

async function findByKey(key) {
  const [rows] = await pool.query('SELECT * FROM site_settings WHERE setting_key = ? LIMIT 1', [key]);
  return rows[0] || null;
}

/**
 * Bir nechta key'ni bir vaqtda yangilash (admin panel "saqlash" tugmasi).
 * @param {Array<{key: string, value: string}>} updates
 */
async function bulkUpdate(updates) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const { key, value } of updates) {
      await connection.query(
        'UPDATE site_settings SET setting_value = ? WHERE setting_key = ?',
        [value, key]
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return findAll();
}

/**
 * Barcha settings'ni { key: value } shaklidagi flat object'ga aylantirish —
 * frontend uchun qulay format.
 */
function toKeyValueMap(rows) {
  const map = {};
  for (const row of rows) {
    map[row.setting_key] = row.setting_value;
  }
  return map;
}

module.exports = { findAll, findByGroup, findByKey, bulkUpdate, toKeyValueMap };
