# 📧 Email Configuration Guide

## Fitur Email yang Ditambahkan

Sistem ini sekarang memiliki kemampuan mengirim email otomatis ketika:
1. **Admin mengkonfirmasi pembayaran booking** → User menerima email notifikasi booking dikonfirmasi
2. **Admin menolak pembayaran booking** → User menerima email notifikasi booking ditolak

---

## 🔧 Setup Konfigurasi Email

### 1. **Tambah Konfigurasi ke `.env`**

Salin dari `.env.example` dan sesuaikan:

```env
# Email Configuration (SMTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
EMAIL_FROM=Markas Lapangan <noreply@markaslapangan.com>

# API URL untuk link di email
API_URL=http://localhost:3000
```

### 2. **Setup Gmail SMTP (Recommended)**

#### Langkah-Langkah Setup Gmail:

1. **Buka Google Account Security**
   - Kunjungi: https://myaccount.google.com/security

2. **Enable 2-Step Verification** (jika belum)
   - Pilih "Security" di sidebar
   - Aktifkan "2-Step Verification"

3. **Generate App Password**
   - Di Security page, scroll ke "App passwords"
   - Pilih: Device = "Mail", OS = "Windows/Linux/Mac"
   - Google akan generate 16-character password
   - Copy password ini ke `EMAIL_PASSWORD` di `.env`

4. **Update `.env`**
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # 16 karakter dari Google
   EMAIL_FROM=Markas Lapangan <noreply@markaslapangan.com>
   ```

---

## 🚀 Cara Kerja

### Flow Booking Confirmation

```
User Login
    ↓
Create Booking (status_pembayaran = pending)
    ↓
Upload Bukti Pembayaran
    ↓
Admin Confirm Payment (PATCH /api/booking/:id/confirm-payment)
    ↓
[Controller: confirmByAdmin]
├── Update status_pembayaran = paid
├── Update status = booked
├── Fetch User + Lapangan data
└── Call: sendBookingConfirmation(user, booking, lapangan)
    ↓
[emailService.js]
├── Buat HTML email template
├── Set recipient ke user.email
├── Send via nodemailer
└── Log success/error
    ↓
Response 200 ke Frontend
```

### Flow Booking Rejection

```
Admin Reject Payment (PATCH /api/booking/:id/reject)
    ↓
[Controller: rejectBooking]
├── Update status_pembayaran = rejected
├── Update lapangan status = available
├── Fetch User + Lapangan data
└── Call: sendBookingRejection(user, booking, lapangan, reason)
    ↓
[emailService.js]
├── Buat HTML email template
├── Set recipient ke user.email
├── Send via nodemailer
└── Log success/error
    ↓
Response 200 ke Frontend
```

---

## 📧 Email Templates

### 1. **Booking Confirmation Email**

**Subject:** 🎉 Booking Lapangan Dikonfirmasi - [Nama Lapangan]

**Isi:**
- Header hijau dengan pesan "✓ Booking Dikonfirmasi!"
- Detail booking (lapangan, tanggal, jam, harga)
- Informasi penting untuk user
- Footer dengan informasi copyright

**Contoh untuk user "Ahmad" booking "Lapangan Indoor":**
```
Halo Ahmad,

Selamat! Booking lapangan Anda telah berhasil dikonfirmasi oleh admin.

Detail Booking:
- Lapangan: Lapangan Indoor
- Tanggal: Minggu, 19 Juli 2026
- Jam: 09:00 - 11:00
- Total: Rp 200.000

