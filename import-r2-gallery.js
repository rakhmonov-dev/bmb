require('dotenv').config();

const {
  S3Client,
  ListObjectsV2Command,
} = require('@aws-sdk/client-s3');

const { pool } = require('./src/config/database');

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const PREFIX = 'bmg-school/gallery/';
const PUBLIC_URL = (
  process.env.R2_PUBLIC_URL ||
  'https://pub-de6eda5b8a2242589df3341acf68f0dd.r2.dev'
).replace(/\/+$/, '');

function getMediaType(key) {
  const ext = key.split('.').pop().toLowerCase();

  const videoExtensions = [
    'mp4', 'mov', 'webm', 'avi', 'mkv', 'm4v'
  ];

  return videoExtensions.includes(ext) ? 'video' : 'image';
}

async function getAllR2Files() {
  let continuationToken;
  const files = [];

  do {
    const response = await s3.send(
      new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME,
        Prefix: PREFIX,
        ContinuationToken: continuationToken,
      })
    );

    for (const object of response.Contents || []) {
      if (object.Key !== PREFIX) {
        files.push(object);
      }
    }

    continuationToken = response.IsTruncated
      ? response.NextContinuationToken
      : undefined;

  } while (continuationToken);

  return files;
}

async function main() {
  let connection;

  try {
    console.log('R2 gallery fayllari olinmoqda...');

    const files = await getAllR2Files();

    console.log(`R2 dan ${files.length} ta fayl topildi.`);

    if (!files.length) {
      console.log('Fayl topilmadi.');
      return;
    }

    // Upload vaqti bo'yicha tartiblaymiz
    files.sort(
      (a, b) => new Date(a.LastModified) - new Date(b.LastModified)
    );

    connection = await pool.getConnection();

    const [existing] = await connection.query(
      'SELECT COUNT(*) AS total FROM gallery_images'
    );

    if (existing[0].total !== 0) {
      console.log(
        `STOP: gallery_images bo'sh emas (${existing[0].total} ta yozuv bor).`
      );
      console.log('Hech narsa o‘zgartirilmadi.');
      return;
    }

    await connection.beginTransaction();

    let inserted = 0;

    for (const file of files) {
      const url = `${PUBLIC_URL}/${file.Key}`;
      const mediaType = getMediaType(file.Key);

      await connection.query(
        `
        INSERT INTO gallery_images
          (
            image_url,
            media_type,
            caption,
            category,
            is_active,
            display_order
          )
        VALUES (?, ?, NULL, NULL, 1, ?)
        `,
        [url, mediaType, inserted]
      );

      inserted++;

      console.log(
        `${inserted}. [${mediaType}] ${url}`
      );
    }

    await connection.commit();

    console.log('');
    console.log('======================================');
    console.log(`TAYYOR: ${inserted} ta media DB ga qo'shildi.`);
    console.log('======================================');

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error('XATO:', error);
  } finally {
    if (connection) {
      connection.release();
    }

    await pool.end();
  }
}

main();