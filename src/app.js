const express = require('express');
const cors = require('cors');
const { pool } = require('./config/database');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorMiddleware');
const { generalLimiter } = require('./middlewares/rateLimitMiddleware');

const app = express();

// ---------------------- SECURITY ----------------------
app.use(
  helmet({
    // crossOriginResourcePolicy o'chirilgan — aks holda /uploads dagi rasmlar
    // frontend (boshqa domen/port) tomonidan yuklanmaydi.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigins = [
  'https://www.bmgschools.uz',
  'https://bmgschools.uz',
  'https://bmgschool.vercel.app',
  'http://localhost:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Postman, server-to-server va origin bo'lmagan requestlarga ruxsat
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error(`CORS blocked: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ---------------------- PERFORMANCE ----------------------
app.use(compression());

// ---------------------- BODY PARSING ----------------------
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ---------------------- LOGGING ----------------------
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ---------------------- RATE LIMITING ----------------------
app.use('/api', generalLimiter);

// ---------------------- STATIC FILES (yuklangan rasmlar) ----------------------
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Tashqi "ping" xizmatlari (masalan cron-job.org, UptimeRobot) shu yo'lni
// har necha daqiqada chaqirib, Render'ning Free tarifidagi serverni
// uxlab qolishdan saqlab turadi. Bazaga ulanmaydi — juda tez javob beradi.
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');

    res.status(200).json({
      status: 'ok',
      database: 'connected',
      time: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Health check DB error:', error.message);

    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      time: new Date().toISOString(),
    });
  }
});

// ---------------------- API ROUTES ----------------------
app.use('/api', routes);

// ---------------------- 404 & ERROR HANDLING ----------------------
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
