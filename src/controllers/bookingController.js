const { Booking, Lapangan, User } = require('../models');
const { Op } = require('sequelize');

// Helper function untuk hitung durasi
const calculateDuration = (jamMulai, jamSelesai) => {
  const [hourStart, minStart] = jamMulai.split(':').map(Number);
  const [hourEnd, minEnd] = jamSelesai.split(':').map(Number);

  const startMinutes = hourStart * 60 + minStart;
  const endMinutes = hourEnd * 60 + minEnd;

  if (endMinutes <= startMinutes) {
    return null; // Invalid time range
  }

  return (endMinutes - startMinutes) / 60; // Return dalam jam
};

const createBooking = async (req, res, next) => {
  try {
    const { id_lapangan, tanggal, jam_mulai, jam_selesai } = req.validatedBody;
    const userId = req.user.id_user;

    // Check lapangan exists
    const lapangan = await Lapangan.findByPk(id_lapangan);
    if (!lapangan) {
      return res.status(404).json({
        success: false,
        message: 'Lapangan tidak ditemukan'
      });
    }

    // Validate jam
    const duration = calculateDuration(jam_mulai, jam_selesai);
    if (!duration) {
      return res.status(400).json({
        success: false,
        message: 'Jam selesai harus lebih besar dari jam mulai dan format harus valid'
      });
    }

    // Check availability - cari booking yang sudah paid/pending di jam yang sama
    const existingBooking = await Booking.findOne({
      where: {
        id_lapangan,
        tanggal: {
          [Op.gte]: new Date(tanggal),
          [Op.lt]: new Date(new Date(tanggal).getTime() + 24 * 60 * 60 * 1000)
        },
        status_pembayaran: { [Op.in]: ['pending', 'paid'] },
        [Op.or]: [
          {
            jam_mulai: {
              [Op.lte]: jam_mulai
            },
            jam_selesai: {
              [Op.gt]: jam_mulai
            }
          },
          {
            jam_mulai: {
              [Op.lt]: jam_selesai
            },
            jam_selesai: {
              [Op.gte]: jam_selesai
            }
          },
          {
            jam_mulai: {
              [Op.gte]: jam_mulai
            },
            jam_selesai: {
              [Op.lte]: jam_selesai
            }
          }
        ]
      }
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: 'Lapangan sudah terbooking di jam tersebut'
      });
    }

    // Calculate total price
    const totalHarga = parseFloat(lapangan.harga_per_jam) * duration;

    // Set payment deadline (15 minutes from now)
    const batasPembayaran = new Date(Date.now() + 15 * 60 * 1000);

    // Create booking
    const booking = await Booking.create({
      id_user: userId,
      id_lapangan,
      tanggal: new Date(tanggal),
      jam_mulai,
      jam_selesai,
      total_harga: totalHarga,
      status: 'booked',
      status_pembayaran: 'pending',
      batas_pembayaran: batasPembayaran
    });

    // Update lapangan status to booked
    await lapangan.update({ status: 'booked' });

    res.status(201).json({
      success: true,
      message: 'Booking berhasil dibuat. Silahkan lakukan pembayaran dalam 15 menit',
      data: {
        ...booking.toJSON(),
        batas_pembayaran_in: Math.round((batasPembayaran - Date.now()) / 1000) + ' detik'
      }
    });
  } catch (error) {
    next(error);
  }
};

