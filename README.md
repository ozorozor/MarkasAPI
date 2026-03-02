# Lapangan Booking API - Dokumentasi Lengkap

API backend untuk sistem booking lapangan olahraga dengan fitur authentication, manajemen lapangan, dan booking dengan sistem pembayaran.

## 🚀 Fitur Utama

- **Authentication**: Register dan Login dengan JWT token
- **User Management**: Profile user dengan role-based access (Admin & User)
- **Lapangan Management**: CRUD operasi untuk lapangan (hanya admin)
- **Booking System**: Create, view, dan manage booking lapangan
- **Payment System**: Konfirmasi pembayaran dengan batas waktu 15 menit
- **Auto Expiry**: Sistem otomatis untuk mengexpire booking yang tidak dibayar
- **Validasi Input**: Validasi ketat untuk semua input pengguna
- **Error Handling**: Error handling yang komprehensif dan informatif

## 📦 Tech Stack

- **Framework**: Express.js
- **Database**: MySQL dengan Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs
- **Validation**: Joi
- **CORS**: Enabled untuk frontend integration

## 🔐 Keamanan

- Password di-hash menggunakan bcryptjs dengan salt rounds 10
- JWT token untuk authentication dan authorization
- Role-based access control (Admin & User)
- Input validation menggunakan Joi
- Error messages yang aman (tidak expose sensitive info)
- Database connection pooling

## 📋 Prerequisites

- Node.js (v14 atau lebih tinggi)
- MySQL server
- npm atau yarn

## 🔧 Setup Awal

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Buat database MySQL:

```sql
CREATE DATABASE lapangan_booking;
```

### 3. Konfigurasi Environment

Buat file `.env` di root folder dengan konfigurasi berikut:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lapangan_booking
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_at_least_32_characters_long
JWT_EXPIRE=7d

# Payment Expiry (dalam menit)
PAYMENT_EXPIRY_MINUTES=15
```

### 4. Jalankan Server

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

Server akan jalan di `http://localhost:5000`

## 📚 API Endpoints

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "nama": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"  // optional, default: "user"
}

Response:
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "id_user": "uuid",
    "nama": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "jwt_token"
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "id_user": "uuid",
    "nama": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "jwt_token"
  }
}
```

#### Get User Profile
```
GET /api/auth/profile
Authorization: Bearer jwt_token

Response:
{
  "success": true,
  "message": "Profile berhasil diambil",
  "data": {
    "id_user": "uuid",
    "nama": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  }
}
```

### Lapangan Endpoints

#### Get All Lapangan
```
GET /api/lapangan

Response:
{
  "success": true,
  "message": "Data lapangan berhasil diambil",
  "data": [
    {
      "id_lapangan": "uuid",
      "nama_lapangan": "Lapangan Futsal A",
      "harga_per_jam": 100000,
      "status": "available",
      "deskripsi": "Lapangan futsal berkualitas internasional",
      "bookings": []
    }
  ]
}
```

#### Get Lapangan by ID
```
GET /api/lapangan/:id

Response:
{
  "success": true,
  "message": "Data lapangan berhasil diambil",
  "data": {
    "id_lapangan": "uuid",
    "nama_lapangan": "Lapangan Futsal A",
    "harga_per_jam": 100000,
    "status": "available",
    "deskripsi": "Lapangan futsal berkualitas internasional",
    "bookings": [
      {
        "id_booking": "uuid",
        "tanggal": "2024-01-15T00:00:00Z",
        "jam_mulai": "10:00",
        "jam_selesai": "12:00",
        "status_pembayaran": "paid"
      }
    ]
  }
}
```

#### Check Lapangan Availability
```
GET /api/lapangan/availability/check?tanggal=2024-01-15

Response:
{
  "success": true,
  "message": "Data ketersediaan lapangan berhasil diambil",
  "data": [
    {
      "id_lapangan": "uuid",
      "nama_lapangan": "Lapangan Futsal A",
      "harga_per_jam": 100000,
      "status": "available",
      "bookings": []
    }
  ]
}
```

#### Create Lapangan (Admin Only)
```
POST /api/lapangan
Authorization: Bearer jwt_token_admin
Content-Type: application/json

{
  "nama_lapangan": "Lapangan Badminton B",
  "harga_per_jam": 75000,
  "deskripsi": "Lapangan badminton dengan pencahayaan LED"
}

Response:
{
  "success": true,
  "message": "Lapangan berhasil dibuat",
  "data": {
    "id_lapangan": "uuid",
    "nama_lapangan": "Lapangan Badminton B",
    "harga_per_jam": 75000,
    "status": "available",
    "deskripsi": "Lapangan badminton dengan pencahayaan LED"
  }
}
```

#### Update Lapangan (Admin Only)
```
PATCH /api/lapangan/:id
Authorization: Bearer jwt_token_admin
Content-Type: application/json

{
  "nama_lapangan": "Lapangan Badminton B Updated",
  "harga_per_jam": 80000
}

Response:
{
  "success": true,
  "message": "Lapangan berhasil diupdate",
  "data": { /* lapangan data */ }
}
```

#### Delete Lapangan (Admin Only)
```
DELETE /api/lapangan/:id
Authorization: Bearer jwt_token_admin

Response:
{
  "success": true,
  "message": "Lapangan berhasil dihapus"
}
```

### Booking Endpoints

#### Create Booking
```
POST /api/booking
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "id_lapangan": "uuid",
  "tanggal": "2024-01-15",
  "jam_mulai": "10:00",
  "jam_selesai": "12:00"
}

