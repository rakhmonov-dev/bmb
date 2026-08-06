const express = require('express');
const faqController = require('../controllers/faqController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { faqValidator } = require('../validators/contentValidator');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');

const router = express.Router();

// ---------------------- PUBLIC ----------------------
router.get('/', faqController.getAllPublic);

// ---------------------- ADMIN (himoyalangan) ----------------------
router.get('/admin/all', requireAuth, faqController.getAllAdmin);
router.post('/', requireAuth, faqValidator, handleValidationErrors, faqController.create);
router.put('/:id', requireAuth, faqController.update);
router.delete('/:id', requireAuth, faqController.remove);

module.exports = router;
