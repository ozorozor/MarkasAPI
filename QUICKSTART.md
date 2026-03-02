# 🚀 Quick Start Guide - Lapangan Booking API

Panduan cepat untuk setup dan menjalankan API.

## ⚡ 5 Menit Setup

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Setup Database

Buat database MySQL:

```bash
mysql -u root -p
```

Jalankan command:

```sql
CREATE DATABASE lapangan_booking;
EXIT;
```

### Step 3: Update .env

Copy `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Edit `.env` dengan database credentials Anda:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=lapangan_booking
DB_PORT=3306
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRE=7d
PAYMENT_EXPIRY_MINUTES=15
```

### Step 4: Initialize Database

```bash
npm run seed
```

Output:
```
✓ Connected to database
✓ Database tables synced
✓ Default admin user created
  Email: admin@lapangan.com
  Password: admin123
  ⚠️  CHANGE THIS PASSWORD IMMEDIATELY IN PRODUCTION!
✓ Sample lapangan created (4 items)
✓ Database initialization completed successfully!
```

### Step 5: Jalankan Server

```bash
npm run dev
```

Output:
```
✓ Database connection established
✓ Database models synced
✓ Server running on http://localhost:5000
✓ Environment: development
```

## ✅ Testing API

### Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Response akan berisi token JWT - simpan token untuk requests berikutnya.

### Get All Lapangan

```bash
curl http://localhost:5000/api/lapangan
```

## 📚 Dokumentasi Lengkap

- **README.md** - Dokumentasi API lengkap dengan semua endpoints
- **SECURITY.md** - Security guidelines dan best practices
- **API_EXAMPLES.http** - Contoh requests untuk semua endpoints
- **PROJECT_STRUCTURE.md** - Struktur folder project

## 🔑 Default Credentials

Setelah menjalankan `npm run seed`:

**Admin Account:**
- Email: `admin@lapangan.com`
- Password: `admin123`

**⚠️ PENTING**: Ganti password ini di production!

## 🌐 API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register user baru | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| GET | `/api/auth/profile` | Get user profile | ✅ |
| GET | `/api/lapangan` | Get semua lapangan | ❌ |
| GET | `/api/lapangan/:id` | Get lapangan by ID | ❌ |
| POST | `/api/lapangan` | Create lapangan | ✅ Admin |
| PATCH | `/api/lapangan/:id` | Update lapangan | ✅ Admin |
| DELETE | `/api/lapangan/:id` | Delete lapangan | ✅ Admin |
| POST | `/api/booking` | Create booking | ✅ |
| GET | `/api/booking/user/my-bookings` | Get user's bookings | ✅ |
| GET | `/api/booking/:id` | Get booking detail | ✅ |
| PATCH | `/api/booking/:id/confirm-payment` | Confirm payment | ✅ |
| PATCH | `/api/booking/:id/cancel` | Cancel booking | ✅ |

## 📁 Project Structure

```
api/
├── src/
│   ├── config/        # Database configuration
│   ├── models/        # ORM models
│   ├── controllers/   # Business logic
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   ├── validators/    # Input validation
│   ├── seeds/         # Database seeding
│   ├── utils/         # Helper functions
│   └── server.js      # App entry point
├── .env               # Environment variables
├── package.json       # Dependencies
└── README.md          # Full documentation
```

## 🔐 Authentication

Semua endpoint yang require authentication perlu JWT token di header:

```
Authorization: Bearer {token}
```

Dapatkan token dari:
1. Register endpoint `/api/auth/register`
2. Login endpoint `/api/auth/login`

## 🐛 Common Issues

### Issue: `Cannot find module 'sequelize'`
**Solution:** 
```bash
npm install
```

### Issue: `ECONNREFUSED` - Database not connecting
**Solution:**
1. Pastikan MySQL server running
2. Check database credentials di `.env`
3. Pastikan database `lapangan_booking` sudah dibuat

### Issue: `Port 5000 already in use`
**Solution:**
```bash
# Gunakan port lain di .env
PORT=5001
```

## 💡 Tips

- Gunakan Postman atau VS Code REST Client untuk testing
- Check `API_EXAMPLES.http` untuk request examples
- Enable logging di `src/config/database.js` untuk SQL debugging
- Read security guidelines di `SECURITY.md` sebelum production

## 📞 Next Steps

1. ✅ API sudah siap digunakan
2. 🔐 Update JWT_SECRET di production
3. 🌐 Setup frontend untuk consume API ini
4. 🔒 Implementasi HTTPS di production
5. 📊 Setup monitoring dan logging

## 📖 Resources

- [Express.js Documentation](https://expressjs.com/)
- [Sequelize ORM](https://sequelize.org/)
- [JWT.io](https://jwt.io/)
- [Joi Validation](https://joi.dev/)

---

**Need help?** Check full documentation in `README.md`
