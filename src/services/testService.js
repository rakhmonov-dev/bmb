const testQuestionRepository = require('../repositories/testQuestionRepository');
const testAttemptRepository = require('../repositories/testAttemptRepository');
const { TESTABLE_CEFR_LEVELS, MATH_GRADE_LEVELS } = require('../config/constants');

class TestServiceError extends Error {
  constructor(message, statusCode = 400) { super(message); this.statusCode = statusCode; this.name = 'TestServiceError'; }
}

function normalizeSubject(subject) {
  return subject === 'math' ? 'math' : 'english';
}

async function getPublicQuestions(subject) {
  const normalized = normalizeSubject(subject);
  const questions = await testQuestionRepository.findAllForPublicTest(normalized);
  if (!questions.length) throw new TestServiceError('Hozircha bu fan uchun test savollari mavjud emas.', 503);
  return questions;
}

async function submitEnglish(answers, questions, ipAddress) {
  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const levelStats = Object.fromEntries(TESTABLE_CEFR_LEVELS.map((l) => [l, { correct: 0, total: 0, points: 0, maxPoints: 0 }]));
  let totalScore = 0, maxScore = 0;
  const details = [];
  for (const answer of answers) {
    const q = questionMap.get(answer.questionId); if (!q) continue;
    const stats = levelStats[q.cefr_level]; if (!stats) continue;
    const points = q.points || 1; const isCorrect = q.correct_option === answer.selectedOption;
    stats.total++; stats.maxPoints += points; maxScore += points;
    if (isCorrect) { stats.correct++; stats.points += points; totalScore += points; }
    details.push({ questionId: q.id, selectedOption: answer.selectedOption, isCorrect, level: q.cefr_level });
  }
  let determinedLevel = 'Boshlangich';
  for (const level of TESTABLE_CEFR_LEVELS) {
    const s = levelStats[level]; if (!s.total) continue;
    if (s.correct / s.total >= 0.6) determinedLevel = level; else break;
  }
  const attempt = await testAttemptRepository.create({ score: totalScore, maxScore, determinedLevel, answersJson: { subject: 'english', details, levelStats }, ipAddress });
  return { attemptId: attempt.id, subject: 'english', score: totalScore, maxScore, percentage: maxScore ? Math.round(totalScore / maxScore * 100) : 0, determinedLevel, levelBreakdown: levelStats };
}

async function submitMath(answers, questions, ipAddress) {
  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const gradeStats = Object.fromEntries(MATH_GRADE_LEVELS.map((g) => [g, { correct: 0, total: 0, points: 0, maxPoints: 0 }]));
  let totalScore = 0, maxScore = 0;
  const details = [];
  for (const answer of answers) {
    const q = questionMap.get(answer.questionId); if (!q || !gradeStats[q.grade_level]) continue;
    const points = q.points || 1; const isCorrect = q.correct_option === answer.selectedOption;
    const stats = gradeStats[q.grade_level]; stats.total++; stats.maxPoints += points; maxScore += points;
    if (isCorrect) { stats.correct++; stats.points += points; totalScore += points; }
    details.push({ questionId: q.id, selectedOption: answer.selectedOption, isCorrect, gradeLevel: q.grade_level });
  }
  // Sinf natijasi ketma-ket bilimni tekshiradi: har sinf blokida kamida 50%.
  let grade = 5;
  let passedAny = false;
  for (const g of MATH_GRADE_LEVELS) {
    const s = gradeStats[g]; if (!s.total) continue;
    if (s.correct / s.total >= 0.5) { grade = g; passedAny = true; } else break;
  }
  const determinedLevel = passedAny ? `${grade}-sinf` : '5-sinfgacha';
  const attempt = await testAttemptRepository.create({ score: totalScore, maxScore, determinedLevel, answersJson: { subject: 'math', details, gradeStats }, ipAddress });
  return { attemptId: attempt.id, subject: 'math', score: totalScore, maxScore, percentage: maxScore ? Math.round(totalScore / maxScore * 100) : 0, determinedLevel, gradeLevel: passedAny ? grade : null, levelBreakdown: gradeStats };
}

async function submitTest(answers, ipAddress, subject) {
  if (!Array.isArray(answers) || !answers.length) throw new TestServiceError("Javoblar ro'yxati bo'sh bo'lishi mumkin emas.");
  const normalized = normalizeSubject(subject);
  const ids = answers.map((a) => a.questionId);
  const questions = await testQuestionRepository.findByIdsWithAnswers(ids, normalized);
  if (!questions.length) throw new TestServiceError('Savollar topilmadi.', 404);
  return normalized === 'math' ? submitMath(answers, questions, ipAddress) : submitEnglish(answers, questions, ipAddress);
}

module.exports = { getPublicQuestions, submitTest, TestServiceError };
