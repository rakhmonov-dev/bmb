const express = require('express');
const messageController = require('../controllers/messageController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { messageValidator } = require('../validators/contentValidator');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');

const router = express.Router();

// ---------------------- PUBLIC ----------------------
// POST /api/messages — "Aloqa" sahifasidagi forma
router.post('/', messageValidator, handleValidationErrors, messageController.create);

// ---------------------- ADMIN (himoyalangan) ----------------------
router.get('/unread-count', requireAuth, messageController.getUnreadCount);
router.get('/', requireAuth, messageController.getAll);
router.get('/:id', requireAuth, messageController.getById);
router.patch('/:id/read', requireAuth, messageController.markAsRead);
router.delete('/:id', requireAuth, messageController.remove);

module.exports = router;
