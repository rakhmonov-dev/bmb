const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_MIME_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_GALLERY_MIME_TYPES = [...ALLOWED_IMAGE_MIME_TYPES, ...ALLOWED_VIDEO_MIME_TYPES];

/**
 * Har bir kategoriya (teachers, testimonials, gallery) uchun alohida
 * disk storage yaratadi va noyob fayl nomi generatsiya qiladi.
 */
function createStorage(subfolder) {
  const uploadPath = path.join(__dirname, '..', '..', 'uploads', subfolder);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${subfolder}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, uniqueName);
    },
  });
}

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

function createUploader(subfolder, { fileFilter = imageOnlyFilter, maxSizeMb } = {}) {
  return multer({
    storage: createStorage(subfolder),
    fileFilter,
    limits: {
      fileSize: (maxSizeMb || Number(process.env.MAX_UPLOAD_SIZE_MB) || 5) * 1024 * 1024,
    },
  });
}

const uploadTeacherPhoto = createUploader('teachers');
const uploadTestimonialPhoto = createUploader('testimonials');

// Galereya uchun kattaroq limit (video fayllar rasmlardan ancha katta bo'ladi)
const uploadGalleryMedia = createUploader('gallery', {
  fileFilter: galleryMediaFilter,
  maxSizeMb: Number(process.env.MAX_GALLERY_UPLOAD_SIZE_MB) || 100,
});

module.exports = {
  uploadTeacherPhoto,
  uploadTestimonialPhoto,
  uploadGalleryMedia,
  ALLOWED_VIDEO_MIME_TYPES,
};
