const express = require('express');
const settingsController = require('../controllers/settingsController');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

// ---------------------- PUBLIC ----------------------
// GET /api/settings — Bosh sahifa/Biz haqimizda/Aloqa uchun barcha matnlar
router.get('/', settingsController.getPublicSettings);

// ---------------------- ADMIN (himoyalangan) ----------------------
router.get('/admin/all', requireAuth, settingsController.getAllAdmin);
router.get('/admin/group/:group', requireAuth, settingsController.getByGroup);
router.put('/admin/bulk-update', requireAuth, settingsController.bulkUpdate);

module.exports = router;