Response:
{
  "success": true,
  "message": "Booking berhasil dibuat. Silahkan lakukan pembayaran dalam 15 menit",
  "data": {
    "id_booking": "uuid",
    "id_user": "uuid",
    "id_lapangan": "uuid",
    "tanggal": "2024-01-15",
    "jam_mulai": "10:00",
    "jam_selesai": "12:00",
    "total_harga": 200000,
    "status": "booked",
    "status_pembayaran": "pending",
    "batas_pembayaran": "2024-01-15T10:15:00Z",
    "batas_pembayaran_in": "900 detik"
  }
}
```

#### Get User's Bookings
```
GET /api/booking/user/my-bookings
Authorization: Bearer jwt_token

Response:
{
  "success": true,
  "message": "Data booking berhasil diambil",
  "data": [
    {
      "id_booking": "uuid",
      "id_user": "uuid",
      "id_lapangan": "uuid",
      "tanggal": "2024-01-15",
      "jam_mulai": "10:00",
      "jam_selesai": "12:00",
      "total_harga": 200000,
      "status": "booked",
      "status_pembayaran": "pending",
      "lapangan": {
        "id_lapangan": "uuid",
        "nama_lapangan": "Lapangan Futsal A",
        "harga_per_jam": 100000
      }
    }
  ]
}
```

#### Get Booking Detail
```
GET /api/booking/:id
Authorization: Bearer jwt_token

Response:
{
  "success": true,
  "message": "Data booking berhasil diambil",
  "data": {
    "id_booking": "uuid",
    "id_user": "uuid",
    "id_lapangan": "uuid",
    "tanggal": "2024-01-15",
    "jam_mulai": "10:00",
    "jam_selesai": "12:00",
    "total_harga": 200000,
    "status": "booked",
    "status_pembayaran": "pending",
    "lapangan": { /* lapangan data */ },
    "user": { /* user data */ }
  }
}
```

#### Confirm Payment
```
PATCH /api/booking/:id/confirm-payment
Authorization: Bearer jwt_token

Response:
{
  "success": true,
  "message": "Pembayaran berhasil dikonfirmasi",
  "data": {
    /* booking data dengan status_pembayaran: "paid" */
  }
}
```

#### Cancel Booking
```
PATCH /api/booking/:id/cancel
Authorization: Bearer jwt_token

Response:
{
  "success": true,
  "message": "Booking berhasil dibatalkan"
}
```

#### Get All Bookings (Admin Only)
```
GET /api/booking?status_pembayaran=pending&tanggal=2024-01-15
Authorization: Bearer jwt_token_admin

Response:
{
  "success": true,
  "message": "Data booking berhasil diambil",
  "data": [ /* array of bookings */ ]
}
```

#### Check Expired Bookings (Admin Only)
```
POST /api/booking/check-expired
Authorization: Bearer jwt_token_admin

Response:
{
  "success": true,
  "message": "2 booking(s) telah diexpire otomatis",
  "data": {
    "expired_count": 2
  }
}
```

## 🗄️ Database Schema

### Users Table
```
- id_user (UUID, Primary Key)
- nama (String, 100)
- email (String, 100, Unique)
- password (String, 255 - hashed)
- role (ENUM: 'admin', 'user')
- created_at (DateTime)
- updated_at (DateTime)
```

### Lapangan Table
```
- id_lapangan (UUID, Primary Key)
- nama_lapangan (String, 100)
- harga_per_jam (Decimal 10,2)
- status (ENUM: 'available', 'booked')
- deskripsi (Text)
- created_at (DateTime)
- updated_at (DateTime)
```

### Booking Table
```
- id_booking (UUID, Primary Key)
- id_user (UUID, Foreign Key)
- id_lapangan (UUID, Foreign Key)
- tanggal (Date)
- jam_mulai (Time)
- jam_selesai (Time)
- total_harga (Decimal 12,2)
- status (ENUM: 'available', 'booked')
- status_pembayaran (ENUM: 'pending', 'paid', 'expired')
- batas_pembayaran (DateTime)
- created_at (DateTime)
- updated_at (DateTime)
```

## 🔐 Authentication

Semua endpoint yang di-protect memerlukan JWT token di header:

```
Authorization: Bearer <token>
```

Token diperoleh saat register atau login dan berlaku selama 7 hari.

## ⚠️ Error Handling

API mengembalikan error dengan format yang konsisten:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email tidak valid"
    }
  ]
}
```

HTTP Status Codes:
- `200`: OK
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

## 📝 Contoh Workflow

### Workflow Register & Login
1. User melakukan REGISTER dengan nama, email, password
2. API mengembalikan token JWT
3. User dapat login dengan email & password
4. API mengembalikan token JWT baru

### Workflow Booking
1. User melihat list lapangan dengan GET /api/lapangan
2. User melihat ketersediaan lapangan dengan GET /api/lapangan/availability/check?tanggal=YYYY-MM-DD
3. User membuat booking dengan POST /api/booking
4. Sistem memberikan batas waktu pembayaran 15 menit
5. User confirm pembayaran dengan PATCH /api/booking/:id/confirm-payment
6. Jika tidak membayar dalam 15 menit, booking otomatis di-expire
7. User dapat membatalkan booking dengan PATCH /api/booking/:id/cancel

## 🚀 Deployment

Untuk production:

1. Update `.env` dengan production values
2. Set `NODE_ENV=production`
3. Gunakan database username & password yang aman
4. Generate JWT_SECRET yang panjang dan kompleks
5. Enable HTTPS jika possible
6. Set CORS origins yang spesifik
7. Gunakan reverse proxy (nginx/apache)
8. Implementasikan rate limiting

## 📞 Support

Jika ada masalah atau pertanyaan, silahkan buat issue atau hubungi tim development.

---

**Last Updated**: February 2026
