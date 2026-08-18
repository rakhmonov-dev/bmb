const multer = require('multer');

const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_MIME_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_GALLERY_MIME_TYPES = [...ALLOWED_IMAGE_MIME_TYPES, ...ALLOWED_VIDEO_MIME_TYPES];

/**
 * Fayllar diskka emas, xotiraga (RAM'ga, req.file.buffer sifatida)
 * qabul qilinadi — chunki Render kabi platformalarda disk doimiy emas.
 * Bufer keyin controller'da to'g'ridan-to'g'ri R2'ga yuboriladi
 * (config/r2.js), diskka umuman yozilmaydi.
 */
const memoryStorage = multer.memoryStorage();

function imageOnlyFilter(req, file, cb) {
  if (ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Faqat JPEG, PNG yoki WEBP formatidagi rasmlar qabul qilinadi.'));
  }
}

/**
 * Galereya rasm HAM video qabul qiladi — o'qituvchi/fikr rasmlaridan farqli
 * o'laroq, chunki foydalanuvchi dars/tadbir videolarini ham yuklashi kerak.
 */
function galleryMediaFilter(req, file, cb) {
  if (ALLOWED_GALLERY_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Faqat JPEG, PNG, WEBP rasm yoki MP4, WEBM, MOV video formatlar qabul qilinadi.'));
  }
}

function createUploader({ fileFilter = imageOnlyFilter, maxSizeMb } = {}) {
  return multer({
    storage: memoryStorage,
    fileFilter,
    limits: {
      fileSize: (maxSizeMb || Number(process.env.MAX_UPLOAD_SIZE_MB) || 5) * 1024 * 1024,
    },
  });
}

const uploadTeacherPhoto = createUploader();
const uploadTestimonialPhoto = createUploader();

// Galereya uchun kattaroq limit (video fayllar rasmlardan ancha katta bo'ladi)
const uploadGalleryMedia = createUploader({
  fileFilter: galleryMediaFilter,
  maxSizeMb: Number(process.env.MAX_GALLERY_UPLOAD_SIZE_MB) || 100,
});

module.exports = {
  uploadTeacherPhoto,
  uploadTestimonialPhoto,
  uploadGalleryMedia,
  ALLOWED_VIDEO_MIME_TYPES,
};
