const crypto = require('crypto');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

/**
 * Cloudflare R2 — Amazon S3 bilan to'liq mos API'ga ega, shuning uchun
 * rasmiy AWS SDK orqali ulanamiz, faqat endpoint'ni R2'ga ko'rsatamiz.
 * Kerakli .env qiymatlari Cloudflare dashboard > R2 > "Manage API tokens"
 * bo'limidan olinadi (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY).
 */
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME;
// Bucket'ning ommaviy (public) manzili — R2.dev subdomeni yoki o'z domeningiz.
// Oxirida "/" bo'lmasin (masalan: https://pub-xxxxxxxx.r2.dev)
const PUBLIC_URL = (process.env.R2_PUBLIC_URL || '').replace(/\/+$/, '');

/**
 * Multer memoryStorage orqali kelgan fayl buferini (req.file.buffer) R2'ga
 * yuklaydi. Fayl nomi to'qnashmasligi uchun tasodifiy id bilan generatsiya
 * qilinadi, asl kengaytma saqlanadi.
 *
 * @param {Buffer} buffer - fayl buferi (req.file.buffer)
 * @param {string} folder - R2'dagi "papka" prefiksi, masalan "bmg-school/gallery"
 * @param {string} mimetype - req.file.mimetype
 * @param {string} originalName - req.file.originalname (kengaytmani olish uchun)
 * @returns {Promise<{url: string, key: string}>}
 */
async function uploadBufferToR2(buffer, folder, mimetype, originalName = '') {
  const ext = (originalName.split('.').pop() || '').toLowerCase();
  const safeExt = /^[a-z0-9]{1,5}$/.test(ext) ? ext : (mimetype.split('/')[1] || 'bin');
  const key = `${folder}/${crypto.randomUUID()}.${safeExt}`;

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  }));

  return { url: `${PUBLIC_URL}/${key}`, key };
}

/**
 * R2 ommaviy URL'idan ("https://pub-xxx.r2.dev/bmg-school/gallery/uuid.jpg")
 * bucket ichidagi kalitni ("bmg-school/gallery/uuid.jpg") ajratib oladi.
 */
function parseR2Url(url) {
  if (!url || !PUBLIC_URL || !url.startsWith(`${PUBLIC_URL}/`)) return null;
  return url.slice(PUBLIC_URL.length + 1);
}

/**
 * Eski faylni R2'dan o'chiradi. URL R2 formatida bo'lmasa (masalan eski,
 * Cloudinary yoki disk-asosidagi manzil) yoki fayl allaqachon yo'q bo'lsa,
 * xato tashlamaymiz — bu ma'lumot yo'qolishiga olib kelmasligi kerak.
 */
async function deleteFromR2(url) {
  try {
    const key = parseR2Url(url);
    if (!key) return;
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch (error) {
    console.error("⚠️  R2'dan faylni o'chirishda xatolik (e'tiborsiz qoldirildi):", error.message);
  }
}

module.exports = { uploadBufferToR2, deleteFromR2 };
