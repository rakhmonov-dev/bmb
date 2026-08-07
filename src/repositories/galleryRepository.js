const { pool } = require('../config/database');

async function findAll({ includeInactive = false } = {}) {
  const query = includeInactive
    ? 'SELECT * FROM gallery_images ORDER BY display_order ASC, id DESC'
    : 'SELECT * FROM gallery_images WHERE is_active = 1 ORDER BY display_order ASC, id DESC';
  const [rows] = await pool.query(query);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM gallery_images WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function create({ imageUrl, caption = null, category = null, displayOrder = 0 }) {
  const [result] = await pool.query(
    `INSERT INTO gallery_images (image_url, caption, category, display_order)
     VALUES (?, ?, ?, ?)`,
    [imageUrl, caption, category, displayOrder]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const fields = [];
  const values = [];

  const fieldMap = {
    imageUrl: 'image_url',
    caption: 'caption',
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
  await pool.query(`UPDATE gallery_images SET ${fields.join(', ')} WHERE id = ?`, values);
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM gallery_images WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, create, update, remove };
