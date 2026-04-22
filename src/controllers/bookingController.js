const { Booking, Lapangan, User } = require('../models');
const { Op } = require('sequelize');

// Helper function untuk hitung durasi
const calculateDuration = (jamMulai, jamSelesai) => {
  const [hourStart, minStart] = jamMulai.split(':').map(Number);
  const [hourEnd, minEnd] = jamSelesai.split(':').map(Number);

  const startMinutes = hourStart * 60 + minStart;
  const endMinutes = hourEnd * 60 + minEnd;

  if (endMinutes <= startMinutes) {
    return null;
  }

  return (endMinutes - startMinutes) / 60;
};

// 🔥 NEW: hitung harga berdasarkan pagi/malam
const calculateTotalPrice = (jamMulai, jamSelesai, lapangan) => {
  let total = 0;

  let start = parseInt(jamMulai.split(':')[0]);
  let end = parseInt(jamSelesai.split(':')[0]);

  for (let hour = start; hour < end; hour++) {
    if (hour < 18) {
      total += parseFloat(lapangan.harga_pagi);
    } else {
      total += parseFloat(lapangan.harga_malam);
    }
  }

  return total;
};

const createBooking = async (req, res, next) => {
  try {
    const { id_lapangan, tanggal, jam_mulai, jam_selesai } = req.validatedBody;
    const userId = req.user.id_user;

    const lapangan = await Lapangan.findByPk(id_lapangan);
    if (!lapangan) {
      return res.status(404).json({
        success: false,
        message: 'Lapangan tidak ditemukan'
      });
    }

    const duration = calculateDuration(jam_mulai, jam_selesai);
    if (!duration) {
      return res.status(400).json({
        success: false,
        message: 'Jam tidak valid'
      });
    }

    // CHECK TABRAKAN JAM
    const existingBooking = await Booking.findOne({
      where: {
        id_lapangan,
        tanggal: {
          [Op.gte]: new Date(tanggal),
          [Op.lt]: new Date(new Date(tanggal).getTime() + 86400000)
        },
        status_pembayaran: { [Op.in]: ['pending', 'paid'] },
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

    // 🔥 PRICE LOGIC BARU
    const rawTotal = calculateTotalPrice(jam_mulai, jam_selesai, lapangan);

    const diskon = lapangan.diskon_persen ? Number(lapangan.diskon_persen) : 0;
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
  } catch (error) {
    next(error);
  }
};

const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      where: { id_user: req.user.id_user },
      include: [
        {
          model: Lapangan,
          as: 'lapangan',
          attributes: ['id_lapangan', 'nama_lapangan', 'harga_pagi', 'harga_malam']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id_user', 'nama', 'email']
        }
      ],
      order: [['tanggal', 'DESC']]
    });

    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        {
          model: Lapangan,
          as: 'lapangan',
          attributes: ['id_lapangan', 'nama_lapangan', 'harga_pagi', 'harga_malam']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id_user', 'nama', 'email']
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });
    }

    if (req.user.role !== 'admin' && booking.id_user !== req.user.id_user) {
      return res.status(403).json({ success: false });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

const confirmPayment = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: { model: Lapangan, as: 'lapangan' }
    });

    if (!booking) return res.status(404).json({ success: false });

    if (Date.now() > booking.batas_pembayaran.getTime()) {
      await booking.update({ status_pembayaran: 'expired', status: 'available' });
      await booking.lapangan.update({ status: 'available' });

      return res.status(400).json({ success: false, message: 'Expired' });
    }

    await booking.update({
      status_pembayaran: 'paid',
      status: 'booked'
    });

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: { model: Lapangan, as: 'lapangan' }
    });

    if (!booking) return res.status(404).json({ success: false });

    await booking.update({
      status_pembayaran: 'cancelled',
      status: 'available'
    });

    await booking.lapangan.update({ status: 'available' });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        {
          model: Lapangan,
          as: 'lapangan',
          attributes: ['id_lapangan', 'nama_lapangan', 'harga_pagi', 'harga_malam']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id_user', 'nama', 'email']
        }
      ],
      order: [['tanggal', 'DESC']]
    });

    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

const checkExpiredBookings = async (req, res, next) => {
  try {
    const expiredBookings = await Booking.findAll({
      where: {
        status_pembayaran: 'pending',
        batas_pembayaran: { [Op.lt]: new Date() }
      },
      include: { model: Lapangan, as: 'lapangan' }
    });

    for (const b of expiredBookings) {
      await b.update({ status_pembayaran: 'expired', status: 'available' });
      await b.lapangan.update({ status: 'available' });
    }

    res.json({ success: true, expired: expiredBookings.length });
  } catch (error) {
    next(error);
  }
};

const getDailyRevenue = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      where: { status_pembayaran: 'paid' },
      include: {
        model: Lapangan,
        as: 'lapangan',
        attributes: ['nama_lapangan']
      }
    });

    const total = bookings.reduce((sum, b) => sum + parseFloat(b.total_harga), 0);

    res.json({
      success: true,
      total_revenue: total
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
  getDailyRevenue,
  checkExpiredBookings
};