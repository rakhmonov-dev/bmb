/**
 * MySQL ulanish pool konfiguratsiyasi.
 * mysql2/promise ishlatiladi — async/await bilan to'g'ridan-to'g'ri
 * ishlash uchun (Sequelize/Prisma/TypeORM ishlatilmaydi, spec talabiga ko'ra).
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bmg_school',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci',
  dateStrings: false,
  timezone: 'Z',
});

/**
 * Ulanishni ishga tushirishda tekshirish uchun.
 * server.js ichida chaqiriladi — agar DB ulanmasa, server ishga tushmaydi
 * (production'da "server ishlayapti-lekin-DB-yo'q" holatidan qochish uchun).
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ MySQL bazasiga muvaffaqiyatli ulandi.');
    return true;
  } catch (error) {
    console.error('❌ MySQL bazasiga ulanishda xatolik:', error.message);
    return false;
  }
}

module.exports = { pool, testConnection };
