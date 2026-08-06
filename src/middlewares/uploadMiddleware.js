const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Har bir kategoriya (teachers, testimonials) uchun alohida
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

function fileFilter(req, file, cb) {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Faqat JPEG, PNG yoki WEBP formatidagi rasmlar qabul qilinadi.'));
  }
}

function createUploader(subfolder) {
  return multer({
    storage: createStorage(subfolder),
    fileFilter,
    limits: {
      fileSize: (Number(process.env.MAX_UPLOAD_SIZE_MB) || 5) * 1024 * 1024,
    },
  });
}

const uploadTeacherPhoto = createUploader('teachers');
const uploadTestimonialPhoto = createUploader('testimonials');

module.exports = { uploadTeacherPhoto, uploadTestimonialPhoto };
