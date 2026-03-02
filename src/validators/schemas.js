const Joi = require('joi');

const registerSchema = Joi.object({
  nama: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Nama minimal 3 karakter',
    'string.max': 'Nama maksimal 100 karakter',
    'any.required': 'Nama harus diisi'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email tidak valid',
    'any.required': 'Email harus diisi'
  }),
  password: Joi.string().min(6).max(255).required().messages({
    'string.min': 'Password minimal 6 karakter',
    'string.max': 'Password maksimal 255 karakter',
    'any.required': 'Password harus diisi'
  }),
  // role intentionally omitted from register request - server assigns default 'user'
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email tidak valid',
    'any.required': 'Email harus diisi'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password harus diisi'
  })
});

const lapanganSchema = Joi.object({
  nama_lapangan: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Nama lapangan minimal 3 karakter',
    'any.required': 'Nama lapangan harus diisi'
  }),
  harga_per_jam: Joi.number().positive().required().messages({
    'number.positive': 'Harga per jam harus lebih dari 0',
    'any.required': 'Harga per jam harus diisi'
  }),
  deskripsi: Joi.string().optional()
});

const bookingSchema = Joi.object({
  id_lapangan: Joi.string().uuid().required().messages({
    'string.uuid': 'ID lapangan tidak valid',
    'any.required': 'ID lapangan harus diisi'
  }),
  tanggal: Joi.date().iso().required().messages({
    'date.iso': 'Format tanggal tidak valid (gunakan YYYY-MM-DD)',
    'any.required': 'Tanggal harus diisi'
  }),
  jam_mulai: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
    'string.pattern.base': 'Format jam mulai tidak valid (gunakan HH:MM)',
    'any.required': 'Jam mulai harus diisi'
  }),
  jam_selesai: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
    'string.pattern.base': 'Format jam selesai tidak valid (gunakan HH:MM)',
    'any.required': 'Jam selesai harus diisi'
  })
});

const paymentSchema = Joi.object({
  id_booking: Joi.string().uuid().required().messages({
    'string.uuid': 'ID booking tidak valid',
    'any.required': 'ID booking harus diisi'
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  lapanganSchema,
  bookingSchema,
  paymentSchema
};
