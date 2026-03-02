# 🎯 Lapangan Booking API - Complete Documentation Index

Backend API yang lengkap untuk sistem booking lapangan olahraga dengan authentication, manajemen lapangan, dan booking system dengan pembayaran terbatas waktu.

## ⚡ Quick Links

### 🚀 Untuk Memulai (5 menit)
1. **[QUICKSTART.md](QUICKSTART.md)** - Setup dalam 5 langkah
2. **[.env.example](.env.example)** - Template konfigurasi
3. **[FAQ.md](FAQ.md)** - Jawaban pertanyaan umum

### 📖 Dokumentasi Lengkap
1. **[README.md](README.md)** - Dokumentasi API komprehensif
2. **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Struktur folder & file
3. **[DATABASE_SCHEMA.sql](DATABASE_SCHEMA.sql)** - MySQL schema
4. **[API_EXAMPLES.http](API_EXAMPLES.http)** - Contoh request semua endpoint

### 🔐 Security & Integration
1. **[SECURITY.md](SECURITY.md)** - Guidelines keamanan
2. **[FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)** - Integrasi dengan frontend
3. **[src/config/security-middlewares.js](src/config/security-middlewares.js)** - Optional security enhancements

---

## 📁 Project Files Overview

### Root Level Files
```
├── .env                      # Environment variables (DO NOT COMMIT)
├── .env.example             # Template environment variables
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies & npm scripts
├── README.md                # Main API documentation
├── QUICKSTART.md            # 5-minute setup guide
├── SECURITY.md              # Security best practices
├── FRONTEND_INTEGRATION.md  # Frontend integration guide
├── FAQ.md                   # Frequently Asked Questions
├── PROJECT_STRUCTURE.md     # Project folder structure
├── DATABASE_SCHEMA.sql      # MySQL schema (optional)
├── API_EXAMPLES.http        # HTTP request examples
└── SETUP_SUMMARY.sh         # This summary
```

### Source Code (src/)
```
src/
├── server.js                # Express app entry point
│
├── config/
│   ├── database.js         # Sequelize database configuration
│   └── security-middlewares.js  # Optional security middlewares
│
├── models/
│   ├── User.js             # User model with password hashing
│   ├── Lapangan.js         # Lapangan (field) model
│   ├── Booking.js          # Booking model with relationships
│   └── index.js            # Models export
│
├── controllers/
│   ├── authController.js      # Register, login, profile endpoints
│   ├── lapanganController.js  # Lapangan CRUD & availability
│   └── bookingController.js   # Booking CRUD & payment handling
│
├── routes/
│   ├── authRoutes.js       # /api/auth endpoints
│   ├── lapanganRoutes.js   # /api/lapangan endpoints
│   └── bookingRoutes.js    # /api/booking endpoints
│
├── middleware/
│   ├── authMiddleware.js   # JWT verification & role authorization
│   └── errorHandler.js     # Centralized error handling
│
├── validators/
│   ├── schemas.js          # Joi validation schemas
│   └── validateRequest.js  # Validation middleware
│
├── utils/
│   └── helpers.js          # Helper functions
│
└── seeds/
    └── init.js             # Database initialization & sample data
```

---

## 🎓 Learning Path

### Step 1: Understand the API (30 menit)
1. Read [QUICKSTART.md](QUICKSTART.md) - Pahami setup process
2. Read [README.md](README.md) - Pahami semua endpoints
3. Check [API_EXAMPLES.http](API_EXAMPLES.http) - Lihat contoh request

### Step 2: Setup Locally (15 menit)
```bash
npm install
cp .env.example .env
# Update .env dengan database credentials
npm run seed
npm run dev
```

### Step 3: Test API (15 menit)
- Gunakan Postman atau VS Code REST Client
- Test semua endpoints dengan example dari API_EXAMPLES.http
- Check responses dan understand structure

