const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminRepository = require('../repositories/adminRepository');

const SALT_ROUNDS = 10;

class AuthError extends Error {
  constructor(message, statusCode = 401) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AuthError';
  }
}

async function login(email, password) {
  const admin = await adminRepository.findByEmail(email);
  if (!admin) {
    throw new AuthError("Email yoki parol noto'g'ri.");
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
  if (!isPasswordValid) {
    throw new AuthError("Email yoki parol noto'g'ri.");
  }

  await adminRepository.updateLastLogin(admin.id);

  const token = jwt.sign(
    { adminId: admin.id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  return {
    token,
    admin: {
      id: admin.id,
      fullName: admin.full_name,
      email: admin.email,
      role: admin.role,
    },
  };
}

async function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new AuthError('Token yaroqsiz yoki muddati tugagan.', 403);
  }
}

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

async function getProfile(adminId) {
  const admin = await adminRepository.findById(adminId);
  if (!admin) {
    throw new AuthError('Administrator topilmadi.', 404);
  }
  return admin;
}

module.exports = { login, verifyToken, hashPassword, getProfile, AuthError };
