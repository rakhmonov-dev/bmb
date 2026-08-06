const express = require('express');
const applicationController = require('../controllers/applicationController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { createApplicationValidator, updateStatusValidator } = require('../validators/applicationValidator');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');

const router = express.Router();

// ---------------------- PUBLIC ----------------------
// POST /api/applications — Test tugagandan keyin ariza yuborish
router.post(
  '/',
  createApplicationValidator,
  handleValidationErrors,
  applicationController.create
);

// ---------------------- ADMIN (himoyalangan) ----------------------
// GET /api/applications/dashboard-stats — Dashboard uchun statistika
router.get('/dashboard-stats', requireAuth, applicationController.getDashboardStats);

router.get('/', requireAuth, applicationController.getAll);
router.get('/:id', requireAuth, applicationController.getById);

router.patch(
  '/:id/status',
  requireAuth,
  updateStatusValidator,
  handleValidationErrors,
  applicationController.updateStatus
);

router.delete('/:id', requireAuth, applicationController.remove);

module.exports = router;
