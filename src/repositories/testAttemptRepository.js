const { pool } = require('../config/database');

async function create({ score, maxScore, determinedLevel, answersJson, ipAddress }) {
  const [result] = await pool.query(
    `INSERT INTO test_attempts (score, max_score, determined_level, answers_json, ip_address)
     VALUES (?, ?, ?, ?, ?)`,
    [score, maxScore, determinedLevel, JSON.stringify(answersJson), ipAddress]
  );
  return findById(result.insertId);
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM test_attempts WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

module.exports = { create, findById };
