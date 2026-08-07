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
 * Login endpoint uchun brute-force himoyasi — IP bo'yicha.
 * 10'dan 5'ga tushirildi, chunki 15 daqiqada 10 urinish hali ham
 * ko'plab parol kombinatsiyasini sinab ko'rish imkonini beradi.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Juda ko'p muvaffaqiyatsiz kirish urinishi. Iltimos, 15 daqiqadan keyin qayta urinib ko'ring.",
  },
});

/**
 * Email bo'yicha qo'shimcha cheklov — turli IP manzillardan (masalan VPN
 * yoki botnet orqali) bitta admin hisobiga qaratilgan taqsimlangan
 * hujumlarni to'xtatadi. Oddiy IP-based limiter buni to'xtata olmaydi,
 * chunki har bir IP alohida hisoblanadi.
 */
const loginByEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => (req.body?.email || 'unknown').toLowerCase().trim(),
  message: {
    success: false,
    message: "Bu hisob uchun juda ko'p muvaffaqiyatsiz urinish qilindi. Iltimos, 15 daqiqadan keyin qayta urinib ko'ring.",
  },
});

module.exports = { generalLimiter, aiChatLimiter, loginLimiter, loginByEmailLimiter };
