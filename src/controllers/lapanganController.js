const { Lapangan, Booking } = require('../models');
const { Op } = require('sequelize');

// CREATE LAPANGAN
const createLapangan = async (req, res, next) => {
  try {
    const {
      nama_lapangan,
      harga_pagi,
      harga_malam,
      deskripsi,
      diskon_persen = 0
    } = req.validatedBody;

    const lapangan = await Lapangan.create({
      nama_lapangan,
      harga_pagi,
      harga_malam,
      deskripsi,
      diskon_persen,
      status: 'available'
    });

    res.status(201).json({
      success: true,
      message: 'Lapangan berhasil dibuat',
      data: lapangan
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL
const getAllLapangan = async (req, res, next) => {
  try {
    const lapangan = await Lapangan.findAll();

    res.json({
      success: true,
      message: 'Data lapangan berhasil diambil',
      data: lapangan
    });
  } catch (error) {
    next(error);
  }
};

// GET BY ID
const getLapanganById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lapangan = await Lapangan.findByPk(id);

    if (!lapangan) {
      return res.status(404).json({
        success: false,
        message: 'Lapangan tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Data lapangan berhasil diambil',
      data: lapangan
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE
const updateLapangan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nama_lapangan,
      harga_pagi,
      harga_malam,
      deskripsi,
      status,
      diskon_persen
    } = req.body;

    const lapangan = await Lapangan.findByPk(id);

    if (!lapangan) {
      return res.status(404).json({
        success: false,
        message: 'Lapangan tidak ditemukan'
      });
    }

    if (nama_lapangan) lapangan.nama_lapangan = nama_lapangan;
    if (harga_pagi) lapangan.harga_pagi = harga_pagi;
    if (harga_malam) lapangan.harga_malam = harga_malam;

    if (typeof diskon_persen !== 'undefined') {
      const val = Number(diskon_persen);
      if (isNaN(val) || val < 0 || val > 100) {
        return res.status(400).json({
          success: false,
          message: 'Diskon harus 0-100'
        });
      }
      lapangan.diskon_persen = val;
    }

    if (deskripsi) lapangan.deskripsi = deskripsi;
    if (status && ['available', 'booked'].includes(status)) {
      lapangan.status = status;
    }

    await lapangan.save();

    res.json({
      success: true,
      message: 'Lapangan berhasil diupdate',
      data: lapangan
    });
  } catch (error) {
    next(error);
  }
};

// DELETE
const deleteLapangan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lapangan = await Lapangan.findByPk(id);

    if (!lapangan) {
      return res.status(404).json({
        success: false,
        message: 'Lapangan tidak ditemukan'
      });
    }

    const activeBooking = await Booking.findOne({
      where: {
        id_lapangan: id,
        status_pembayaran: { [Op.in]: ['pending', 'paid'] }
      }
    });

    if (activeBooking) {
      return res.status(400).json({
        success: false,
        message: 'Masih ada booking aktif'
      });
    }

    await lapangan.destroy();

    res.json({
      success: true,
      message: 'Lapangan berhasil dihapus'
    });
  } catch (error) {
    next(error);
  }
};

// STATUS JAM (UPDATED)
const getLapanganJamStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tanggal } = req.query;

    if (!tanggal) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal wajib diisi'
      });
    }

    const lapangan = await Lapangan.findByPk(id);
    if (!lapangan) {
      return res.status(404).json({
        success: false,
        message: 'Lapangan tidak ditemukan'
      });
    }

    const bookings = await Booking.findAll({
      where: {
        id_lapangan: id,
        tanggal: new Date(tanggal),
        status_pembayaran: { [Op.in]: ['pending', 'paid'] }
      }
    });

    const toMinutes = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const status_jam = [];

    for (let h = 6; h <= 23; h++) {
      const start = h * 60;
      const end = (h + 1) * 60;

      let booked = false;

      for (const b of bookings) {
        const bs = toMinutes(b.jam_mulai);
        const be = toMinutes(b.jam_selesai);

        if (bs < end && be > start) {
          booked = true;
          break;
        }
      }

      status_jam.push({
        jam: `${h.toString().padStart(2, '0')}:00`,
        status: booked ? 'TERBOOKING' : 'FREE'
      });
    }

    res.json({
      success: true,
      message: 'Status jam berhasil',
      data: {
        id_lapangan: lapangan.id_lapangan,
        nama_lapangan: lapangan.nama_lapangan,
        tanggal,
        harga_pagi: lapangan.harga_pagi,
        harga_malam: lapangan.harga_malam,
        jam_operasional: ['06:00', '23:00'],
        status_jam
      }
    });
  } catch (error) {
    next(error);
  }
};

const getLapanganAvailability = async (req, res, next) => {
  try {
    const { tanggal } = req.query;

    if (!tanggal) {
      return res.status(400).json({
        success: false,
        message: 'Parameter tanggal harus diisi (format: YYYY-MM-DD)'
      });
    }

    const lapangan = await Lapangan.findAll({
      include: {
        model: Booking,
        as: 'bookings',
        where: {
          tanggal: {
            [Op.gte]: new Date(tanggal),
            [Op.lt]: new Date(new Date(tanggal).getTime() + 24 * 60 * 60 * 1000)
          },
          status_pembayaran: 'paid'
        },
        required: false,
        attributes: ['id_booking', 'jam_mulai', 'jam_selesai']
      }
    });

    res.json({
      success: true,
      message: 'Data ketersediaan lapangan berhasil diambil',
      data: lapangan
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLapangan,
  getAllLapangan,
  getLapanganById,
  updateLapangan,
  deleteLapangan,
  getLapanganAvailability
};

// New:
module.exports.getLapanganJamStatus = getLapanganJamStatus;