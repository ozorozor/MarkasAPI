# ❓ FAQ & Troubleshooting

Jawaban untuk pertanyaan umum dan solusi untuk masalah.

## 🔍 Frequently Asked Questions

### Q: Bagaimana cara mendapatkan JWT token?
**A:** Token bisa didapatkan melalui dua cara:
1. Register endpoint: `POST /api/auth/register`
2. Login endpoint: `POST /api/auth/login`

Kedua endpoint mengembalikan token yang valid selama 7 hari.

### Q: Bagaimana format token yang harus dikirim?
**A:** Token harus dikirim di header Authorization dengan format:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Q: Berapa lama waktu pembayaran?
**A:** Waktu pembayaran adalah 15 menit setelah booking dibuat. Jika tidak dibayar dalam 15 menit, booking otomatis di-expire dan lapangan akan tersedia lagi untuk di-booking.

### Q: Bisakah mengganti status booking secara manual?
**A:** Status booking terupdate otomatis berdasarkan:
1. `pending` - saat booking dibuat (menunggu pembayaran)
2. `paid` - saat pembayaran dikonfirmasi
3. `expired` - 15 menit setelah booking tanpa pembayaran (otomatis)
4. `cancelled` - saat user membatalkan booking

### Q: Bagaimana cara cek ketersediaan lapangan?
**A:** Gunakan endpoint:
```
GET /api/lapangan/availability/check?tanggal=2024-01-15
```

Endpoint ini akan return lapangan beserta booking yang sudah terpaid di tanggal tersebut.

### Q: Apakah bisa double-booking di jam yang sama?
**A:** Tidak, sistem akan menolak booking jika:
- Ada booking yang sudah `pending` atau `paid` di jam yang sama
- Jam_selesai lebih kecil atau sama dengan jam_mulai

### Q: Siapa saja yang bisa create lapangan?
**A:** Hanya user dengan role `admin` yang bisa membuat lapangan. User register dengan default role `user`.

### Q: Bagaimana cara membedakan user dan admin?
**A:** Saat register/login, response akan include `role` field. Bisa juga di-check di:
- JWT token (payload `role`)
- GET /api/auth/profile

### Q: Bisakah email sama untuk multiple user?
**A:** Tidak, email harus unique. Sistem akan return error 409 jika email sudah terdaftar.

### Q: Bagaimana jika user lupa password?
**A:** Fitur password reset belum implemented. Untuk development, bisa:
1. Update langsung database (tidak recommended)
2. Implementasi reset password endpoint (future)

### Q: Berapa maksimal durasi booking?
**A:** Tidak ada batasan maksimal. User bisa booking berapa jam saja, harga akan dihitung berdasarkan durasi x harga_per_jam.

### Q: Bisakah booking lapangan di kemarin?
**A:** Tidak, sistem tidak akan validasi tanggal otomatis, tapi direkomendasikan untuk frontend validation agar user tidak bisa booking tanggal lampau.

### Q: Gimana kalau user cancel booking setelah membayar?
**A:** User bisa cancel booking dengan endpoint `PATCH /api/booking/:id/cancel`. Lapangan akan di-set status `available` lagi. Pengembalian uang harus di-handle di aplikasi/sistem pembayaran terpisah.

### Q: Apakah ada limitation untuk request?
**A:** Default tidak ada rate limiting. Untuk production, tambahkan rate limiting (lihat SECURITY.md).

### Q: Bagaimana cara monitoring booking yang expired?
**A:** Admin bisa:
1. Call endpoint `POST /api/booking/check-expired` untuk auto-expire pending bookings
2. Check dengan filter `GET /api/booking?status_pembayaran=expired`

---

## 🐛 Troubleshooting

### ❌ Error: "Cannot find module 'sequelize'"
**Solusi:**
```bash
npm install
```
Pastikan semua dependencies ter-install dengan benar.

### ❌ Error: "ECONNREFUSED 127.0.0.1:3306"
**Artinya:** MySQL server tidak running.

**Solusi:**
- Windows: 
  ```bash
  cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
  mysqld
  ```
- macOS:
  ```bash
  brew services start mysql
  ```
- Linux:
  ```bash
  sudo systemctl start mysql
  ```

### ❌ Error: "Unknown database 'lapangan_booking'"
**Artinya:** Database belum dibuat.

**Solusi:**
```bash
mysql -u root -p
CREATE DATABASE lapangan_booking;
EXIT;
npm run seed
```

### ❌ Error: "Access denied for user 'root'@'localhost'"
**Artinya:** Username/password di .env tidak sesuai.

**Solusi:**
1. Check `.env` file
2. Pastikan DB_USER, DB_PASSWORD benar
3. Test MySQL connection:
   ```bash
   mysql -u root -p
   ```

