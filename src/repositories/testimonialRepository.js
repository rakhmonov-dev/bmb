const { pool } = require('../config/database');

async function findAll({ includeInactive = false } = {}) {
  const query = includeInactive
    ? 'SELECT * FROM testimonials ORDER BY display_order ASC, id ASC'
    : 'SELECT * FROM testimonials WHERE is_active = 1 ORDER BY display_order ASC, id ASC';
  const [rows] = await pool.query(query);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM testimonials WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function create(data) {
  const {
    fullName,
    photoUrl = null,
    achievedLevel = null,
    quoteText,
    rating = 5,
    displayOrder = 0,
  } = data;

  const [result] = await pool.query(
    `INSERT INTO testimonials (full_name, photo_url, achieved_level, quote_text, rating, display_order)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [fullName, photoUrl, achievedLevel, quoteText, rating, displayOrder]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const fields = [];
  const values = [];

  const fieldMap = {
    fullName: 'full_name',
    photoUrl: 'photo_url',
    achievedLevel: 'achieved_level',
    quoteText: 'quote_text',
    rating: 'rating',
    displayOrder: 'display_order',
    isActive: 'is_active',
  };

  for (const [key, column] of Object.entries(fieldMap)) {
    if (data[key] !== undefined) {
      fields.push(`${column} = ?`);
      values.push(data[key]);
    }
  }

  if (fields.length === 0) return findById(id);

  values.push(id);
  await pool.query(`UPDATE testimonials SET ${fields.join(', ')} WHERE id = ?`, values);
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM testimonials WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, create, update, remove };
