const User = require('./User');
const Lapangan = require('./Lapangan');
const Booking = require('./Booking');
const sequelize = require('../config/database');

module.exports = {
  sequelize,
  User,
  Lapangan,
  Booking
};
