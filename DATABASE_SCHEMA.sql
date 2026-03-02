-- ============================================
-- Lapangan Booking Database Schema
-- ============================================
-- File ini bisa di-run langsung di MySQL Database
-- Atau gunakan npm run seed untuk auto-creation

-- Create Database
CREATE DATABASE IF NOT EXISTS lapangan_booking;
USE lapangan_booking;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id_user VARCHAR(36) PRIMARY KEY COMMENT 'UUID Primary Key',
  nama VARCHAR(100) NOT NULL COMMENT 'Nama user',
  email VARCHAR(100) NOT NULL UNIQUE COMMENT 'Email user (unique)',
  password VARCHAR(255) NOT NULL COMMENT 'Password (hashed with bcryptjs)',
  role ENUM('admin', 'user') DEFAULT 'user' COMMENT 'User role - admin or user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Created timestamp',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Updated timestamp',
  
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Users table untuk authentication';

-- ============================================
-- LAPANGAN TABLE
-- ============================================
CREATE TABLE lapangan (
  id_lapangan VARCHAR(36) PRIMARY KEY COMMENT 'UUID Primary Key',
  nama_lapangan VARCHAR(100) NOT NULL COMMENT 'Nama lapangan',
  harga_per_jam DECIMAL(10, 2) NOT NULL COMMENT 'Harga per jam',
  status ENUM('available', 'booked') DEFAULT 'available' COMMENT 'Status ketersediaan lapangan',
  deskripsi TEXT COMMENT 'Deskripsi lapangan',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Created timestamp',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Updated timestamp',
  
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lapangan table untuk tersimpan lapangan';

-- ============================================
-- BOOKING TABLE
-- ============================================
CREATE TABLE booking (
  id_booking VARCHAR(36) PRIMARY KEY COMMENT 'UUID Primary Key',
  id_user VARCHAR(36) NOT NULL COMMENT 'Foreign Key to users',
  id_lapangan VARCHAR(36) NOT NULL COMMENT 'Foreign Key to lapangan',
  tanggal DATE NOT NULL COMMENT 'Tanggal booking',
  jam_mulai TIME NOT NULL COMMENT 'Jam mulai (HH:MM)',
  jam_selesai TIME NOT NULL COMMENT 'Jam selesai (HH:MM)',
  total_harga DECIMAL(12, 2) NOT NULL COMMENT 'Total harga booking',
  status ENUM('available', 'booked') DEFAULT 'booked' COMMENT 'Status booking',
  status_pembayaran ENUM('pending', 'paid', 'expired', 'cancelled') DEFAULT 'pending' COMMENT 'Status pembayaran',
  batas_pembayaran DATETIME NOT NULL COMMENT 'Deadline untuk pembayaran (15 menit)',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Created timestamp',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Updated timestamp',
  
  FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE,
  FOREIGN KEY (id_lapangan) REFERENCES lapangan(id_lapangan) ON DELETE CASCADE,
  
  INDEX idx_id_user (id_user),
  INDEX idx_id_lapangan (id_lapangan),
  INDEX idx_tanggal (tanggal),
  INDEX idx_status_pembayaran (status_pembayaran),
  INDEX idx_batas_pembayaran (batas_pembayaran),
  INDEX idx_created_at (created_at),
  INDEX idx_user_lapangan (id_user, id_lapangan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Booking table untuk booking lapangan';

-- ============================================
-- INDEXES untuk SEARCH & FILTER
-- ============================================

-- Fast lookup untuk search by date range
CREATE INDEX idx_booking_date_range ON booking(tanggal, jam_mulai, jam_selesai);

-- Fast lookup untuk check availability
CREATE INDEX idx_booking_availability ON booking(id_lapangan, tanggal, jam_mulai, jam_selesai, status_pembayaran);

-- Fast lookup untuk user bookings
CREATE INDEX idx_user_bookings ON booking(id_user, created_at DESC);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert default admin user
-- Password: admin123 (hashed: $2a$10$...)
INSERT INTO users (id_user, nama, email, password, role) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Admin', 'admin@lapangan.com', '$2a$10$5M9.THXEDGrXJ0tSz.u3OOTKVUx7kElJkqVEjCL4TWZYZ2y5xsX0.', 'admin');

-- Insert sample lapangan
INSERT INTO lapangan (id_lapangan, nama_lapangan, harga_per_jam, status, deskripsi) VALUES 
('550e8400-e29b-41d4-a716-446655440002', 'Lapangan Futsal A', 100000, 'available', 'Lapangan futsal berkualitas internasional'),
('550e8400-e29b-41d4-a716-446655440003', 'Lapangan Badminton B', 75000, 'available', 'Lapangan badminton dengan 4 court'),
('550e8400-e29b-41d4-a716-446655440004', 'Lapangan Tenis C', 150000, 'available', 'Lapangan tenis outdoor dengan pencahayaan LED'),
('550e8400-e29b-41d4-a716-446655440005', 'Lapangan Basket D', 200000, 'available', 'Lapangan basket indoor standar NBA');

-- ============================================
-- VIEW untuk useful queries
-- ============================================

-- View untuk available slots per lapangan
CREATE VIEW vw_available_slots AS
SELECT 
  l.id_lapangan,
  l.nama_lapangan,
  l.harga_per_jam,
  DATE(b.tanggal) as booking_date,
  COUNT(CASE WHEN b.status_pembayaran = 'paid' THEN 1 END) as booked_slots,
  (24 - COUNT(CASE WHEN b.status_pembayaran = 'paid' THEN 1 END)) as available_slots
FROM lapangan l
LEFT JOIN booking b ON l.id_lapangan = b.id_lapangan AND b.status_pembayaran = 'paid'
GROUP BY l.id_lapangan, DATE(b.tanggal)
ORDER BY l.nama_lapangan, booking_date;

-- View untuk user booking history
CREATE VIEW vw_user_booking_history AS
SELECT 
  u.id_user,
  u.nama,
  u.email,
  COUNT(b.id_booking) as total_bookings,
  COUNT(CASE WHEN b.status_pembayaran = 'paid' THEN 1 END) as paid_bookings,
  COUNT(CASE WHEN b.status_pembayaran = 'pending' THEN 1 END) as pending_bookings,
  SUM(b.total_harga) as total_spent
FROM users u
LEFT JOIN booking b ON u.id_user = b.id_user
GROUP BY u.id_user;

-- View untuk lapangan utilization
CREATE VIEW vw_lapangan_utilization AS
SELECT 
  l.id_lapangan,
  l.nama_lapangan,
  COUNT(b.id_booking) as total_bookings,
  COUNT(CASE WHEN b.status_pembayaran = 'paid' THEN 1 END) as completed_bookings,
  COUNT(CASE WHEN b.status_pembayaran IN ('pending', 'expired') THEN 1 END) as incomplete_bookings,
  SUM(CASE WHEN b.status_pembayaran = 'paid' THEN b.total_harga ELSE 0 END) as total_revenue
FROM lapangan l
LEFT JOIN booking b ON l.id_lapangan = b.id_lapangan
GROUP BY l.id_lapangan;

-- ============================================
-- PROCEDURES untuk automated tasks
-- ============================================

-- Procedure untuk auto-expire pending bookings
DELIMITER //

CREATE PROCEDURE sp_expire_pending_bookings()
BEGIN
  UPDATE booking
  SET status_pembayaran = 'expired',
      status = 'available',
      updated_at = NOW()
  WHERE status_pembayaran = 'pending'
    AND batas_pembayaran < NOW();
  
  SELECT ROW_COUNT() as expired_count;
END //

DELIMITER ;

-- ============================================
-- TRIGGER untuk automatic updates
-- ============================================

-- Trigger untuk update lapangan status ketika booking dibuat
DELIMITER //

CREATE TRIGGER tr_update_lapangan_on_booking_create
AFTER INSERT ON booking
FOR EACH ROW
BEGIN
  IF NEW.status_pembayaran IN ('pending', 'paid') THEN
    UPDATE lapangan SET status = 'booked' WHERE id_lapangan = NEW.id_lapangan;
  END IF;
END //

DELIMITER ;

-- Trigger untuk update lapangan status ketika booking di-cancel
DELIMITER //

CREATE TRIGGER tr_update_lapangan_on_booking_cancel
AFTER UPDATE ON booking
FOR EACH ROW
BEGIN
  IF NEW.status_pembayaran IN ('cancelled', 'expired') AND OLD.status_pembayaran != NEW.status_pembayaran THEN
    -- Check apakah masih ada pending/paid booking
    IF NOT EXISTS (
      SELECT 1 FROM booking 
      WHERE id_lapangan = NEW.id_lapangan 
      AND status_pembayaran IN ('pending', 'paid')
      AND id_booking != NEW.id_booking
    ) THEN
      UPDATE lapangan SET status = 'available' WHERE id_lapangan = NEW.id_lapangan;
    END IF;
  END IF;
END //

DELIMITER ;

-- ============================================
-- GRANTS untuk Application User
-- ============================================

-- Create app user (GANTI PASSWORD!)
CREATE USER IF NOT EXISTS 'lapangan_app'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON lapangan_booking.* TO 'lapangan_app'@'localhost';
GRANT EXECUTE ON lapangan_booking.* TO 'lapangan_app'@'localhost';

FLUSH PRIVILEGES;

-- ============================================
-- EXPORT DATA
-- ============================================
-- mysqldump -u root -p lapangan_booking > backup.sql
-- mysql -u root -p lapangan_booking < backup.sql

-- ============================================
-- NOTES
-- ============================================
-- 1. All UUIDs are generated by application (Sequelize)
-- 2. Passwords are hashed in application (bcryptjs)
-- 3. Timestamps are managed automatically
-- 4. Foreign keys have CASCADE delete
-- 5. Proper indexing for query performance
-- 6. Views provide easy data aggregation
-- 7. Procedure for auto-expiry (call periodically)
-- 8. Triggers maintain data consistency
