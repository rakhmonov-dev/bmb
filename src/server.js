  const app = require('./app');
  const { testConnection } = require('./config/database');

  const PORT = process.env.PORT || 5000;

  /**
   * Serverni ishga tushirishdan oldin MySQL ulanishini tekshiramiz.
   * Agar baza ulanmasa, server "yashirin xato" holatida ishlab
   * qolmasligi uchun to'xtatiladi — bu production'da debugging vaqtini
   * sezilarli qisqartiradi.
   */
  async function startServer() {
    const isDbConnected = await testConnection();

    if (!isDbConnected) {
      console.error('🛑 Server ishga tushmadi: MySQL bazasiga ulanib bo\'lmadi.');
      console.error('   .env faylidagi DB_HOST, DB_USER, DB_PASSWORD, DB_NAME qiymatlarini tekshiring.');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log('=====================================================');
      console.log(`🚀 BMG School backend ${PORT}-portda ishga tushdi`);
      console.log(`   Muhit: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   API manzili: http://localhost:${PORT}/api`);
      console.log('=====================================================');
    });
  }

  startServer();

  // Kutilmagan xatoliklarni tutib, serverni to'g'ri to'xtatish uchun
  process.on('unhandledRejection', (reason) => {
    console.error('🛑 Unhandled Rejection:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('🛑 Uncaught Exception:', error);
    process.exit(1);
  });
