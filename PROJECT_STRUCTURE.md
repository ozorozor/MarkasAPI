project/
│
├── src/
│   ├── config/
│   │   └── database.js                 # Database configuration
│   │
│   ├── models/
│   │   ├── User.js                     # User model dengan password hashing
│   │   ├── Lapangan.js                 # Lapangan model
│   │   ├── Booking.js                  # Booking model dengan relationships
│   │   └── index.js                    # Models export
│   │
│   ├── controllers/
│   │   ├── authController.js           # Register, Login, Get Profile
│   │   ├── lapanganController.js       # CRUD Lapangan + Availability
│   │   └── bookingController.js        # Create, View, Payment, Cancel Booking
│   │
│   ├── routes/
│   │   ├── authRoutes.js               # Auth endpoints
│   │   ├── lapanganRoutes.js           # Lapangan endpoints
│   │   └── bookingRoutes.js            # Booking endpoints
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js           # JWT verification & role authorization
│   │   └── errorHandler.js             # Centralized error handling
│   │
│   ├── validators/
│   │   ├── schemas.js                  # Joi validation schemas
│   │   └── validateRequest.js          # Validation middleware
│   │
│   ├── seeds/
│   │   └── init.js                     # Database initialization & sample data
│   │
│   └── server.js                       # Express app setup & startup
│
├── package.json                        # Dependencies & scripts
├── .env                                # Environment variables (JANGAN commit!)
├── .env.example                        # Template untuk .env
├── .gitignore                          # Git ignore rules
├── README.md                           # Dokumentasi lengkap API
├── SECURITY.md                         # Security guidelines
└── API_EXAMPLES.http                   # Contoh request untuk testing
