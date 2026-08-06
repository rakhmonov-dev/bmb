const { pool } = require('../config/database');

const BASE_SELECT = `
  SELECT
    c.*,
    t.full_name AS teacher_name,
    t.photo_url AS teacher_photo_url
  FROM courses c
  LEFT JOIN teachers t ON c.teacher_id = t.id
`;

async function findAll({ includeInactive = false } = {}) {
  const query = includeInactive
    ? `${BASE_SELECT} ORDER BY c.display_order ASC, c.id ASC`
    : `${BASE_SELECT} WHERE c.is_active = 1 ORDER BY c.display_order ASC, c.id ASC`;
  const [rows] = await pool.query(query);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(`${BASE_SELECT} WHERE c.id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

async function findBySlug(slug) {
  const [rows] = await pool.query(`${BASE_SELECT} WHERE c.slug = ? AND c.is_active = 1 LIMIT 1`, [slug]);
  return rows[0] || null;
}

async function slugExists(slug, excludeId = null) {
  const query = excludeId
    ? 'SELECT id FROM courses WHERE slug = ? AND id != ? LIMIT 1'
    : 'SELECT id FROM courses WHERE slug = ? LIMIT 1';
  const params = excludeId ? [slug, excludeId] : [slug];
  const [rows] = await pool.query(query, params);
  return rows.length > 0;
}

async function create(data) {
  const {
    title,
    slug,
    description,
    cefrLevelFrom,
    cefrLevelTo,
    durationMonths,
    lessonsPerWeek = 3,
    priceAmount,
    pricePeriod = 'oylik',
    groupSizeMax = null,
    iconName = null,
    teacherId = null,
    displayOrder = 0,
  } = data;

  const [result] = await pool.query(
    `INSERT INTO courses
      (title, slug, description, cefr_level_from, cefr_level_to, duration_months,
       lessons_per_week, price_amount, price_period, group_size_max, icon_name,
       teacher_id, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title, slug, description, cefrLevelFrom, cefrLevelTo, durationMonths,
      lessonsPerWeek, priceAmount, pricePeriod, groupSizeMax, iconName,
      teacherId, displayOrder,
    ]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const fields = [];
  const values = [];

  const fieldMap = {
    title: 'title',
    slug: 'slug',
    description: 'description',
    cefrLevelFrom: 'cefr_level_from',
    cefrLevelTo: 'cefr_level_to',
    durationMonths: 'duration_months',
    lessonsPerWeek: 'lessons_per_week',
    priceAmount: 'price_amount',
    pricePeriod: 'price_period',
    groupSizeMax: 'group_size_max',
    iconName: 'icon_name',
    teacherId: 'teacher_id',
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
  await pool.query(`UPDATE courses SET ${fields.join(', ')} WHERE id = ?`, values);
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM courses WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, findBySlug, slugExists, create, update, remove };
