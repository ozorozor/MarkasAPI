# 📖 Cara Menjalankan API & Testing di Postman

## 🚀 STEP 1: Setup Database

### 1.1 Buka MySQL
```bash
mysql -u root -p
```

### 1.2 Create Database
```sql
CREATE DATABASE lapangan_booking;
EXIT;
```

---

## ⚙️ STEP 2: Setup Project

### 2.1 Install Dependencies
Buka terminal di folder `d:\pra-ta\api` dan jalankan:
```bash
npm install
```

### 2.2 Buat File .env
Di root folder, buat file `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourPassword
DB_NAME=lapangan_booking
DB_PORT=3306
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_min_32_characters_long
JWT_EXPIRE=7d
PAYMENT_EXPIRY_MINUTES=15
```

### 2.3 Initialize Database (Seed Data)
```bash
npm run seed
```

**Output yang harusnya muncul:**
```
✓ Connected to database
✓ Database tables synced
✓ Default admin user created
  Email: admin@lapangan.com
  Password: admin123
✓ Sample lapangan created
✓ Database initialization completed!
```

---

## ▶️ STEP 3: Jalankan API Server

### Development Mode (dengan auto-reload):
```bash
npm run dev
```

### Atau Production Mode:
```bash
npm start
```

**Output yang harusnya muncul:**
```
✓ Database connection established
✓ Database models synced
✓ Server running on http://localhost:5000
✓ Environment: development
```

**PENTING:** Server harus tetap berjalan di terminal ini. Jangan tutup terminal!

---

## 📮 STEP 4: Testing di Postman

### 4.1 Install Postman
Download dari: https://www.postman.com/downloads/

### 4.2 Import API Examples

**Opsi A: Import dari File HTTP**
1. Di Postman, klik **File** → **Import**
2. Pilih file `API_EXAMPLES.http` dari folder project
3. Semua endpoint akan ter-import dengan contoh-contohnya

**Opsi B: Manual Setup (jika opsi A tidak berhasil)**
Lihat bagian "4.3" di bawah

### 4.3 Testing Endpoints Manual

#### **REQUEST 1: Register User**

1. **Buat Request Baru**
   - Method: `POST`
   - URL: `http://localhost:5000/api/auth/register`

2. **Headers Tab**
   ```
   Key: Content-Type
   Value: application/json
   ```

3. **Body Tab** → Pilih `raw` → `JSON`
   ```json
   {
     "nama": "John Doe",
     "email": "john@example.com",
     "password": "password123",
     "role": "user"
   }
   ```

4. **Klik SEND**
   
5. **Response:**
   ```json
   {
     "status": "success",
     "message": "User registered successfully",
     "data": {
       "id_user": "550e8400-e29b-41d4-a716-446655440000",
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "nama": "John Doe",
       "email": "john@example.com",
       "role": "user"
     }
   }
   ```

6. **SIMPAN TOKEN** untuk request berikutnya ⭐
   - Copy **token** dari response
   - Simpan di tempat aman atau di Postman environment variable

---

#### **REQUEST 2: Login**

1. **Buat Request Baru**
   - Method: `POST`
   - URL: `http://localhost:5000/api/auth/login`

2. **Headers Tab**
   ```
   Key: Content-Type
   Value: application/json
   ```

3. **Body Tab** → `raw` → `JSON`
   ```json
   {
     "email": "john@example.com",
     "password": "password123"
   }
   ```

4. **Klik SEND**

5. **Response:** (akan dapat token)
   ```json
   {
     "status": "success",
     "message": "Login successful",
     "data": {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       ...
     }
   }
   ```

---

#### **REQUEST 3: Get Profile (dengan Authorization)**

1. **Buat Request Baru**
   - Method: `GET`
   - URL: `http://localhost:5000/api/auth/profile`

2. **Headers Tab** - Masukkan Authorization
   ```
   Key: Authorization
   Value: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   (Ganti dengan token yang dapat dari login/register)

3. **Klik SEND**

4. **Response:**
   ```json
   {
     "status": "success",
     "data": {
       "id_user": "550e8400-e29b-41d4-a716-446655440000",
       "nama": "John Doe",
       "email": "john@example.com",
       "role": "user"
     }
   }
   ```

---

#### **REQUEST 4: Get All Lapangan (Public)**

1. **Buat Request Baru**
   - Method: `GET`
   - URL: `http://localhost:5000/api/lapangan`

