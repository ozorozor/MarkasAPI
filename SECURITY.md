# Panduan Keamanan untuk Lapangan Booking API

## 🔒 Security Best Practices

### 1. Environment Variables
- **JANGAN pernah commit .env file ke repository**
- Gunakan `.env.example` sebagai template untuk development
- Di production, set variables langsung di server/container

### 2. JWT Secret
- Gunakan secret yang panjang (minimal 32 karakter) dan kompleks
- Jangan gunakan secret yang sama di development dan production
- Ganti secret secara berkala

Contoh generate secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Password Policy
- Password minimum 6 karakter (bisa ditambah di production)
- Password di-hash menggunakan bcryptjs dengan 10 salt rounds
- Jangan pernah return plain password di response

### 4. Database Security
- Gunakan strong password untuk database user
- Buat separate database user untuk application (jangan gunakan root)
- Limit database access hanya dari application server
- Enable SSL connection ke database jika possible

### 5. API Security

#### HTTPS
- Wajib menggunakan HTTPS di production
- Configure SSL/TLS certificate

#### CORS
- Konfigurasi CORS dengan specific origins (jangan gunakan '*' di production)
- Update CORS di `src/server.js`:
```javascript
app.use(cors({
  origin: 'https://frontend-domain.com',
  credentials: true
}));
```

#### Rate Limiting
- Implementasi rate limiting untuk protection dari brute force dan DDoS
- Tambahkan package `express-rate-limit`:
```bash
npm install express-rate-limit
```

Contoh:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

#### Input Validation
- Semua input sudah validate menggunakan Joi
- Sanitize input untuk prevent SQL injection
- Length limits untuk semua string fields

#### SQL Injection Prevention
- Menggunakan Sequelize ORM yang prevent SQL injection
- Jangan pernah menggunakan raw SQL queries dengan string concatenation
- Selalu gunakan parameterized queries

### 6. Authentication & Authorization
- JWT token valid 7 hari (bisa dikurangi di production)
- Role-based access control sudah implemented
- Check permission di setiap protected endpoint

### 7. Data Protection

#### Sensitive Data
- Password tidak boleh di-return di response
- Credit card/payment data harus di-encrypt jika disimpan
- Private data (email) tidak boleh di-expose untuk non-authorized users

#### Data Encryption
Untuk data sensitif, implementasi encryption:
```bash
npm install crypto
```

### 8. Logging & Monitoring
- Enable logging untuk semua request
- Monitor error logs
- Jangan log sensitive data (passwords, tokens)

Contoh update di `src/config/database.js`:
```javascript
logging: console.log, // Set ke true untuk development
```

### 9. Dependency Security
- Update dependencies secara regular
- Check untuk vulnerable packages:
```bash
npm audit
npm audit fix
```

### 10. Server Security

#### Helmet.js
Tambahkan security headers dengan helmet:
```bash
npm install helmet
```

Usage di `src/server.js`:
```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 11. Production Deployment Checklist

- [ ] Change default admin user password
- [ ] Update `NODE_ENV=production`
- [ ] Generate secure JWT_SECRET
- [ ] Configure secure database password
- [ ] Enable HTTPS/SSL
- [ ] Configure specific CORS origins
- [ ] Setup rate limiting
- [ ] Enable logging dan monitoring
- [ ] Database backup setup
- [ ] Error tracking (Sentry, etc.)
- [ ] Regular security audits
- [ ] Update dependencies

### 12. Common Vulnerabilities & Prevention

#### SQL Injection
- ✓ Already prevented dengan Sequelize ORM

#### Cross-Site Scripting (XSS)
- ✓ API returns JSON, bukan HTML
- Frontend harus escape semua user input

#### Cross-Site Request Forgery (CSRF)
- Frontend harus send CSRF token untuk state-changing requests
- Bisa implement dengan CSRF middleware jika perlu

#### Broken Authentication
- ✓ JWT token validation implemented
- ✓ Password properly hashed

#### Sensitive Data Exposure
- ✓ Jangan log sensitive data
- ✓ Use HTTPS di production

### 13. Testing Security
```bash
# Check dependencies untuk vulnerabilities
npm audit

# Test endpoints dengan invalid tokens
# Test dengan SQL injection attempts
# Test rate limiting
# Test permission checks
```

### 14. Sample Helmet Configuration
```javascript
const helmet = require('helmet');

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
  }
}));
```

## 🚨 Security Incident Response

Jika ada security breach:
1. Identify affected data
2. Notify users immediately
3. Invalidate all existing tokens
4. Force password reset
5. Enable 2FA jika possible
6. Audit logs untuk investigate
7. Patch vulnerability

## 📚 Security Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)

---

**Last Updated**: February 2026