### Step 4: Understand Code (30 menit)
1. Check [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
2. Baca models di `src/models/`
3. Baca controllers di `src/controllers/`
4. Pahami routing di `src/routes/`

### Step 5: Integration (1-2 jam)
1. Read [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)
2. Setup frontend to consume API
3. Test authentication flow
4. Test booking flow

### Step 6: Production Ready (1-2 jam)
1. Read [SECURITY.md](SECURITY.md)
2. Implement security enhancements
3. Setup environment variables
4. Deploy & test di production-like environment

---

## 🚀 Quick Commands

### Development
```bash
npm install         # Install dependencies
npm run dev         # Start development server (auto-reload)
npm run seed        # Initialize database with sample data
npm start           # Start production server
```

### Database
```bash
# Create database (if using manual setup)
mysql -u root -p
CREATE DATABASE lapangan_booking;

# Run schema (optional, usually auto-synced)
mysql -u root -p lapangan_booking < DATABASE_SCHEMA.sql
```

### Testing
```bash
# Using curl
curl http://localhost:5000/api/health

# Using VS Code REST Client
# Open API_EXAMPLES.http and click "Send Request"
```

---

## 🔑 Key Features

### ✅ Authentication
- Register dengan email & password
- Login dengan JWT token
- Role-based access (admin & user)
- Password hashing dengan bcryptjs

### ✅ Lapangan Management
- Create, read, update, delete lapangan (admin only)
- Lapangan memiliki: id, nama, harga per jam, status
- Check ketersediaan lapangan berdasarkan tanggal
- Status otomatis update berdasarkan booking

### ✅ Booking System
- User bisa create booking untuk lapangan
- Booking berisi: tanggal, jam_mulai, jam_selesai, total_harga
- Automatic calculation harga berdasarkan durasi
- No double-booking - sistem prevent overlapping bookings

### ✅ Payment System
- 15 menit payment deadline setelah booking
- Confirm payment endpoint untuk update status
- Auto-expire booking jika tidak dibayar dalam 15 menit
- Payment status: pending, paid, expired

### ✅ Security
- JWT token authentication
- Role-based authorization
- Password hashing
- Input validation dengan Joi
- Error handling yang comprehensive
- CORS enabled (customizable)

---

## 📊 API Overview

### Total Endpoints: 17

**Authentication (3)**
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/profile

**Lapangan (6)**
- GET /api/lapangan
- GET /api/lapangan/:id
- GET /api/lapangan/availability/check
- POST /api/lapangan
- PATCH /api/lapangan/:id
- DELETE /api/lapangan/:id

**Booking (8)**
- POST /api/booking
- GET /api/booking/user/my-bookings
- GET /api/booking/:id
- PATCH /api/booking/:id/confirm-payment
- PATCH /api/booking/:id/cancel
- GET /api/booking
- POST /api/booking/check-expired
- GET /api/health

---

## 🔐 Security Features

### Implemented ✓
- Password hashing dengan bcryptjs (10 salt rounds)
- JWT token authentication & expiry
- Role-based access control
- Input validation dengan Joi
- SQL injection prevention (Sequelize ORM)
- Centralized error handling
- CORS configuration

### Recommended untuk Production
- Rate limiting
- Helmet.js untuk HTTP headers
- HTTPS/SSL encryption
- Environment-specific configuration
- Database backup strategy
- Monitoring & logging
- API key management

Check [SECURITY.md](SECURITY.md) untuk detailed security guidelines.

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Cannot find module | `npm install` |
| Database connection error | Check MySQL running & .env credentials |
| Port already in use | Change PORT di .env atau kill process |
| Token not valid | Login again, check token format |
| Email already exists | Use different email atau reset database |

Lihat [FAQ.md](FAQ.md) untuk troubleshooting lengkap.

---

## 📞 Getting Help

### Documentation Files
- **Setup error?** → Check [QUICKSTART.md](QUICKSTART.md)
- **API question?** → Check [README.md](README.md)
- **Integration help?** → Check [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)
- **Security concern?** → Check [SECURITY.md](SECURITY.md)
- **General issue?** → Check [FAQ.md](FAQ.md)

### Code Files
- **Database schema?** → [DATABASE_SCHEMA.sql](DATABASE_SCHEMA.sql)
- **API request examples?** → [API_EXAMPLES.http](API_EXAMPLES.http)
- **Source code?** → Check `src/` folder

---

## 📈 Tech Stack

- **Framework**: Express.js 4.18
- **ORM**: Sequelize 6.35
- **Database**: MySQL 8.0
- **Authentication**: JWT (7 days expiry)
- **Password Security**: bcryptjs
- **Validation**: Joi
- **CORS**: Enabled
- **Node.js**: v14+

---

## 📋 Checklist untuk Production

- [ ] Update JWT_SECRET (minimal 32 karakter)
- [ ] Change default admin password
- [ ] Enable HTTPS
- [ ] Configure specific CORS origins
- [ ] Setup rate limiting
- [ ] Enable database SSL
- [ ] Setup monitoring & logging
- [ ] Database backup strategy
- [ ] Error tracking (Sentry, etc.)
- [ ] Load testing
- [ ] Security audit

---

## 🎉 Success Metrics

You know the setup is successful when:

- ✓ `npm run dev` starts server tanpa error
- ✓ `npm run seed` creates database & sample data
- ✓ Health check endpoint returns success
- ✓ Register/login endpoints work
- ✓ Create booking endpoint returns proper response
- ✓ Payment confirm endpoint updates status

---

## 📝 License

This project is for educational and commercial use. 

---

## 📅 Version Info

- **Version**: 1.0.0
- **Last Updated**: February 2026
- **Status**: Production Ready ✓

---

## 🔗 Useful Links

- [Express.js Documentation](https://expressjs.com/)
- [Sequelize ORM](https://sequelize.org/)
- [JWT.io](https://jwt.io/)
- [Joi Validation](https://joi.dev/)
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

**Everything you need is in this API! Good luck! 🚀**

Untuk pertanyaan spesifik, check dokumentasi yang sesuai atau troubleshooting di FAQ.md.
