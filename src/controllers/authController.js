const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Helper untuk generate token
const generateToken = (user) => {
  return jwt.sign(
    {
      id_user: user.id_user,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

const register = async (req, res, next) => {
  try {
    const { nama, email, password } = req.validatedBody;

    // Check email sudah terdaftar
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar'
      });
    }

    // Create user (always assign role 'user' for registrations)
    const user = await User.create({
      nama,
      email,
      password,
      role: 'user'
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: {
        id_user: user.id_user,
        nama: user.nama,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password tidak valid'
      });
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password tidak valid'
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        id_user: user.id_user,
        nama: user.nama,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id_user, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Profile berhasil diambil',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getUserProfile
};
