const { pool } = require('../config/database');

/**
 * PUBLIC uchun to'g'ri javob (correct_option) HECH QACHON qaytarilmaydi —
 * bu service qatlamida hal qilinadi (findAllForPublicTest funksiyasi
 * to'g'ri javobsiz ustunlarni tanlaydi).
 */

async function findAllForAdmin() {
  const [rows] = await pool.query(
    'SELECT * FROM test_questions ORDER BY cefr_level ASC, display_order ASC, id ASC'
  );
  return rows;
}

async function findAllForPublicTest() {
  // Diqqat: correct_option ustuni ATAYIN tashlab ketiladi
  const [rows] = await pool.query(
    `SELECT id, question_text, option_a, option_b, option_c, option_d, cefr_level, points
     FROM test_questions
     WHERE is_active = 1
     ORDER BY cefr_level ASC, display_order ASC, id ASC`
  );
  return rows;
}

async function findByIdsWithAnswers(ids) {
  if (!ids || ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  const [rows] = await pool.query(
    `SELECT id, correct_option, cefr_level, points FROM test_questions WHERE id IN (${placeholders})`,
    ids
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM test_questions WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function create(data) {
  const {
    questionText,
    optionA,
    optionB,
    optionC,
    optionD,
    correctOption,
    cefrLevel,
    points = 1,
    displayOrder = 0,
  } = data;

  const [result] = await pool.query(
    `INSERT INTO test_questions
      (question_text, option_a, option_b, option_c, option_d, correct_option, cefr_level, points, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [questionText, optionA, optionB, optionC, optionD, correctOption, cefrLevel, points, displayOrder]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const fields = [];
  const values = [];

  const fieldMap = {
    questionText: 'question_text',
    optionA: 'option_a',
    optionB: 'option_b',
    optionC: 'option_c',
    optionD: 'option_d',
    correctOption: 'correct_option',
    cefrLevel: 'cefr_level',
    points: 'points',
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
  await pool.query(`UPDATE test_questions SET ${fields.join(', ')} WHERE id = ?`, values);
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM test_questions WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  findAllForAdmin,
  findAllForPublicTest,
  findByIdsWithAnswers,
  findById,
  create,
  update,
  remove,
};
