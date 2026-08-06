const { pool } = require('../config/database');

/**
 * Admin jadvali bilan ishlaydigan repository.
 * Faqat SQL so'rovlar shu yerda — biznes mantiq service qatlamida.
 */

async function findByEmail(email) {
  const [rows] = await pool.query(
    'SELECT * FROM admins WHERE email = ? AND is_active = 1 LIMIT 1',
    [email]
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, full_name, email, role, last_login_at, created_at FROM admins WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

async function updateLastLogin(id) {
  await pool.query('UPDATE admins SET last_login_at = NOW() WHERE id = ?', [id]);
}

async function create({ fullName, email, passwordHash, role = 'admin' }) {
  const [result] = await pool.query(
    'INSERT INTO admins (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [fullName, email, passwordHash, role]
  );
  return { id: result.insertId, fullName, email, role };
}

module.exports = {
  findByEmail,
  findById,
  updateLastLogin,
  create,
};
