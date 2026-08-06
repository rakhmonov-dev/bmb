const courseRepository = require('../repositories/courseRepository');

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
    this.name = 'NotFoundError';
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 409;
    this.name = 'ConflictError';
  }
}

/**
 * Kurs nomidan URL-friendly slug yaratadi.
 * Lotin-o'zbek harflarini transliteratsiya qiladi (masalan o' -> o, g' -> g).
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[o']/g, 'o')
    .replace(/[g']/g, 'g')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function getAll(includeInactive = false) {
  return courseRepository.findAll({ includeInactive });
}

async function getById(id) {
  const course = await courseRepository.findById(id);
  if (!course) throw new NotFoundError('Kurs topilmadi.');
  return course;
}

async function getBySlug(slug) {
  const course = await courseRepository.findBySlug(slug);
  if (!course) throw new NotFoundError('Kurs topilmadi.');
  return course;
}

async function create(data) {
  let slug = data.slug || generateSlug(data.title);
  let suffix = 1;
  const baseSlug = slug;

  while (await courseRepository.slugExists(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return courseRepository.create({ ...data, slug });
}

async function update(id, data) {
  await getById(id);

  if (data.slug) {
    const slugTaken = await courseRepository.slugExists(data.slug, id);
    if (slugTaken) {
      throw new ConflictError('Bu slug allaqachon boshqa kurs tomonidan ishlatilgan.');
    }
  }

  return courseRepository.update(id, data);
}

async function remove(id) {
  await getById(id);
  return courseRepository.remove(id);
}

module.exports = { getAll, getById, getBySlug, create, update, remove, generateSlug, NotFoundError, ConflictError };
