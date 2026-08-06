const faqService = require('../services/faqService');
const asyncHandler = require('../utils/asyncHandler');

const getAllPublic = asyncHandler(async (req, res) => {
  const faqs = await faqService.getAll(false);
  res.status(200).json({ success: true, data: faqs });
});

const getAllAdmin = asyncHandler(async (req, res) => {
  const faqs = await faqService.getAll(true);
  res.status(200).json({ success: true, data: faqs });
});

const create = asyncHandler(async (req, res) => {
  const faq = await faqService.create(req.body);
  res.status(201).json({ success: true, message: "Savol muvaffaqiyatli qo'shildi.", data: faq });
});

const update = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };
  if (updateData.displayOrder !== undefined) updateData.displayOrder = Number(updateData.displayOrder);
  if (updateData.isActive !== undefined) {
    updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true ? 1 : 0;
  }
  const faq = await faqService.update(req.params.id, updateData);
  res.status(200).json({ success: true, message: 'Savol yangilandi.', data: faq });
});

const remove = asyncHandler(async (req, res) => {
  await faqService.remove(req.params.id);
  res.status(200).json({ success: true, message: "Savol o'chirildi." });
});

module.exports = { getAllPublic, getAllAdmin, create, update, remove };
