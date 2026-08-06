const express = require('express');
const aiController = require('../controllers/aiController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { aiChatLimiter } = require('../middlewares/rateLimitMiddleware');
const { aiChatValidator, aiKnowledgeValidator } = require('../validators/contentValidator');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');

const router = express.Router();

// ---------------------- PUBLIC: Chat widget ----------------------
// POST /api/ai/chat — Har bir sahifadagi floating chat
router.post('/chat', aiChatLimiter, aiChatValidator, handleValidationErrors, aiController.chat);

// GET /api/ai/status — OpenAI sozlanganmi yoki fallback rejimdami (frontend uchun UI belgisi)
router.get('/status', aiController.getStatus);

// ---------------------- ADMIN: Bilim bazasi va loglar ----------------------
router.get('/knowledge', requireAuth, aiController.getKnowledgeBase);
router.post(
  '/knowledge',
  requireAuth,
  aiKnowledgeValidator,
  handleValidationErrors,
  aiController.createKnowledge
);
router.put('/knowledge/:id', requireAuth, aiController.updateKnowledge);
router.delete('/knowledge/:id', requireAuth, aiController.removeKnowledge);

router.get('/logs', requireAuth, aiController.getChatLogs);

module.exports = router;
