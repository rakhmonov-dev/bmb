const { pool } = require('../config/database');

async function findAllForAdmin() {
  const [rows] = await pool.query(
    `SELECT * FROM test_questions
     ORDER BY subject ASC, COALESCE(grade_level, 0) ASC, cefr_level ASC, display_order ASC, id ASC`
  );
  return rows;
}

async function findAllForPublicTest(subject = 'english') {
  const [rows] = await pool.query(
    `SELECT id, question_text, option_a, option_b, option_c, option_d,
            subject, cefr_level, grade_level, points
     FROM test_questions
     WHERE is_active = 1 AND subject = ?
     ORDER BY COALESCE(grade_level, 0) ASC, cefr_level ASC, display_order ASC, id ASC`,
    [subject]
  );
  return rows;
}

async function findByIdsWithAnswers(ids, subject) {
  if (!ids || ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  const params = [...ids];
  let subjectSql = '';
  if (subject) {
    subjectSql = ' AND subject = ?';
    params.push(subject);
  }
  const [rows] = await pool.query(
    `SELECT id, correct_option, subject, cefr_level, grade_level, points
     FROM test_questions WHERE id IN (${placeholders})${subjectSql}`,
    params
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM test_questions WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function create(data) {
  const {
    questionText, optionA, optionB, optionC, optionD, correctOption,
    subject = 'english', cefrLevel = null, gradeLevel = null,
    points = 1, displayOrder = 0,
  } = data;
  const [result] = await pool.query(
    `INSERT INTO test_questions
      (question_text, option_a, option_b, option_c, option_d, correct_option,
       subject, cefr_level, grade_level, points, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [questionText, optionA, optionB, optionC, optionD, correctOption,
     subject, subject === 'english' ? cefrLevel : null,
     subject === 'math' ? Number(gradeLevel) : null, points, displayOrder]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const fields = [];
  const values = [];
  const fieldMap = {
    questionText: 'question_text', optionA: 'option_a', optionB: 'option_b',
    optionC: 'option_c', optionD: 'option_d', correctOption: 'correct_option',
    subject: 'subject', cefrLevel: 'cefr_level', gradeLevel: 'grade_level',
    points: 'points', displayOrder: 'display_order', isActive: 'is_active',
  };
  for (const [key, column] of Object.entries(fieldMap)) {
    if (data[key] !== undefined) {
      fields.push(`${column} = ?`);
      values.push(data[key] === '' ? null : data[key]);
    }
  }
  if (data.subject === 'english') { fields.push('grade_level = NULL'); }
  if (data.subject === 'math') { fields.push('cefr_level = NULL'); }
  if (fields.length === 0) return findById(id);
  values.push(id);
  await pool.query(`UPDATE test_questions SET ${fields.join(', ')} WHERE id = ?`, values);
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM test_questions WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAllForAdmin, findAllForPublicTest, findByIdsWithAnswers, findById, create, update, remove };