const getUserBookings = async (req, res, next) => {
  try {
    const userId = req.user.id_user;

    const bookings = await Booking.findAll({
      where: { id_user: userId },
      include: [
        {
          model: Lapangan,
          as: 'lapangan',
          attributes: ['id_lapangan', 'nama_lapangan', 'harga_per_jam']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id_user', 'nama', 'email']
        }
      ],
      order: [['tanggal', 'DESC']]
    });

    res.json({
      success: true,
      message: 'Data booking berhasil diambil',
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id_user;

    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: Lapangan,
          as: 'lapangan',
          attributes: ['id_lapangan', 'nama_lapangan', 'harga_per_jam']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id_user', 'nama', 'email']
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking tidak ditemukan'
      });
    }

    // Check authorization - user hanya bisa lihat booking mereka sendiri, atau admin bisa lihat semua
    if (req.user.role !== 'admin' && booking.id_user !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke booking ini'
      });
    }

    res.json({
      success: true,
      message: 'Data booking berhasil diambil',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

const confirmPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id_user;

    const booking = await Booking.findByPk(id, {
      include: {
        model: Lapangan,
        as: 'lapangan'
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking tidak ditemukan'
      });
    }

    // Check authorization
    if (booking.id_user !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke booking ini'
      });
    }

    // Check if already paid
    if (booking.status_pembayaran === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Booking sudah dibayar'
      });
    }

    // Check payment deadline
    if (Date.now() > booking.batas_pembayaran.getTime()) {
      // Update status to expired
      await booking.update({
        status_pembayaran: 'expired',
        status: 'available'
      });

      // Update lapangan status back to available
      await booking.lapangan.update({ status: 'available' });

      return res.status(400).json({
        success: false,
        message: 'Batas waktu pembayaran sudah habis. Booking dibatalkan otomatis.'
      });
    }

    // Confirm payment
    await booking.update({
      status_pembayaran: 'paid',
      status: 'booked'
    });

    res.json({
      success: true,
      message: 'Pembayaran berhasil dikonfirmasi',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id_user;

    const booking = await Booking.findByPk(id, {
      include: {
        model: Lapangan,
        as: 'lapangan'
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking tidak ditemukan'
      });
    }

    // Check authorization
    if (booking.id_user !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke booking ini'
      });
    }

    // Check status
    if (['expired', 'cancelled'].includes(booking.status_pembayaran)) {
      return res.status(400).json({
        success: false,
        message: 'Booking tidak bisa dibatalkan karena sudah di-cancel atau expired'
      });
    }

    // Cancel booking
    await booking.update({
      status_pembayaran: 'cancelled',
      status: 'available'
    });

    // Update lapangan status back to available
    await booking.lapangan.update({ status: 'available' });

    res.json({
      success: true,
      message: 'Booking berhasil dibatalkan'
    });
  } catch (error) {
    next(error);
  }
};

// Admin function - get all bookings
const getAllBookings = async (req, res, next) => {
  try {
    const { status_pembayaran, tanggal } = req.query;
    const where = {};

    if (status_pembayaran) {
      where.status_pembayaran = status_pembayaran;
    }

    if (tanggal) {
      where.tanggal = {
        [Op.gte]: new Date(tanggal),
        [Op.lt]: new Date(new Date(tanggal).getTime() + 24 * 60 * 60 * 1000)
      };
    }

    const bookings = await Booking.findAll({
      where,
      include: [
        {
          model: Lapangan,
          as: 'lapangan',
          attributes: ['id_lapangan', 'nama_lapangan', 'harga_per_jam']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id_user', 'nama', 'email']
        }
      ],
      order: [['tanggal', 'DESC']]
    });

    res.json({
      success: true,
      message: 'Data booking berhasil diambil',
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// Auto check and expire bookings
const checkExpiredBookings = async (req, res, next) => {
  try {
    const now = new Date();

    // Find all pending bookings yang sudah melewati batas pembayaran
    const expiredBookings = await Booking.findAll({
      where: {
        status_pembayaran: 'pending',
        batas_pembayaran: {
          [Op.lt]: now
        }
      },
      include: {
        model: Lapangan,
        as: 'lapangan'
      }
    });

    // Update all to expired
    for (const booking of expiredBookings) {
      await booking.update({
        status_pembayaran: 'expired',
        status: 'available'
      });

      await booking.lapangan.update({ status: 'available' });
    }

    res.json({
      success: true,
      message: `${expiredBookings.length} booking(s) telah diexpire otomatis`,
      data: {
        expired_count: expiredBookings.length
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  confirmPayment,
  cancelBooking,
  getAllBookings,
  checkExpiredBookings
};
