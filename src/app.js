const express = require('express');
const cors = require('cors');
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

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
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

// ---------------------- API ROUTES ----------------------
app.use('/api', routes);

// ---------------------- 404 & ERROR HANDLING ----------------------
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
