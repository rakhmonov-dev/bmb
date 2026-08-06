# BMG School — Backend API

Ingliz tili o'quv markazi uchun REST API. Node.js + Express + MySQL (mysql2, ORM'siz).

## Arxitektura

```
src/
├── config/         → Database pool, konstantalar
├── controllers/    → HTTP request/response boshqarish
├── services/       → Biznes mantiq (test balini hisoblash, JWT, AI fallback)
├── repositories/    → Xom SQL so'rovlar (mysql2)
├── routes/          → Endpoint'larni controller'larga bog'lash
├── middlewares/     → Auth, xato ishlov berish, fayl yuklash, rate limit
├── validators/      → express-validator sxemalari
└── server.js        → Kirish nuqtasi
```

Pattern: **Controller → Service → Repository**. Controller HTTP bilan ishlaydi, Service biznes qoidalarni qo'llaydi, Repository faqat SQL yozadi.

## O'rnatish

```bash
cd backend
npm install
cp .env.example .env
# .env faylini oching va DB_PASSWORD, JWT_SECRET qiymatlarini kiriting
```

## Ma'lumotlar bazasini tayyorlash

```bash
mysql -u root -p < ../database/schema.sql
mysql -u root -p bmg_school < ../database/seed.sql
```

`seed.sql` standart admin yaratadi: `admin@bmgschool.uz` / `Admin123!`

**Muhim:** ishga tushirgandan keyin darhol parolni o'zgartiring:

```bash
node scripts/hashPassword.js "YangiKuchliParolingiz"
# Chiqqan hash'ni quyidagi SQL bilan qo'ying:
# UPDATE admins SET password_hash = '<hash>' WHERE email = 'admin@bmgschool.uz';
```

Yoki butunlay yangi admin yaratish:

```bash
node scripts/createAdmin.js "Ismingiz" "email@misol.uz" "Parolingiz123"
```

## Ishga tushirish

```bash
npm run dev     # nodemon bilan (development)
npm start       # production
```

Server ishga tushganda avval MySQL ulanishini tekshiradi — agar baza ulanmasa, server ishga tushmaydi (bu debugging vaqtini tejaydi).

## AI Support Chat

`.env` faylida `OPENAI_API_KEY` bo'lmasa yoki OpenAI xatolik qaytarsa, chat avtomatik ravishda `ai_knowledge_base` jadvalidagi kalit so'zlarga asoslangan fallback rejimiga o'tadi. Chat hech qachon butunlay "o'lik" bo'lib qolmaydi.

Bilim bazasini boshlang'ich holatda `database/seed.sql` to'ldiradi; admin panel orqali kengaytirish mumkin (`/api/ai/knowledge` endpoint'lari).

## Asosiy endpoint'lar

| Metod | Yo'l | Tavsif |
|---|---|---|
| POST | `/api/auth/login` | Admin kirishi |
| GET | `/api/courses` | Faol kurslar (public) |
| GET | `/api/test/questions` | Test savollari (to'g'ri javobsiz) |
| POST | `/api/test/submit` | Javoblarni yuborish, daraja olish |
| POST | `/api/applications` | Ariza yuborish |
| GET | `/api/applications/dashboard-stats` | Dashboard statistikasi (admin) |
| POST | `/api/ai/chat` | AI Support chat |
| GET | `/api/health` | Health check |

To'liq ro'yxat `src/routes/` papkasida.

## Deploy (Railway tavsiya etiladi)

1. Railway'da yangi loyiha, MySQL plugin qo'shing
2. Railway avtomatik beradigan `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`ni `.env`ga ko'chiring
3. `schema.sql` va `seed.sql`ni Railway MySQL'ga ishga tushiring
4. `FRONTEND_URL`ni frontend domeningizga o'zgartiring
5. Deploy qiling — `npm start` avtomatik ishga tushadi
