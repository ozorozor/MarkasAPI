const nodemailer = require('nodemailer');
require('dotenv').config();

// ==================== EMAIL TRANSPORTER ====================
// Support both Gmail dan Custom Domain SMTP

let transporter;

// Detect apakah menggunakan Gmail atau custom domain
const isGmailAccount = process.env.EMAIL_USER?.includes('@gmail.com');

if (isGmailAccount) {
  // Configuration untuk Gmail dengan App Password
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  console.log('📧 Email Service: Gmail SMTP');
} else {
  // Configuration untuk Custom Domain (misalnya sekolah)
  // Gunakan Gmail's SMTP server tapi dengan email custom domain
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true' || false, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  console.log(`📧 Email Service: Custom SMTP (${process.env.SMTP_HOST || 'smtp.gmail.com'}:${process.env.SMTP_PORT || 587})`);
}

// ==================== SEND EMAIL BOOKING CONFIRMATION ====================
const sendBookingConfirmation = async (user, booking, lapangan) => {
  try {
    const formattedDate = new Date(booking.tanggal).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const totalPrice = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(booking.total_harga);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <!-- Header -->
        <div style="background-color: #4CAF50; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">✓ Booking Dikonfirmasi!</h1>
        </div>

        <!-- Body -->
        <div style="padding: 30px;">
          <h2 style="color: #333; font-size: 20px;">Halo ${user.nama},</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Selamat! Booking lapangan Anda telah berhasil dikonfirmasi oleh admin. Anda sekarang dapat menggunakan lapangan yang telah Anda pesan.
          </p>

          <!-- Booking Details -->
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">📋 Detail Booking</h3>
            
            <div style="margin-bottom: 15px;">
              <p style="color: #666; margin: 5px 0;"><strong>Nama Lapangan:</strong> ${lapangan.nama_lapangan}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Tanggal:</strong> ${formattedDate}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Jam:</strong> ${booking.jam_mulai} - ${booking.jam_selesai}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Total Harga:</strong> <span style="color: #4CAF50; font-size: 18px; font-weight: bold;">${totalPrice}</span></p>
            </div>
          </div>

          <!-- Important Information -->
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <h4 style="color: #856404; margin-top: 0;">⚠️ Penting</h4>
            <ul style="color: #856404; margin: 10px 0; padding-left: 20px;">
              <li>Pastikan Anda hadir 15 menit sebelum waktu yang dijadwalkan</li>
              <li>Membawa bukti identitas atau booking confirmation ini saat tiba</li>
              <li>Jika ingin membatalkan, hubungi admin sebelum 24 jam sebelum jadwal</li>
            </ul>
          </div>

          <!-- Footer Message -->
          <p style="color: #999; font-size: 14px; line-height: 1.6; margin-top: 30px;">
            Terima kasih telah menggunakan Markas Lapangan. Jika ada pertanyaan, silakan hubungi tim support kami.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
          <p style="color: #999; font-size: 12px; margin: 5px 0;">
            Email ini dikirim otomatis dari sistem Markas Lapangan
          </p>
          <p style="color: #999; font-size: 12px; margin: 5px 0;">
            © 2024 Markas Lapangan. Semua hak dilindungi.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `🎉 Booking Lapangan Dikonfirmasi - ${lapangan.nama_lapangan}`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`✓ Email confirmation sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    throw error;
  }
};

// ==================== SEND EMAIL BOOKING REJECTION ====================
const sendBookingRejection = async (user, booking, lapangan, reason = '') => {
  try {
    const formattedDate = new Date(booking.tanggal).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <!-- Header -->
        <div style="background-color: #f44336; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">✗ Booking Ditolak</h1>
        </div>

        <!-- Body -->
        <div style="padding: 30px;">
          <h2 style="color: #333; font-size: 20px;">Halo ${user.nama},</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Mohon maaf, booking lapangan Anda telah ditolak oleh admin.
          </p>

          <!-- Booking Details -->
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">📋 Detail Booking</h3>
            
            <div style="margin-bottom: 15px;">
              <p style="color: #666; margin: 5px 0;"><strong>Nama Lapangan:</strong> ${lapangan.nama_lapangan}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Tanggal:</strong> ${formattedDate}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Jam:</strong> ${booking.jam_mulai} - ${booking.jam_selesai}</p>
              ${reason ? `<p style="color: #f44336; margin: 5px 0;"><strong>Alasan:</strong> ${reason}</p>` : ''}
            </div>
          </div>

          <!-- Action -->
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
            Anda dapat melakukan booking ulang untuk tanggal dan jam yang berbeda.
          </p>

          <!-- Footer Message -->
          <p style="color: #999; font-size: 14px; line-height: 1.6; margin-top: 30px;">
            Jika Anda merasa ini adalah kesalahan, silakan hubungi tim support kami.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
          <p style="color: #999; font-size: 12px; margin: 5px 0;">
            Email ini dikirim otomatis dari sistem Markas Lapangan
          </p>
          <p style="color: #999; font-size: 12px; margin: 5px 0;">
            © 2024 Markas Lapangan. Semua hak dilindungi.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `Booking Lapangan Ditolak - ${lapangan.nama_lapangan}`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`✓ Rejection email sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Error sending rejection email:', error.message);
    throw error;
  }
};

module.exports = {
  sendBookingConfirmation,
  sendBookingRejection
};
