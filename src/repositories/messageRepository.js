const { pool } = require('../config/database');

async function findAllPaginated({ isRead, page = 1, limit = 20 } = {}) {
  const conditions = [];
  const params = [];

  if (isRead !== undefined) {
    conditions.push('is_read = ?');
    params.push(isRead ? 1 : 0);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (Math.max(1, page) - 1) * limit;

  const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM messages ${whereClause}`, params);
  const total = countRows[0].total;

  const [rows] = await pool.query(
    `SELECT * FROM messages ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset]
  );

  return {
    data: rows,
    pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
  };
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM messages WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function create({ fullName, phone = null, email = null, subject = null, messageText }) {
  const [result] = await pool.query(
    `INSERT INTO messages (full_name, phone, email, subject, message_text)
     VALUES (?, ?, ?, ?, ?)`,
    [fullName, phone, email, subject, messageText]
  );
  return findById(result.insertId);
}

async function markAsRead(id) {
  await pool.query('UPDATE messages SET is_read = 1 WHERE id = ?', [id]);
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM messages WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function getUnreadCount() {
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM messages WHERE is_read = 0');
  return rows[0].count;
}

module.exports = { findAllPaginated, findById, create, markAsRead, remove, getUnreadCount };
