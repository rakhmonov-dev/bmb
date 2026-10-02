/**
 * Butun ilova bo'ylab ishlatiladigan doimiy qiymatlar.
 * Bu yerda markazlashtirish — magic string'larni turli fayllarga
 * tarqatib yubormaslik uchun.
 */

const CEFR_LEVELS = ['Boshlangich', 'A1', 'A2', 'B1', 'B2', 'C1'];

const CEFR_LEVELS_DISPLAY = {
  Boshlangich: "Boshlang'ich",
  A1: 'A1',
  A2: 'A2',
  B1: 'B1',
  B2: 'B2',
  C1: 'C1',
};

// Test savollari faqat A1-C1 uchun (Boshlang'ich — hech narsa bilmaydigan
// holat, savolsiz aniqlanadi: eng past ball natijasi)
const TESTABLE_CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const MATH_GRADE_LEVELS = [5, 6, 7, 8, 9, 10, 11];

const APPLICATION_STATUSES = [
  'Yangi',
  'Boglandi',
  'Suhbat',
  'Qabul_qilindi',
  'Rad_etildi',
  'Oqishga_yozildi',
];

const APPLICATION_STATUS_DISPLAY = {
  Yangi: 'Yangi',
  Boglandi: "Bog'landi",
  Suhbat: 'Suhbat',
  Qabul_qilindi: 'Qabul qilindi',
  Rad_etildi: 'Rad etildi',
  Oqishga_yozildi: "O'qishga yozildi",
};

const ADMIN_ROLES = ['super_admin', 'admin'];

module.exports = {
  CEFR_LEVELS,
  CEFR_LEVELS_DISPLAY,
  TESTABLE_CEFR_LEVELS,
  MATH_GRADE_LEVELS,
  APPLICATION_STATUSES,
  APPLICATION_STATUS_DISPLAY,
  ADMIN_ROLES,
};
