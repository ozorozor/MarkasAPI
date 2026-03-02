const { Lapangan, Booking } = require('../models');
const { Op } = require('sequelize');

const createLapangan = async (req, res, next) => {
  try {
    const { nama_lapangan, harga_per_jam, deskripsi } = req.validatedBody;

    const lapangan = await Lapangan.create({
      nama_lapangan,
      harga_per_jam,
      deskripsi,
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

const getAllLapangan = async (req, res, next) => {
  try {
    const lapangan = await Lapangan.findAll({
      include: {
        model: Booking,
        as: 'bookings',
        attributes: ['id_booking', 'tanggal', 'jam_mulai', 'jam_selesai', 'status_pembayaran']
      }
    });

    res.json({
      success: true,
      message: 'Data lapangan berhasil diambil',
      data: lapangan
    });
  } catch (error) {
    next(error);
  }
};

const getLapanganById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lapangan = await Lapangan.findByPk(id, {
      include: {
        model: Booking,
        as: 'bookings',
        attributes: ['id_booking', 'tanggal', 'jam_mulai', 'jam_selesai', 'status_pembayaran']
      }
    });

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

const updateLapangan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama_lapangan, harga_per_jam, deskripsi, status } = req.body;

    const lapangan = await Lapangan.findByPk(id);

    if (!lapangan) {
      return res.status(404).json({
        success: false,
        message: 'Lapangan tidak ditemukan'
      });
    }

    if (nama_lapangan) lapangan.nama_lapangan = nama_lapangan;
    if (harga_per_jam) lapangan.harga_per_jam = harga_per_jam;
    if (deskripsi) lapangan.deskripsi = deskripsi;
    if (status && ['available', 'booked'].includes(status)) lapangan.status = status;

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

    // Check apakah ada booking yang masih active
    const activeBooking = await Booking.findOne({
      where: {
        id_lapangan: id,
        status_pembayaran: { [Op.in]: ['pending', 'paid'] }
      }
    });

    if (activeBooking) {
      return res.status(400).json({
        success: false,
        message: 'Tidak bisa menghapus lapangan karena ada booking yang belum selesai'
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

// Get lapangan availability untuk tanggal tertentu
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

// New: status per jam (06:00 - 23:00) showing TERBOOKING or FREE
const getLapanganJamStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tanggal } = req.query;

    if (!tanggal) {
      return res.status(400).json({ success: false, message: 'Parameter tanggal harus diisi (format: YYYY-MM-DD)' });
    }

    const lapangan = await Lapangan.findByPk(id);
    if (!lapangan) {
      return res.status(404).json({ success: false, message: 'Lapangan tidak ditemukan' });
    }

    const startDate = new Date(tanggal);
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

    const bookings = await Booking.findAll({
      where: {
        id_lapangan: id,
        tanggal: {
          [Op.gte]: startDate,
          [Op.lt]: endDate
        },
        status_pembayaran: { [Op.in]: ['pending', 'paid'] }
      },
      attributes: ['jam_mulai', 'jam_selesai']
    });

    // Helper to convert time string to minutes since 00:00
    const toMinutes = (timeStr) => {
      const parts = timeStr.split(':');
      const hh = parseInt(parts[0], 10) || 0;
      const mm = parseInt(parts[1], 10) || 0;
      return hh * 60 + mm;
    };

    const status_jam = [];
    for (let h = 6; h <= 23; h++) {
      const slotStart = h * 60;
      const slotEnd = (h + 1) * 60;
      let isBooked = false;

      for (const b of bookings) {
        const jm = (b.jam_mulai || '').toString().split(':').slice(0,2).join(':');
        const js = (b.jam_selesai || '').toString().split(':').slice(0,2).join(':');
        const bStart = toMinutes(jm);
        const bEnd = toMinutes(js);

        // Overlap check: bookingStart < slotEnd && bookingEnd > slotStart
        if (bStart < slotEnd && bEnd > slotStart) {
          isBooked = true;
          break;
        }
      }

      const label = (h < 10 ? '0' + h : h) + ':00';
      status_jam.push({ jam: label, status: isBooked ? 'TERBOOKING' : 'FREE' });
    }

    res.json({
      success: true,
      message: 'Status jam lapangan berhasil diambil',
      data: {
        id_lapangan: lapangan.id_lapangan,
        nama_lapangan: lapangan.nama_lapangan,
        tanggal,
        harga_per_jam: lapangan.harga_per_jam,
        jam_operasional: ['06:00', '23:00'],
        status_jam
      }
    });
  } catch (error) {
    next(error);
  }
};

// export tambahan
module.exports.getLapanganJamStatus = getLapanganJamStatus;
