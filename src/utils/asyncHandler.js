/**
 * Har bir async controller funksiyasini o'raydi, shunda try/catch yozish
 * shart emas — har qanday tashlab yuborilgan xato avtomatik ravishda
 * errorMiddleware'ga next(error) orqali yetib boradi.
 *
 * Ishlatilishi:
 *   router.get('/', asyncHandler(async (req, res) => { ... }));
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
