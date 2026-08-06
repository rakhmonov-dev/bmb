const testQuestionRepository = require('../repositories/testQuestionRepository');
const testAttemptRepository = require('../repositories/testAttemptRepository');
const { TESTABLE_CEFR_LEVELS } = require('../config/constants');

class TestServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'TestServiceError';
  }
}

/**
 * Public foydalanuvchi uchun savollar ro'yxati (to'g'ri javobsiz).
 */
async function getPublicQuestions() {
  const questions = await testQuestionRepository.findAllForPublicTest();
  if (questions.length === 0) {
    throw new TestServiceError('Hozircha test savollari mavjud emas. Administratorga xabar bering.', 503);
  }
  return questions;
}

/**
 * Foydalanuvchi javoblarini tekshirib, ballni hisoblaydi va CEFR darajasini
 * aniqlaydi.
 *
 * ALGORITM:
 * 1. Har bir savol o'ziga tegishli CEFR darajasiga (A1..C1) tegishli.
 * 2. Har bir daraja uchun to'g'ri javoblar foizi hisoblanadi.
 * 3. Foydalanuvchi darajasi — eng yuqori daraja bo'lib, unda va undan
 *    pastdagi barcha darajalarda to'g'ri javoblar foizi >= 60% bo'lishi kerak.
 *    (Bu "zanjir" mantiqiy — B1'ni "bilish" uchun A1 va A2'ni ham bilish kerak,
 *    aks holda yuqori darajadagi bir nechta to'g'ri taxmin xato daraja berib
 *    qo'yishi mumkin.)
 * 4. Agar A1 darajasida ham 60% dan past bo'lsa — "Boshlang'ich" beriladi.
 *
 * @param {Array<{questionId: number, selectedOption: 'a'|'b'|'c'|'d'}>} answers
 */
async function submitTest(answers, ipAddress) {
  if (!Array.isArray(answers) || answers.length === 0) {
    throw new TestServiceError('Javoblar ro\'yxati bo\'sh bo\'lishi mumkin emas.');
  }

  const questionIds = answers.map((a) => a.questionId);
  const questionsWithAnswers = await testQuestionRepository.findByIdsWithAnswers(questionIds);

  if (questionsWithAnswers.length === 0) {
    throw new TestServiceError('Savollar topilmadi.', 404);
  }

  const questionMap = new Map(questionsWithAnswers.map((q) => [q.id, q]));

  // Har bir CEFR darajasi bo'yicha statistika yig'amiz
  const levelStats = {};
  for (const level of TESTABLE_CEFR_LEVELS) {
    levelStats[level] = { correct: 0, total: 0, points: 0, maxPoints: 0 };
  }

  let totalScore = 0;
  let maxScore = 0;
  const answerDetails = [];

  for (const answer of answers) {
    const question = questionMap.get(answer.questionId);
    if (!question) continue; // noma'lum savol ID'sini e'tiborsiz qoldiramiz

    const level = question.cefr_level;
    const isCorrect = question.correct_option === answer.selectedOption;
    const points = question.points || 1;

    levelStats[level].total += 1;
    levelStats[level].maxPoints += points;
    if (isCorrect) {
      levelStats[level].correct += 1;
      levelStats[level].points += points;
      totalScore += points;
    }
    maxScore += points;

    answerDetails.push({
      questionId: answer.questionId,
      selectedOption: answer.selectedOption,
      isCorrect,
      level,
    });
  }

  // Zanjir mantiqi: eng yuqori "muvaffaqiyatli o'tilgan" darajani topamiz
  const PASS_THRESHOLD = 0.6; // 60%
  let determinedLevel = 'Boshlangich';

  for (const level of TESTABLE_CEFR_LEVELS) {
    const stats = levelStats[level];
    if (stats.total === 0) {
      // Bu daraja uchun savol bo'lmasa, zanjirni to'xtatmaymiz — o'tkazib yuboramiz
      continue;
    }
    const percentage = stats.correct / stats.total;
    if (percentage >= PASS_THRESHOLD) {
      determinedLevel = level;
    } else {
      break; // zanjir uzildi — undan yuqori darajalarni tekshirmaymiz
    }
  }

  const attempt = await testAttemptRepository.create({
    score: totalScore,
    maxScore,
    determinedLevel,
    answersJson: { details: answerDetails, levelStats },
    ipAddress,
  });

  return {
    attemptId: attempt.id,
    score: totalScore,
    maxScore,
    percentage: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
    determinedLevel,
    levelBreakdown: levelStats,
  };
}

module.exports = { getPublicQuestions, submitTest, TestServiceError };
