-- BMG School: English + Matematika placement test
-- Aiven MySQL / defaultdb da BIR MARTA ishga tushiring.

ALTER TABLE test_questions
  ADD COLUMN subject ENUM('english','math') NOT NULL DEFAULT 'english' AFTER correct_option,
  ADD COLUMN grade_level TINYINT UNSIGNED NULL AFTER cefr_level;

-- Math natijasi "8-sinf" kabi qiymat bo'lishi uchun mavjud natija ustunlarini universal qilamiz.
ALTER TABLE test_attempts MODIFY determined_level VARCHAR(30) NULL;
ALTER TABLE applications MODIFY determined_level VARCHAR(30) NULL;

-- 15 ta matematika savoli: 5–11-sinf, osondan qiyinga.
INSERT INTO test_questions
(question_text, option_a, option_b, option_c, option_d, correct_option, subject, cefr_level, grade_level, points, display_order, is_active)
VALUES
('48 ÷ 6 + 7 = ?', '13', '15', '14', '16', 'b', 'math', NULL, 5, 1, 1, 1),
('3/4 ning 20 ga ko‘paytmasi nechaga teng?', '12', '15', '16', '18', 'b', 'math', NULL, 5, 1, 2, 1),
('x + 17 = 42 bo‘lsa, x = ?', '25', '24', '26', '59', 'a', 'math', NULL, 6, 1, 3, 1),
('To‘g‘ri to‘rtburchak tomonlari 8 sm va 5 sm. Yuzi?', '13 sm²', '26 sm²', '40 sm²', '80 sm²', 'c', 'math', NULL, 6, 1, 4, 1),
('2x - 5 = 13 tenglamaning yechimi?', '4', '8', '9', '18', 'c', 'math', NULL, 7, 1, 5, 1),
('(-3)² - 4 = ?', '5', '-13', '13', '-5', 'a', 'math', NULL, 7, 1, 6, 1),
('(x + 3)(x - 3) ifodani soddalashtiring.', 'x² - 9', 'x² + 9', 'x² - 6x + 9', 'x² + 6x + 9', 'a', 'math', NULL, 8, 1, 7, 1),
('x² = 49 tenglamaning ildizlari?', '7', '-7', '±7', '49', 'c', 'math', NULL, 8, 1, 8, 1),
('x² - 5x + 6 = 0 tenglamaning ildizlari?', '1 va 6', '2 va 3', '-2 va -3', '3 va 5', 'b', 'math', NULL, 9, 1, 9, 1),
('√144 + √25 = ?', '17', '19', '13', '169', 'a', 'math', NULL, 9, 1, 10, 1),
('log₂ 32 = ?', '4', '5', '16', '10', 'b', 'math', NULL, 10, 1, 11, 1),
('sin 30° ning qiymati?', '1', '√3/2', '1/2', '0', 'c', 'math', NULL, 10, 1, 12, 1),
('2ˣ = 16 bo‘lsa, x = ?', '2', '3', '4', '8', 'c', 'math', NULL, 11, 1, 13, 1),
('f(x)=x²-4x+1 bo‘lsa, f(3)=?', '-2', '2', '4', '-4', 'a', 'math', NULL, 11, 1, 14, 1),
('Arifmetik progressiyada a₁=3, d=4. a₅ ni toping.', '15', '17', '19', '23', 'c', 'math', NULL, 11, 1, 15, 1);
