const { pool } = require('../config/database');

const BASE_SELECT = `
  SELECT
    a.*,
    c.title AS course_title
  FROM applications a
  LEFT JOIN courses c ON a.course_id = c.id
`;

/**
 * Admin panel uchun filtrlash + pagination bilan ariza ro'yxati.
 * @param {Object} filters - { status, courseId, search, dateFrom, dateTo }
 * @param {Object} pagination - { page, limit }
 */
async function findAllPaginated(filters = {}, pagination = {}) {
  const { status, courseId, search, dateFrom, dateTo } = filters;
  const page = Math.max(1, Number(pagination.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(pagination.limit) || 20));
  const offset = (page - 1) * limit;

  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('a.status = ?');
    params.push(status);
  }
  if (courseId) {
    conditions.push('a.course_id = ?');
    params.push(courseId);
  }
  if (search) {
    conditions.push('(a.full_name LIKE ? OR a.phone LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (dateFrom) {
    conditions.push('a.created_at >= ?');
    params.push(dateFrom);
  }
  if (dateTo) {
    conditions.push('a.created_at <= ?');
    params.push(dateTo);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM applications a ${whereClause}`,
    params
  );
  const total = countRows[0].total;

  const [rows] = await pool.query(
    `${BASE_SELECT} ${whereClause} ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function findById(id) {
  const [rows] = await pool.query(`${BASE_SELECT} WHERE a.id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

async function create(data) {
  const {
    fullName,
    phone,
    age,
    telegramUsername = null,
    courseId = null,
    preferredTime = null,
    testAttemptId = null,
    testScore = null,
    determinedLevel = null,
    comment = null,
  } = data;

  const [result] = await pool.query(
    `INSERT INTO applications
      (full_name, phone, age, telegram_username, course_id, preferred_time,
       test_attempt_id, test_score, determined_level, comment)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      fullName, phone, age, telegramUsername, courseId, preferredTime,
      testAttemptId, testScore, determinedLevel, comment,
    ]
  );
  return findById(result.insertId);
}

async function updateStatus(id, status, adminNote) {
  const fields = ['status = ?'];
  const values = [status];

  if (adminNote !== undefined) {
    fields.push('admin_note = ?');
    values.push(adminNote);
  }

  values.push(id);
  await pool.query(`UPDATE applications SET ${fields.join(', ')} WHERE id = ?`, values);
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM applications WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

/**
 * Dashboard uchun umumiy statistika.
 */
async function getStatusCounts() {
  const [rows] = await pool.query(
    `SELECT status, COUNT(*) AS count FROM applications GROUP BY status`
  );
  return rows;
}

async function getTotalCount() {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM applications');
  return rows[0].total;
}

/**
 * Oxirgi N kun ichidagi kunlik arizalar soni — grafik uchun (Recharts).
 */
async function getDailyCountsLastNDays(days = 30) {
  const [rows] = await pool.query(
    `SELECT DATE(created_at) AS date, COUNT(*) AS count
     FROM applications
     WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     GROUP BY DATE(created_at)
     ORDER BY date ASC`,
    [days]
  );
  return rows;
}

async function getRecent(limit = 5) {
  const [rows] = await pool.query(
    `${BASE_SELECT} ORDER BY a.created_at DESC LIMIT ?`,
    [limit]
  );
  return rows;
}

async function getLevelDistribution() {
  const [rows] = await pool.query(
    `SELECT determined_level, COUNT(*) AS count
     FROM applications
     WHERE determined_level IS NOT NULL
     GROUP BY determined_level`
  );
  return rows;
}

module.exports = {
  findAllPaginated,
  findById,
  create,
  updateStatus,
  remove,
  getStatusCounts,
  getTotalCount,
  getDailyCountsLastNDays,
  getRecent,
  getLevelDistribution,
};
