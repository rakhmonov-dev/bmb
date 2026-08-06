const { pool } = require('../config/database');

/**
 * Public tomon faqat is_active=1 bo'lgan o'qituvchilarni ko'radi.
 * Admin tomon (includeInactive=true) barchasini ko'radi.
 */
async function findAll({ includeInactive = false } = {}) {
  const query = includeInactive
    ? 'SELECT * FROM teachers ORDER BY display_order ASC, id ASC'
    : 'SELECT * FROM teachers WHERE is_active = 1 ORDER BY display_order ASC, id ASC';
  const [rows] = await pool.query(query);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM teachers WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function create(data) {
  const {
    fullName,
    photoUrl = null,
    specialty = null,
    experienceYears = null,
    bio = null,
    cefrLevels = null,
    displayOrder = 0,
  } = data;

  const [result] = await pool.query(
    `INSERT INTO teachers
      (full_name, photo_url, specialty, experience_years, bio, cefr_levels, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [fullName, photoUrl, specialty, experienceYears, bio, cefrLevels, displayOrder]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const fields = [];
  const values = [];

  const fieldMap = {
    fullName: 'full_name',
    photoUrl: 'photo_url',
    specialty: 'specialty',
    experienceYears: 'experience_years',
    bio: 'bio',
    cefrLevels: 'cefr_levels',
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
  await pool.query(`UPDATE teachers SET ${fields.join(', ')} WHERE id = ?`, values);
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM teachers WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, create, update, remove };
