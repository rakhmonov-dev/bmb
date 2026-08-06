const rateLimit = require('express-rate-limit');

/**
 * Umumiy API uchun rate limiter — DDoS va abuzdan asosiy himoya.
 */
const generalLimiter = rateLimit({
  windowMs: (Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Juda ko'p so'rov yuborildi. Iltimos, biroz kuting va qayta urinib ko'ring.",
  },
});

/**
 * AI chat endpoint OpenAI xarajatlariga bevosita ta'sir qiladi, shuning
 * uchun alohida, qattiqroq limit qo'yiladi.
 */
const aiChatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AI_CHAT_RATE_LIMIT_MAX) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "AI Support'ga juda ko'p so'rov yubordingiz. Iltimos, 15 daqiqadan keyin qayta urinib ko'ring yoki to'g'ridan-to'g'ri qo'ng'iroq qiling.",
  },
});

/**
 * Login endpoint uchun brute-force himoyasi.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Juda ko'p muvaffaqiyatsiz kirish urinishi. Iltimos, 15 daqiqadan keyin qayta urinib ko'ring.",
  },
});

module.exports = { generalLimiter, aiChatLimiter, loginLimiter };