### ❌ Error: "Port 5000 already in use"
**Artinya:** Port 5000 sudah digunakan aplikasi lain.

**Solusi (Windows):**
```bash
netstat -ano | findstr :5000
taskkill /PID [PID_NUMBER] /F
```

Atau ubah port di `.env`:
```env
PORT=5001
```

### ❌ Error: "Token tidak valid atau sudah expired"
**Artinya:** JWT token invalid atau sudah expired (7 hari).

**Solusi:**
1. Login lagi untuk mendapatkan token baru
2. Check token format - harus `Authorization: Bearer {token}`
3. Check JWT_SECRET di .env

### ❌ Error: "Validation error - Email tidak valid"
**Artinya:** Format email tidak sesuai.

**Solusi:**
- Gunakan format email yang benar: `user@example.com`

### ❌ Error: "Password minimal 6 karakter"
**Artinya:** Password terlalu pendek.

**Solusi:**
- Gunakan password minimal 6 karakter

### ❌ Error: "Lapangan sudah terbooking di jam tersebut"
**Artinya:** Ada booking lain di jam yang sama.

**Solusi:**
1. Check ketersediaan dengan GET `/api/lapangan/availability/check?tanggal=YYYY-MM-DD`
2. Pilih jam yang available
3. Jika booking pending belum membayar, tunggu 15 menit dan coba lagi

### ❌ Error: "Tidak bisa menghapus lapangan karena ada booking"
**Artinya:** Ada booking yang belum selesai untuk lapangan ini.

**Solusi:**
1. Tunggu semua booking selesai
2. Atau admin cancel booking lebih dulu
3. Baru delete lapangan

### ❌ Error: "Total Harga harus angka positif"
**Artinya:** Harga per jam harus > 0.

**Solusi:**
- Gunakan harga per jam yang valid (contoh: 100000, 75000, dll)

### ⚠️ Warning: "Cannot find token in header"
**Artinya:** Token tidak dikirim atau format salah.

**Solusi:**
1. Pastikan sudah login/register
2. Format header benar: `Authorization: Bearer {token}`
3. Tidak ada spasi berlebih atau karakter tambahan

### ⚠️ Warning: "Anda tidak memiliki akses ke resource ini"
**Artinya:** Role user tidak sesuai dengan permission.

**Solusi:**
- Hanya admin yang bisa:
  - Create lapangan
  - Update lapangan
  - Delete lapangan
  - Get all bookings
  - Check expired bookings

### 🔄 Issue: Database tidak update setelah insert
**Solusi:**
1. Check apakah `npm run seed` berhasil
2. Verify database connection dengan:
   ```bash
   mysql -u root -p lapangan_booking -e "SELECT * FROM users;"
   ```

### 🔄 Issue: Booking tidak terexpire otomatis
**Solusi:**
1. Call manual: `POST /api/booking/check-expired`
2. Atau setup cron job di production untuk call endpoint ini setiap menit

---

## 🚀 Performance Troubleshooting

### Issue: API response lambat
**Solusi:**
1. Check database connection - pastikan MySQL running optimal
2. Enable query logging untuk see slow queries:
   ```javascript
   // Di src/config/database.js
   logging: console.log // mengubah dari false ke console.log
   ```
3. Add more indexes jika query sering untuk data besar
4. Upgrade server resources

### Issue: Memory leak
**Solusi:**
1. Check untuk infinite loops atau interval yang tidak di-clear
2. Use `npm update` untuk update dependencies
3. Monitor dengan: `node --inspect src/server.js`

---

## 🔐 Security Troubleshooting

### Issue: Password yang sama hashing berbeda
**Ini adalah normal!** bcryptjs menggunakan salt yang random setiap kali hash.
- Correct behavior ✓
- Verifikasi menggunakan compare function

### Issue: Token bisa digunakan selamanya
**Solusi:** Update JWT_EXPIRE di .env jadi lebih pendek:
```env
JWT_EXPIRE=1h
```

### Issue: CORS error dari frontend
**Solusi:** Update CORS di `src/server.js`:
```javascript
app.use(cors({
  origin: 'https://frontend-domain.com',
  credentials: true
}));
```

---

## 📞 Mendapatkan Help

1. **Check dokumentasi**: README.md, SECURITY.md, FRONTEND_INTEGRATION.md
2. **Check logs**: Enable logging di database config
3. **Check database**: Direct query ke MySQL untuk verify data
4. **Network tools**: Gunakan Postman/curl untuk test endpoints

---

## 📋 Debugging Checklist

- [ ] MySQL server running
- [ ] Database created dan ter-sync models
- [ ] .env file configured correct
- [ ] Token format benar (Bearer {token})
- [ ] Request headers Content-Type: application/json
- [ ] Server running tanpa error
- [ ] Check browser console untuk error
- [ ] Check server logs untuk error

---

**Last Updated**: February 2026
