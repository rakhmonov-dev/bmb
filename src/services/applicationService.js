const applicationRepository = require('../repositories/applicationRepository');
const teacherRepository = require('../repositories/teacherRepository');
const { APPLICATION_STATUSES, APPLICATION_STATUS_DISPLAY } = require('../config/constants');

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
    this.name = 'NotFoundError';
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
    this.name = 'ValidationError';
  }
}

async function getAllPaginated(filters, pagination) {
  return applicationRepository.findAllPaginated(filters, pagination);
}

async function getById(id) {
  const application = await applicationRepository.findById(id);
  if (!application) throw new NotFoundError('Ariza topilmadi.');
  return application;
}

/**
 * Placement test tugagandan keyin foydalanuvchi to'ldiradigan ariza.
 * testAttemptId, testScore, determinedLevel testService.submitTest() dan
 * kelgan natija bilan frontend orqali qayta yuboriladi.
 */
async function create(data) {
  return applicationRepository.create(data);
}

async function updateStatus(id, status, adminNote) {
  if (!APPLICATION_STATUSES.includes(status)) {
    throw new ValidationError(`Noto'g'ri status: ${status}`);
  }
  await getById(id);
  return applicationRepository.updateStatus(id, status, adminNote);
}

async function remove(id) {
  await getById(id);
  return applicationRepository.remove(id);
}

/**
 * Admin dashboard uchun to'liq statistika to'plami — bitta chaqiruvda
 * frontend'ga barcha kerakli ma'lumotlarni beradi.
 */
async function getDashboardStats() {
  const [statusCountsRaw, totalApplications, dailyCounts, recentApplications, levelDistributionRaw, allTeachers] =
    await Promise.all([
      applicationRepository.getStatusCounts(),
      applicationRepository.getTotalCount(),
      applicationRepository.getDailyCountsLastNDays(30),
      applicationRepository.getRecent(5),
      applicationRepository.getLevelDistribution(),
      teacherRepository.findAll({ includeInactive: true }),
    ]);

  // Barcha statuslarni 0 bilan to'ldirib, keyin haqiqiy qiymatlar bilan almashtiramiz
  const statusCounts = {};
  for (const status of APPLICATION_STATUSES) {
    statusCounts[status] = 0;
  }
  for (const row of statusCountsRaw) {
    statusCounts[row.status] = row.count;
  }

  const statusCountsForChart = APPLICATION_STATUSES.map((status) => ({
    status,
    label: APPLICATION_STATUS_DISPLAY[status],
    count: statusCounts[status],
  }));

  return {
    totals: {
      applications: totalApplications,
      teachers: allTeachers.filter((t) => t.is_active).length,
      newApplications: statusCounts.Yangi,
      enrolled: statusCounts.Oqishga_yozildi,
    },
    statusBreakdown: statusCountsForChart,
    dailyApplications: dailyCounts,
    levelDistribution: levelDistributionRaw,
    recentApplications,
  };
}

module.exports = { getAllPaginated, getById, create, updateStatus, remove, getDashboardStats, NotFoundError, ValidationError };
