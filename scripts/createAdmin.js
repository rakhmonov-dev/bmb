/**
 * Yangi admin hisobini to'g'ridan-to'g'ri bazaga qo'shish uchun skript.
 * Bu seed.sql'dagi standart admin'dan farqli o'laroq, real parolni
 * xavfsiz tarzda hash qilib, darhol bazaga yozadi.
 *
 * Ishlatilishi:
 *   node scripts/createAdmin.js "Ism Familiya" "email@misol.uz" "Parol123"
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const SALT_ROUNDS = 10;

async function main() {
  const [fullName, email, password] = process.argv.slice(2);

  if (!fullName || !email || !password) {
    console.error('❌ Xatolik: barcha argumentlar kiritilishi shart.');
    console.log('Ishlatilishi: node scripts/createAdmin.js "Ism Familiya" "email@misol.uz" "Parol123"');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('❌ Xatolik: parol kamida 6 belgidan iborat bo\'lishi kerak.');
    process.exit(1);
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bmg_school',
  });

  try {
    const [existing] = await connection.query('SELECT id FROM admins WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.error(`❌ Xatolik: "${email}" email bilan admin allaqachon mavjud.`);
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await connection.query(
      'INSERT INTO admins (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [fullName, email, passwordHash, 'super_admin']
    );

    console.log('=====================================================');
    console.log('✅ Admin muvaffaqiyatli yaratildi!');
    console.log('=====================================================');
    console.log(`   ID: ${result.insertId}`);
    console.log(`   Ism: ${fullName}`);
    console.log(`   Email: ${email}`);
    console.log(`   Rol: super_admin`);
    console.log('=====================================================');
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error('❌ Xatolik yuz berdi:', error.message);
  process.exit(1);
});
