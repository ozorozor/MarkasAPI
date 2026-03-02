/**
 * Optional Security Enhancements
 * Uncomment danImplementasi sesuai kebutuhan di production
 */

// ===== 1. HELMET - HTTP Security Headers =====
// npm install helmet

const setupHelmet = (app) => {
  const helmet = require('helmet');
  
  app.use(helmet());
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  }));
};

// ===== 2. RATE LIMITING - Prevent Brute Force & DDoS =====
// npm install express-rate-limit

const setupRateLimit = (app) => {
  const rateLimit = require('express-rate-limit');

  // General API limiter - 100 requests per 15 minutes
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Strict limiter untuk auth endpoints - 5 attempts per 15 minutes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply limiters
  app.use('/api/', generalLimiter);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  return { generalLimiter, authLimiter };
};

// ===== 3. COMPRESSION - Compress responses =====
// npm install compression

const setupCompression = (app) => {
  const compression = require('compression');
  app.use(compression());
};

// ===== 4. MONGODB INJECTION PREVENTION =====
// npm install mongo-sanitize

const setupMongoSanitize = (app) => {
  const mongoSanitize = require('mongo-sanitize');
  
  app.use(mongoSanitize()); // Prevent NoSQL injection
};

// ===== 5. XSS PREVENTION =====
// npm install xss-clean

const setupXssPrevention = (app) => {
  const xss = require('xss-clean');
  app.use(xss());
};

// ===== 6. REQUEST VALIDATION CLEANUP =====

const validateRequestSize = (app) => {
  app.use(express.json({ limit: '10kb' })); // Limit payload size
  app.use(express.urlencoded({ limit: '10kb', extended: true }));
};

// ===== 7. SECURE COOKIES =====

const setupSecureCookies = (app) => {
  app.use((req, res, next) => {
    res.cookie = function(name, val, options) {
      const opts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        ...options
      };
      return res.setHeader('Set-Cookie', `${name}=${val}; HttpOnly; Secure; SameSite=Strict`);
    };
    next();
  });
};

// ===== 8. CORS CONFIGURATION =====

const setupSecureCORS = (app) => {
  const cors = require('cors');
  
  const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };

  app.use(cors(corsOptions));
};

// ===== 9. REQUEST LOGGING =====
// npm install morgan

const setupLogging = (app) => {
  const morgan = require('morgan');
  
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    // Custom logging untuk production
    const morganFormat = ':method :url :status :response-time ms';
    app.use(morgan(morganFormat));
  }
};

// ===== 10. ERROR TRACKING =====
// npm install @sentry/node

const setupSentry = (app) => {
  const Sentry = require('@sentry/node');
  
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.errorHandler());
};

// ===== COMPLETE SETUP FUNCTION =====

const setupSecurityMiddlewares = (app) => {
  // Apply all security middlewares
  console.log('Setting up security middlewares...');
  
  setupHelmet(app);
  setupSecureCORS(app);
  setupRateLimit(app);
  setupCompression(app);
  setupLogging(app);
  validateRequestSize(app);
  setupSecureCookies(app);
  
  // Optional: Sentry for error tracking (production only)
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    setupSentry(app);
  }

  console.log('✓ Security middlewares configured');
};

module.exports = {
  setupHelmet,
  setupRateLimit,
  setupCompression,
  setupSecureCORS,
  setupLogging,
  setupSecurityMiddlewares,
};

// ===== USAGE IN SERVER.JS =====
/*
const express = require('express');
const { setupSecurityMiddlewares } = require('./security/middlewares');

const app = express();

// Setup all security middlewares
setupSecurityMiddlewares(app);

// Rest of your app setup...
*/

// ===== INSTALLATION COMMANDS =====
/*
npm install helmet compression mongo-sanitize xss-clean morgan @sentry/node

Production environment variables to add:

SENTRY_DSN=https://your-sentry-dsn
FRONTEND_URL=https://your-frontend-domain.com
*/
