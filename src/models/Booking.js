const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Lapangan = require('./Lapangan');

const Booking = sequelize.define(
  'Booking',
  {
    id_booking: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    id_user: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id_user'
      }
    },
    id_lapangan: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Lapangan,
        key: 'id_lapangan'
      }
    },
    tanggal: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true
      }
    },
    jam_mulai: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    jam_selesai: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    total_harga: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0
      }
    },
    status: {
      type: DataTypes.ENUM('available', 'booked'),
      defaultValue: 'booked'
    },
    status_pembayaran: {
      type: DataTypes.ENUM('pending', 'paid', 'expired'),
      defaultValue: 'pending'
    },
    batas_pembayaran: {
      type: DataTypes.DATE,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'booking'
  }
);

// Hubungan dengan User dan Lapangan
Booking.belongsTo(User, {
  foreignKey: 'id_user',
  as: 'user'
});

Booking.belongsTo(Lapangan, {
  foreignKey: 'id_lapangan',
  as: 'lapangan'
});

User.hasMany(Booking, {
  foreignKey: 'id_user',
  as: 'bookings'
});

Lapangan.hasMany(Booking, {
  foreignKey: 'id_lapangan',
  as: 'bookings'
});

module.exports = Booking;