Penting:
- Hadir 15 menit sebelumnya
- Bawa identitas atau booking confirmation ini
- Untuk batal, hubungi admin 24 jam sebelumnya
```

### 2. **Booking Rejection Email**

**Subject:** Booking Lapangan Ditolak - [Nama Lapangan]

**Isi:**
- Header merah dengan pesan "✗ Booking Ditolak"
- Detail booking yang ditolak
- Alasan penolakan (jika ada)
- Opsi untuk melakukan booking ulang

---

## 🔌 Instalasi Dependencies

Sudah ditambahkan ke `package.json`:
```bash
npm install nodemailer
```

Atau jika belum:
```bash
npm install nodemailer@6.9.7
```

---

## 📝 Request/Response Examples

### Confirm Booking (dengan Email)

**Request:**
```http
PATCH /api/booking/uuid-booking-id/confirm-payment HTTP/1.1
Authorization: Bearer jwt-token-admin
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Booking dikonfirmasi dan email dikirim ke user",
  "data": {
    "id_booking": "uuid-123",
    "status_pembayaran": "paid",
    "status": "booked",
    ...
  }
}
```

**Apa yang terjadi:**
1. ✅ Status pembayaran diubah ke "paid"
2. ✅ Email dikirim ke user
3. ✅ Response dikirim ke admin

---

### Reject Booking (dengan Email)

**Request:**
```http
PATCH /api/booking/uuid-booking-id/reject HTTP/1.1
Authorization: Bearer jwt-token-admin
Content-Type: application/json

{
  "reason": "Bukti pembayaran tidak jelas"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking ditolak dan email dikirim ke user"
}
```

**Apa yang terjadi:**
1. ✅ Status pembayaran diubah ke "rejected"
2. ✅ Lapangan dikembalikan ke status "available"
3. ✅ Email dikirim ke user dengan alasan penolakan
4. ✅ Response dikirim ke admin

---

## ⚠️ Error Handling

### Email Gagal Dikirim

Jika email gagal dikirim, sistem tetap akan:
- ✅ Mengupdate database (status booking tetap berubah)
- ⚠️ Log error ke console
- ✅ Return response 200 ke admin

**Contoh log:**
```
Email gagal dikirim, tapi booking tetap dikonfirmasi: Error message here
```

---

## 🧪 Testing Email Locally

### Menggunakan Mailtrap (untuk development)

1. Daftar di https://mailtrap.io
2. Copy SMTP credentials
3. Update `.env`:
   ```env
   EMAIL_SERVICE=Mailtrap
   EMAIL_USER=your_mailtrap_user
   EMAIL_PASSWORD=your_mailtrap_password
   ```

### Menggunakan Ethereal Email (Free)

```javascript
// Testing only - generate temporary email
const nodemailer = require('nodemailer');

const testAccount = await nodemailer.createTestAccount();

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass
  }
});
```

---

## 📚 File-File Terkait

1. **`src/utils/emailService.js`** - Logic pengiriman email
2. **`src/controllers/bookingController.js`** - Controller dengan integrasi email
3. **`.env`** - Konfigurasi email
4. **`package.json`** - Dependency nodemailer

---

## 🔒 Security Notes

⚠️ **JANGAN commit `.env` ke repository**
- `.env` berisi credentials sensitif
- Selalu gunakan `.env.example` sebagai template
- Share `.env` hanya via secure channel

✅ **Best Practices:**
- Use Gmail App Passwords, bukan main password
- Rotate password secara berkala
- Monitor email logs di Mailtrap/Gmail
- Test di environment terpisah dulu

---

## 🐛 Troubleshooting

### Email tidak terkirim

**Solusi:**
1. Cek `.env` sudah terisi dengan benar
2. Cek Gmail App Password (generate ulang jika perlu)
3. Lihat console log untuk error message
4. Cek firewall/antivirus blocking port 587
5. Coba test dengan Mailtrap dulu

### Error: "Invalid login"

**Solusi:**
1. Verify Gmail credentials
2. Enable "Less secure app access" (jika tidak pakai App Password)
3. Generate ulang App Password

### Error: "Port 587 refused"

**Solusi:**
1. Check firewall settings
2. Try port 465 instead (SSL)
3. Contact ISP jika port blocked

---

## 📞 Support

Untuk pertanyaan lebih lanjut, lihat:
- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail SMTP Configuration](https://support.google.com/a/answer/176600)
- [Mailtrap Docs](https://mailtrap.io/blog/)