2. **Tidak perlu Authorization** (public endpoint)

3. **Klik SEND**

4. **Response:**
   ```json
   {
     "status": "success",
     "data": [
       {
         "id_lapangan": "uuid-1",
         "nama_lapangan": "Lapangan Badminton A",
         "harga_per_jam": 100000,
         "deskripsi": "..."
       },
       ...
     ]
   }
   ```

---

#### **REQUEST 5: Create Booking (Authenticated User)**

Pastikan sudah memiliki:
- Token dari login (REQUEST 2)
- ID Lapangan dari (REQUEST 4)

1. **Buat Request Baru**
   - Method: `POST`
   - URL: `http://localhost:5000/api/booking`

2. **Headers Tab**
   ```
   Content-Type: application/json
   Authorization: Bearer YOUR_TOKEN_HERE
   ```

3. **Body Tab** → `raw` → `JSON`
   ```json
   {
     "id_lapangan": "550e8400-e29b-41d4-a716-446655440000",
     "tanggal": "2024-01-20",
     "jam_mulai": "10:00",
     "jam_selesai": "12:00"
   }
   ```

4. **Klik SEND**

5. **Response:**
   ```json
   {
     "status": "success",
     "message": "Booking created successfully",
     "data": {
       "id_booking": "uuid-booking",
       "id_lapangan": "uuid-lapangan",
       "tanggal": "2024-01-20",
       "jam_mulai": "10:00",
       "jam_selesai": "12:00",
       "status_pembayaran": "pending",
       "total_harga": 200000
     }
   }
   ```

---

## 💡 TIPS POSTMAN

### Menggunakan Environment Variables (Recommended)

1. **Buat Environment**
   - Klik **Environment** → **Create**
   - Nama: "Lapangan Booking API"

2. **Tambah Variables**
   ```
   BASE_URL = http://localhost:5000/api
   TOKEN = (paste token di sini setelah login)
   LAPANGAN_ID = (paste ID lapangan setelah get all lapangan)
   ```

3. **Gunakan di Request**
   - URL: `{{BASE_URL}}/auth/profile`
   - Headers Authorization: `Bearer {{TOKEN}}`

### Quick Testing Flow

```
1. REQUEST /api/health (untuk cek server jalan)
2. REQUEST /api/auth/login (dapatkan TOKEN)
3. Set TOKEN di Postman environment
4. REQUEST /api/lapangan (dapatkan LAPANGAN_ID)
5. REQUEST /api/booking (create booking dengan TOKEN)
6. REQUEST /api/booking/user/my-bookings (lihat booking user)
```

---

## ❌ Troubleshooting

### Error: "Cannot connect to localhost:5000"
```bash
✗ Server tidak berjalan
✓ Solusi: Pastikan sudah jalankan "npm run dev" di terminal
```

### Error: "DATABASE CONNECTION FAILED"
```bash
✗ Database belum dibuat atau config .env salah
✓ Solusi: Jalankan "npm run seed" lagi setelah fix .env
```

### Error: "Invalid Token" di Authorization
```bash
✗ Token expired atau salah format
✓ Solusi: Lakukan login ulang dan copy token terbaru
```

### Error: "Validation Error - Tanggal tidak valid"
```bash
✗ Format tanggal salah
✓ Solusi: Gunakan format YYYY-MM-DD (contoh: 2024-01-20)
```

### Error: "Jam mulai harus lebih kecil dari jam selesai"
```bash
✗ jam_mulai >= jam_selesai
✓ Solusi: Pastikan jam_selesai > jam_mulai (contoh: 10:00 hingga 12:00)
```

---

## 📊 Curl Commands (Alternative)

Jika ingin test menggunakan terminal:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nama":"John","email":"john@test.com","password":"pass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'

# Get Profile (ganti TOKEN)
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get All Lapangan
curl -X GET http://localhost:5000/api/lapangan
```

---

## 📚 Dokumentasi Lengkap

Lihat file `API_EXAMPLES.http` untuk semua contoh endpoint dengan parameter detail.

---

**Selamat Testing! 🎉**
