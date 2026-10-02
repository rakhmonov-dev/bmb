USE defaultdb;

ALTER TABLE courses
  ADD COLUMN subject ENUM('english','math') NOT NULL DEFAULT 'english' AFTER description,
  ADD COLUMN grade_range ENUM('5-7','8-9','10-11') NULL AFTER subject;

INSERT INTO courses
(title, slug, description, subject, grade_range, cefr_level_from, cefr_level_to,
 duration_months, lessons_per_week, price_amount, original_price, price_period,
 group_size_max, icon_name, teacher_id, is_active, display_order)
VALUES
('Matematika 5–7-sinf', 'matematika-5-7-sinf', '5–7-sinf o‘quvchilari uchun matematika asoslari, masalalar, algebra va geometriya bo‘yicha mustahkamlash kursi.', 'math', '5-7', 'A1', 'A1', 6, 3, 500000, NULL, 'oylik', 10, 'BookOpen', NULL, 1, 10),
('Matematika 8–9-sinf', 'matematika-8-9-sinf', '8–9-sinf o‘quvchilari uchun algebra, geometriya, tenglamalar va murakkab masalalarni yechish ko‘nikmalarini rivojlantirish kursi.', 'math', '8-9', 'A1', 'A1', 6, 3, 500000, NULL, 'oylik', 10, 'TrendingUp', NULL, 1, 11),
('Matematika 10–11-sinf', 'matematika-10-11-sinf', '10–11-sinf o‘quvchilari uchun yuqori darajadagi algebra, geometriya va imtihonlarga tayyorgarlik kursi.', 'math', '10-11', 'A1', 'A1', 6, 3, 500000, NULL, 'oylik', 10, 'Award', NULL, 1, 12);
