# 🔧 Troubleshooting Email - Tidak Ada Email Masuk

## Masalah: Console log "Email sent" tapi Email tidak masuk

Ini terjadi karena konfigurasi SMTP belum benar. Mari kita debug:

---

## 1️⃣ CEK KONFIGURASI EMAIL DI `.env`

Lihat file `.env` Anda, cari bagian email:

```env
EMAIL_USER=05525@smkrus.sch.id    # ← Ini custom domain!
EMAIL_PASSWORD=yjox efdi bria wfxr
EMAIL_SERVICE=gmail
```

### ⚠️ MASALAHNYA:
- EMAIL_USER bukan @gmail.com
- Tapi EMAIL_SERVICE=gmail (tidak cocok!)
- Nodemailer tidak bisa pakai Gmail service untuk custom domain

---

## ✅ SOLUSI CEPAT: Gunakan Gmail Biasa Dulu (RECOMMENDED)

### Langkah 1: Generate Gmail App Password

1. Buka https://myaccount.google.com/security
2. Cari "App passwords" (harus enable 2-Step Verification dulu)
3. Generate password untuk Mail + Windows Computer
4. Copy password 16-karakter

### Langkah 2: Update `.env`

```env
# Email Configuration
EMAIL_USER=your_gmail@gmail.com        # ← Gunakan Gmail Anda
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx     # ← Paste 16 karakter dari Google
EMAIL_FROM=Markas Lapangan <noreply@markaslapangan.com>

# Hapus atau comment SMTP_HOST, SMTP_PORT, SMTP_SECURE jika ada
# SMTP_HOST=...
# SMTP_PORT=...
# SMTP_SECURE=...
```

### Langkah 3: Restart Server

```bash
npm run dev
```

### Langkah 4: Test Email

Buka Postman dan trigger confirm-payment lagi → Email harus masuk! ✅

---

## ⚙️ SOLUSI 2: Gunakan Custom Domain Sekolah

Jika ingin tetap pakai email sekolah `05525@smkrus.sch.id`:

### Langkah 1: Cari SMTP Server Sekolah

Hubungi IT sekolah atau cari info di sistem email sekolah:

**Kemungkinan:**
- SMTP Host: `mail.smkrus.sch.id` atau `smtp.smkrus.sch.id`
- Port: 587 (TLS) atau 465 (SSL)
- Username: `05525@smkrus.sch.id` atau `05525`
- Password: Password email sekolah Anda

### Langkah 2: Test SMTP Connection

Jika sudah tahu SMTP server, update `.env`:

```env
# Custom Domain Email
EMAIL_USER=05525@smkrus.sch.id
EMAIL_PASSWORD=your_school_email_password
SMTP_HOST=mail.smkrus.sch.id          # ← Tanya IT sekolah
SMTP_PORT=587                          # atau 465
SMTP_SECURE=false                      # true jika port 465
EMAIL_FROM=Markas Lapangan <05525@smkrus.sch.id>
```

### Langkah 3: Restart dan Test

```bash
npm run dev
```

Jika masih error, cek console log untuk error message dari nodemailer.

---

## 🐛 DEBUG: Cek Error Message

Jika email tetap tidak masuk, enable logging di `.env`:

```env
NODE_ENV=development
```

Lalu lihat console output saat trigger confirm payment:

```
✓ Email confirmation sent to user@example.com
```

Atau:

```
❌ Error sending email: Error message here...
```

### Common Errors:

| Error | Solusi |
|-------|--------|
| `Invalid login` | Password salah atau belum app password Gmail |
| `Port refused` | Port SMTP tidak benar atau firewall blocking |
| `No response` | SMTP host tidak valid |
| `ECONNREFUSED` | Koneksi internet atau SMTP server down |

---

## 📝 Recommended Testing Steps

### Step 1: Coba dengan Gmail Dulu
```env
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=app_password_16_char
```

**Expected Result:** ✅ Email masuk dalam 1-5 detik

### Step 2: Jika Gmail OK, Switch ke Custom Domain
```env
EMAIL_USER=05525@smkrus.sch.id
SMTP_HOST=mail.smkrus.sch.id
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_PASSWORD=school_email_password
```

---

## 📞 Jika Masih Tidak Bisa

Hubungi IT Sekolah dan tanyakan:
1. ✅ SMTP Server address untuk email `05525@smkrus.sch.id`
2. ✅ SMTP Port (biasanya 587 atau 465)
3. ✅ Apakah pakai TLS atau SSL
4. ✅ Username dan Password yang benar

---

## ✨ Email Service Detection

Sistem sudah update otomatis detect:
- Jika `EMAIL_USER` = @gmail.com → Pakai Gmail service
- Jika `EMAIL_USER` ≠ @gmail.com → Pakai custom SMTP dengan SMTP_HOST

Jadi Anda tinggal update `.env` dan restart! ✅

---

## 🎯 ACTION ITEMS

**Pilih satu:**

### Opsi A: Test Cepat dengan Gmail (5 menit)
```bash
# 1. Update .env pakai Gmail + app password
# 2. Restart: npm run dev
# 3. Test confirm-payment di Postman
```

### Opsi B: Tetap Pakai Custom Domain (perlu info IT)
```bash
# 1. Tanya IT sekolah: SMTP server address
# 2. Update .env dengan SMTP_HOST, SMTP_PORT, dll
# 3. Restart: npm run dev
# 4. Test confirm-payment
```

Saya recommend **Opsi A** untuk cepat verify sistem bekerja! 🚀
