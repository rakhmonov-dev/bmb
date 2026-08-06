const { pool } = require('../config/database');

async function findAll({ includeInactive = false } = {}) {
  const query = includeInactive
    ? 'SELECT * FROM faqs ORDER BY display_order ASC, id ASC'
    : 'SELECT * FROM faqs WHERE is_active = 1 ORDER BY display_order ASC, id ASC';
  const [rows] = await pool.query(query);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM faqs WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function create({ question, answer, category = null, displayOrder = 0 }) {
  const [result] = await pool.query(
    'INSERT INTO faqs (question, answer, category, display_order) VALUES (?, ?, ?, ?)',
    [question, answer, category, displayOrder]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const fields = [];
  const values = [];
  const fieldMap = {
    question: 'question',
    answer: 'answer',
    category: 'category',
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
  await pool.query(`UPDATE faqs SET ${fields.join(', ')} WHERE id = ?`, values);
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM faqs WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, create, update, remove };
