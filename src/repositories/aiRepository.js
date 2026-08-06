const { pool } = require('../config/database');

// ---------------------- KNOWLEDGE BASE ----------------------

async function findAllKnowledge({ includeInactive = false } = {}) {
  const query = includeInactive
    ? 'SELECT * FROM ai_knowledge_base ORDER BY display_order ASC, id ASC'
    : 'SELECT * FROM ai_knowledge_base WHERE is_active = 1 ORDER BY display_order ASC, id ASC';
  const [rows] = await pool.query(query);
  return rows;
}

async function findKnowledgeById(id) {
  const [rows] = await pool.query('SELECT * FROM ai_knowledge_base WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function createKnowledge({ topic, content, keywords = null, displayOrder = 0 }) {
  const [result] = await pool.query(
    'INSERT INTO ai_knowledge_base (topic, content, keywords, display_order) VALUES (?, ?, ?, ?)',
    [topic, content, keywords, displayOrder]
  );
  return findKnowledgeById(result.insertId);
}

async function updateKnowledge(id, data) {
  const fields = [];
  const values = [];
  const fieldMap = {
    topic: 'topic',
    content: 'content',
    keywords: 'keywords',
    displayOrder: 'display_order',
    isActive: 'is_active',
  };

  for (const [key, column] of Object.entries(fieldMap)) {
    if (data[key] !== undefined) {
      fields.push(`${column} = ?`);
      values.push(data[key]);
    }
  }

  if (fields.length === 0) return findKnowledgeById(id);
  values.push(id);
  await pool.query(`UPDATE ai_knowledge_base SET ${fields.join(', ')} WHERE id = ?`, values);
  return findKnowledgeById(id);
}

async function removeKnowledge(id) {
  const [result] = await pool.query('DELETE FROM ai_knowledge_base WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

// ---------------------- CHAT LOGS ----------------------

async function logChat({ sessionId, userMessage, aiResponse, wasFallback = false, requestedPhone = false }) {
  await pool.query(
    `INSERT INTO ai_chat_logs (session_id, user_message, ai_response, was_fallback, requested_phone)
     VALUES (?, ?, ?, ?, ?)`,
    [sessionId, userMessage, aiResponse, wasFallback ? 1 : 0, requestedPhone ? 1 : 0]
  );
}

async function findLogsPaginated({ page = 1, limit = 30 } = {}) {
  const offset = (Math.max(1, page) - 1) * limit;
  const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM ai_chat_logs');
  const total = countRows[0].total;

  const [rows] = await pool.query(
    'SELECT * FROM ai_chat_logs ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [Number(limit), offset]
  );

  return {
    data: rows,
    pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
  };
}

module.exports = {
  findAllKnowledge,
  findKnowledgeById,
  createKnowledge,
  updateKnowledge,
  removeKnowledge,
  logChat,
  findLogsPaginated,
};
