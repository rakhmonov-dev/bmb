/**
 * Markazlashtirilgan xato ishlov beruvchi. Barcha controller'lardagi
 * try/catch bloklari xatoni shu middleware'ga next(error) orqali
 * yuboradi. Bu yerda:
 *   - statusCode aniqlanadi (agar service/repository o'rnatgan bo'lsa)
 *   - MySQL xatoliklarining ba'zilari foydalanuvchiga tushunarli
 *     xabarga aylantiriladi (masalan, duplicate entry)
 *   - production'da stack trace yashiriladi
 */
function errorHandler(err, req, res, next) {
  console.error(`[XATOLIK] ${req.method} ${req.originalUrl} —`, err.message);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Serverda kutilmagan xatolik yuz berdi.';

  // MySQL-specific xatoliklarni tanib olish
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Bu ma\'lumot allaqachon mavjud (masalan, email yoki slug takrorlanmoqda).';
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    statusCode = 409;
    message = 'Bu amalni bajarish mumkin emas — bog\'liq ma\'lumotlar mavjud.';
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      // Galereya endpoint'i video qabul qilgani uchun ancha kattaroq limitga
      // ega (100MB) — xato xabari qaysi endpoint chaqirilganiga qarab to'g'ri
      // limitni ko'rsatishi kerak, aks holda foydalanuvchi "5MB" deb noto'g'ri
      // xabar oladi, aslida 100MB limit bo'lsa ham.
      const isGalleryUpload = req.originalUrl.includes('/gallery');
      const maxSize = isGalleryUpload
        ? (process.env.MAX_GALLERY_UPLOAD_SIZE_MB || 100)
        : (process.env.MAX_UPLOAD_SIZE_MB || 5);
      message = `Fayl hajmi juda katta. Maksimal ${maxSize}MB ruxsat etilgan.`;
    } else {
      message = 'Fayl yuklashda xatolik yuz berdi.';
    }
  }

  const response = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.errorName = err.name;
  }

  res.status(statusCode).json(response);
}

/**
 * Mavjud bo'lmagan endpoint uchun 404.
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Yo'l topilmadi: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = { errorHandler, notFoundHandler };
