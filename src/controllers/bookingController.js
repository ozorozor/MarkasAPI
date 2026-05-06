const { Booking, Lapangan, User } = require('../models');
const { Op } = require('sequelize');

// ================= HELPER =================

// Hitung durasi
const calculateDuration = (jamMulai, jamSelesai) => {
  const [h1, m1] = jamMulai.split(':').map(Number);
  const [h2, m2] = jamSelesai.split(':').map(Number);

  const start = h1 * 60 + m1;
  const end = h2 * 60 + m2;

  if (end <= start) return null;

  return (end - start) / 60;
};

// 🔥 Harga pagi / malam
const calculateTotalPrice = (jamMulai, jamSelesai, lapangan) => {
  let total = 0;

  let start = parseInt(jamMulai.split(':')[0]);
  let end = parseInt(jamSelesai.split(':')[0]);

  for (let hour = start; hour < end; hour++) {
    if (hour < 16) {
      total += parseFloat(lapangan.harga_pagi);
    } else {
      total += parseFloat(lapangan.harga_malam);
    }
  }

  return total;
};

// ================= CREATE BOOKING =================

const createBooking = async (req, res, next) => {
  try {
    const { id_lapangan, tanggal, jam_mulai, jam_selesai } = req.validatedBody;
    const userId = req.user.id_user;

    const lapangan = await Lapangan.findByPk(id_lapangan);
    if (!lapangan) {
      return res.status(404).json({ success: false, message: 'Lapangan tidak ditemukan' });
    }

    const duration = calculateDuration(jam_mulai, jam_selesai);
    if (!duration) {
      return res.status(400).json({ success: false, message: 'Jam tidak valid' });
    }

    // 🔥 CEK TABRAKAN
    const existingBooking = await Booking.findOne({
      where: {
        id_lapangan,
        tanggal: {
          [Op.gte]: new Date(tanggal),
          [Op.lt]: new Date(new Date(tanggal).getTime() + 86400000)
        },
        status_pembayaran: { [Op.in]: ['pending', 'waiting_confirmation', 'paid'] },
        [Op.or]: [
          {
            jam_mulai: { [Op.lte]: jam_mulai },
            jam_selesai: { [Op.gt]: jam_mulai }
          },
          {
            jam_mulai: { [Op.lt]: jam_selesai },
            jam_selesai: { [Op.gte]: jam_selesai }
          },
          {
            jam_mulai: { [Op.gte]: jam_mulai },
            jam_selesai: { [Op.lte]: jam_selesai }
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

    // 🔥 HITUNG HARGA
    const rawTotal = calculateTotalPrice(jam_mulai, jam_selesai, lapangan);
    const diskon = lapangan.diskon_persen || 0;
    const totalHarga = Number((rawTotal * (100 - diskon) / 100).toFixed(2));

    const batasPembayaran = new Date(Date.now() + 15 * 60 * 1000);

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

    await lapangan.update({ status: 'booked' });

    res.status(201).json({
      success: true,
      message: 'Booking berhasil dibuat',
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

// ================= UPLOAD BUKTI =================

const uploadBukti = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });
    }

    if (booking.id_user !== req.user.id_user) {
      return res.status(403).json({ success: false, message: 'Bukan booking kamu' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Upload gambar dulu' });
    }

    await booking.update({
      bukti_pembayaran: req.file.filename,
      status_pembayaran: 'waiting_confirmation'
    });

    res.json({
      success: true,
      message: 'Menunggu konfirmasi admin',
      data: {
        id_booking: booking.id_booking,
        bukti_pembayaran: booking.bukti_pembayaran,
        status_pembayaran: booking.status_pembayaran
      }
    });
  } catch (err) {
    next(err);
  }
};

// ================= ADMIN CONFIRM =================

const confirmByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id, {
      include: { model: Lapangan, as: 'lapangan' }
    });

    if (!booking) {
      return res.status(404).json({ success: false });
    }

    await booking.update({
      status_pembayaran: 'paid',
      status: 'booked'
    });

    res.json({
      success: true,
      message: 'Booking dikonfirmasi',
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

// ================= ADMIN REJECT =================

const rejectBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id, {
      include: { model: Lapangan, as: 'lapangan' }
    });

    if (!booking) {
      return res.status(404).json({ success: false });
    }

    await booking.update({
      status_pembayaran: 'rejected',
      status: 'available'
    });

    await booking.lapangan.update({ status: 'available' });

    res.json({
      success: true,
      message: 'Booking ditolak'
    });
  } catch (err) {
    next(err);
  }
};

// ================= GET =================

const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      where: { id_user: req.user.id_user },
      include: [
        { model: Lapangan, as: 'lapangan' },
        { model: User, as: 'user', attributes: ['nama'] }
      ],
      order: [['tanggal', 'DESC']]
    });

    const result = bookings.map(b => ({
      ...b.toJSON(),
      bukti_url: b.bukti_pembayaran
        ? `${req.protocol}://${req.get('host')}/uploads/${b.bukti_pembayaran}`
        : null
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: Lapangan, as: 'lapangan' },
        { model: User, as: 'user', attributes: ['nama'] }
      ],
      order: [['tanggal', 'DESC']]
    });

    const result = bookings.map(b => ({
      ...b.toJSON(),
      bukti_url: b.bukti_pembayaran
        ? `${req.protocol}://${req.get('host')}/uploads/${b.bukti_pembayaran}`
        : null
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// ================= GET BY ID =================

const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id, {
      include: [
        { model: Lapangan, as: 'lapangan' },
        { model: User, as: 'user', attributes: ['nama'] }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking tidak ditemukan'
      });
    }

    // 🔥 kasih URL bukti
    const result = {
      ...booking.toJSON(),
      bukti_url: booking.bukti_pembayaran
        ? `${req.protocol}://${req.get('host')}/uploads/${booking.bukti_pembayaran}`
        : null
    };

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};



// ================= EXPORT =================

module.exports = {
  createBooking,
  uploadBukti,
  confirmByAdmin,
  rejectBooking,
  getUserBookings,
  getAllBookings,
  getBookingById // 🔥 INI YANG TADI KURANG
};