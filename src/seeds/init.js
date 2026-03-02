/**
 * Script untuk initialize database dengan data default
 * Jalankan dengan: node src/seeds/init.js
 */

require('dotenv').config();
const { User, Lapangan, sequelize } = require('../models');

const initializeDatabase = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✓ Connected to database');

    // Sync tables
    await sequelize.sync({ alter: true });
    console.log('✓ Database tables synced');

    // Check if admin already exists
    const adminExists = await User.findOne({
      where: { email: 'admin@lapangan.com' }
    });

    if (!adminExists) {
      // Create default admin user
      const admin = await User.create({
        nama: 'Admin',
        email: 'admin@lapangan.com',
        password: 'admin123', // CHANGE THIS IN PRODUCTION!
        role: 'admin'
      });
      console.log('✓ Default admin user created');
      console.log('  Email: admin@lapangan.com');
      console.log('  Password: admin123');
      console.log('  ⚠️  CHANGE THIS PASSWORD IMMEDIATELY IN PRODUCTION!');
    }

    // Create sample lapangan
    const lapanganCount = await Lapangan.count();
    if (lapanganCount === 0) {
      await Lapangan.bulkCreate([
        {
          nama_lapangan: 'Lapangan Futsal A',
          harga_per_jam: 100000,
          deskripsi: 'Lapangan futsal berkualitas internasional',
          status: 'available'
        },
        {
          nama_lapangan: 'Lapangan Badminton B',
          harga_per_jam: 75000,
          deskripsi: 'Lapangan badminton dengan 4 court',
          status: 'available'
        },
        {
          nama_lapangan: 'Lapangan Tenis C',
          harga_per_jam: 150000,
          deskripsi: 'Lapangan tenis outdoor dengan pencahayaan LED',
          status: 'available'
        },
        {
          nama_lapangan: 'Lapangan Basket D',
          harga_per_jam: 200000,
          deskripsi: 'Lapangan basket indoor standar NBA',
          status: 'available'
        }
      ]);
      console.log('✓ Sample lapangan created (4 items)');
    }

    console.log('\n✓ Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error initializing database:', error.message);
    process.exit(1);
  }
};

initializeDatabase();
