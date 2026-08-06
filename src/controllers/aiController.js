const aiService = require('../services/aiService');
const asyncHandler = require('../utils/asyncHandler');

// ---------------------- PUBLIC: Chat widget ----------------------

const chat = asyncHandler(async (req, res) => {
  const { message, sessionId, conversationHistory } = req.body;

  const result = await aiService.getChatResponse(message, sessionId, conversationHistory || []);

  res.status(200).json({
    success: true,
    data: {
      response: result.response,
      usedFallback: result.usedFallback,
    },
  });
});

// ---------------------- ADMIN: Bilim bazasini boshqarish ----------------------

const getKnowledgeBase = asyncHandler(async (req, res) => {
  const knowledge = await aiService.getKnowledgeBase(true);
  res.status(200).json({ success: true, data: knowledge });
});

const createKnowledge = asyncHandler(async (req, res) => {
  const knowledge = await aiService.createKnowledge(req.body);
  res.status(201).json({ success: true, message: "Bilim bazasiga muvaffaqiyatli qo'shildi.", data: knowledge });
});

const updateKnowledge = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };
  if (updateData.displayOrder !== undefined) updateData.displayOrder = Number(updateData.displayOrder);
  if (updateData.isActive !== undefined) {
    updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true ? 1 : 0;
  }
  const knowledge = await aiService.updateKnowledge(req.params.id, updateData);
  res.status(200).json({ success: true, message: 'Bilim bazasi yangilandi.', data: knowledge });
});

const removeKnowledge = asyncHandler(async (req, res) => {
  await aiService.removeKnowledge(req.params.id);
  res.status(200).json({ success: true, message: "Bilim bazasidan o'chirildi." });
});

const getChatLogs = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await aiService.getChatLogs({ page, limit });
  res.status(200).json({ success: true, ...result });
});

const getStatus = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      openaiConfigured: aiService.isOpenAiConfigured(),
    },
  });
});

module.exports = {
  chat,
  getKnowledgeBase,
  createKnowledge,
  updateKnowledge,
  removeKnowledge,
  getChatLogs,
  getStatus,
};
