const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lapangan = sequelize.define(
  'Lapangan',
  {
    id_lapangan: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nama_lapangan: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },

    // ✅ GANTI INI
    harga_pagi: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0
      }
    },
    harga_malam: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0
      }
    },

    status: {
      type: DataTypes.ENUM('available', 'booked'),
      defaultValue: 'available'
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    diskon_persen: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
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
    tableName: 'lapangan'
  }
);

module.exports = Lapangan;