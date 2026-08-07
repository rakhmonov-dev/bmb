const express = require('express');

const authRoutes = require('./authRoutes');
const teacherRoutes = require('./teacherRoutes');
const courseRoutes = require('./courseRoutes');
const testRoutes = require('./testRoutes');
const applicationRoutes = require('./applicationRoutes');
const testimonialRoutes = require('./testimonialRoutes');
const faqRoutes = require('./faqRoutes');
const messageRoutes = require('./messageRoutes');
const settingsRoutes = require('./settingsRoutes');
const aiRoutes = require('./aiRoutes');
const galleryRoutes = require('./galleryRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/teachers', teacherRoutes);
router.use('/courses', courseRoutes);
router.use('/test', testRoutes);
router.use('/applications', applicationRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/faqs', faqRoutes);
router.use('/messages', messageRoutes);
router.use('/settings', settingsRoutes);
router.use('/ai', aiRoutes);
router.use('/gallery', galleryRoutes);

// GET /api/health — deploy monitoring uchun oddiy health-check
router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'BMG School API ishlayapti.', timestamp: new Date().toISOString() });
});

module.exports = router;
