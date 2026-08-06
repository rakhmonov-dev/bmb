/**
 * Buyruq qatoridan parolni bcrypt hash'ga aylantirish uchun yordamchi skript.
 *
 * Ishlatilishi:
 *   node scripts/hashPassword.js "MeningParolim123"
 *
 * Natijada chiqqan hash'ni database/seed.sql fayldagi admins jadvaliga
 * yoki to'g'ridan-to'g'ri MySQL'ga UPDATE orqali qo'yish mumkin:
 *   UPDATE admins SET password_hash = '<hash>' WHERE email = 'admin@bmgschool.uz';
 */
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function main() {
  const password = process.argv[2];

  if (!password) {
    console.error('❌ Xatolik: parol kiritilmadi.');
    console.log('Ishlatilishi: node scripts/hashPassword.js "SizningParolingiz"');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('❌ Xatolik: parol kamida 6 belgidan iborat bo\'lishi kerak.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  console.log('=====================================================');
  console.log('✅ Bcrypt hash muvaffaqiyatli generatsiya qilindi:');
  console.log('=====================================================');
  console.log(hash);
  console.log('=====================================================');
  console.log('\nBu hash\'ni quyidagi SQL orqali bazaga qo\'yishingiz mumkin:');
  console.log(`\nUPDATE admins SET password_hash = '${hash}' WHERE email = 'admin@bmgschool.uz';\n`);
}

main();
