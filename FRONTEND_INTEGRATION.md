# 🔗 Frontend Integration Guide

Panduan lengkap untuk mengintegrasikan API ini dengan frontend.

## 📋 Prerequisites

- Frontend framework (React, Vue, etc.)
- HTTP client library (axios, fetch, etc.)
- LocalStorage atau similar untuk token management

## 🔐 Authentication Flow

### 1. Register User

```javascript
// POST /api/auth/register
const register = async (userData) => {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nama: userData.nama,
      email: userData.email,
      password: userData.password,
      role: 'user' // default: user, bisa 'admin'
    })
  });

  const data = await response.json();
  
  if (data.success) {
    // Simpan token di localStorage
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('userId', data.data.id_user);
    localStorage.setItem('userRole', data.data.role);
    return data.data;
  } else {
    throw new Error(data.message);
  }
};
```

### 2. Login User

```javascript
// POST /api/auth/login
const login = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password
    })
  });

  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('userId', data.data.id_user);
    localStorage.setItem('userRole', data.data.role);
    return data.data;
  } else {
    throw new Error(data.message);
  }
};
```

### 3. Get User Profile

```javascript
// GET /api/auth/profile
const getUserProfile = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/auth/profile', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  
  if (data.success) {
    return data.data;
  } else {
    throw new Error(data.message);
  }
};
```

### 4. Logout

```javascript
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  // Redirect ke login page
  window.location.href = '/login';
};
```

## 📍 Lapangan Management

### Get All Lapangan

```javascript
// GET /api/lapangan
const getAllLapangan = async () => {
  const response = await fetch('http://localhost:5000/api/lapangan');
  const data = await response.json();
  
  if (data.success) {
    return data.data; // Array of lapangan
  } else {
    throw new Error(data.message);
  }
};
```

### Get Lapangan by ID

```javascript
// GET /api/lapangan/:id
const getLapanganById = async (id) => {
  const response = await fetch(`http://localhost:5000/api/lapangan/${id}`);
  const data = await response.json();
  
  if (data.success) {
    return data.data;
  } else {
    throw new Error(data.message);
  }
};
```

### Check Availability

```javascript
// GET /api/lapangan/availability/check?tanggal=YYYY-MM-DD
const checkAvailability = async (tanggal) => {
  const response = await fetch(
    `http://localhost:5000/api/lapangan/availability/check?tanggal=${tanggal}`
  );
  const data = await response.json();
  
  if (data.success) {
    return data.data;
  } else {
    throw new Error(data.message);
  }
};
```

### Create Lapangan (Admin Only)

```javascript
// POST /api/lapangan
const createLapangan = async (lapanganData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/lapangan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      nama_lapangan: lapanganData.nama_lapangan,
      harga_per_jam: lapanganData.harga_per_jam,
      deskripsi: lapanganData.deskripsi
    })
  });

  const data = await response.json();
  
  if (data.success) {
    return data.data;
  } else {
    throw new Error(data.message);
  }
};
```

## 🎫 Booking Management

### Create Booking

```javascript
// POST /api/booking
const createBooking = async (bookingData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/booking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      id_lapangan: bookingData.id_lapangan,
      tanggal: bookingData.tanggal, // Format: YYYY-MM-DD
      jam_mulai: bookingData.jam_mulai, // Format: HH:MM
      jam_selesai: bookingData.jam_selesai // Format: HH:MM
    })
  });

  const data = await response.json();
  
  if (data.success) {
    // Show payment deadline timer
    const remainingSeconds = Math.floor(
      (new Date(data.data.batas_pembayaran) - Date.now()) / 1000
    );
    console.log(`Payment deadline: ${remainingSeconds} seconds`);
    return data.data;
  } else {
    throw new Error(data.message);
  }
};
```

### Get User's Bookings

```javascript
// GET /api/booking/user/my-bookings
const getUserBookings = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/booking/user/my-bookings', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  
  if (data.success) {
    return data.data; // Array of user's bookings
  } else {
    throw new Error(data.message);
  }
};
```

### Get Booking Detail

```javascript
// GET /api/booking/:id
const getBookingDetail = async (id) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:5000/api/booking/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  
  if (data.success) {
    return data.data;
  } else {
    throw new Error(data.message);
  }
};
```

### Confirm Payment

```javascript
// PATCH /api/booking/:id/confirm-payment
const confirmPayment = async (bookingId) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:5000/api/booking/${bookingId}/confirm-payment`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  const data = await response.json();
  
  if (data.success) {
    console.log('Payment confirmed successfully');
    return data.data;
  } else {
    throw new Error(data.message);
  }
};
```

### Cancel Booking

```javascript
// PATCH /api/booking/:id/cancel
const cancelBooking = async (bookingId) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:5000/api/booking/${bookingId}/cancel`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  const data = await response.json();
  
  if (data.success) {
    console.log('Booking cancelled successfully');
    return data;
  } else {
    throw new Error(data.message);
  }
};
```

## 🛠️ Axios Setup (Recommended)

Create `api.js` untuk centralized API calls:

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

Usage:

```javascript
import api from './api';

// Register
const response = await api.post('/auth/register', {
  nama: 'John',
  email: 'john@example.com',
  password: 'password123'
});

// Get lapangan
const lapangan = await api.get('/lapangan');

// Create booking
const booking = await api.post('/booking', {
  id_lapangan,
  tanggal,
  jam_mulai,
  jam_selesai
});
```

## ⏱️ Payment Countdown Timer

```javascript
// Timer untuk countdown pembayaran
const startPaymentTimer = (bookingData) => {
  const deadline = new Date(bookingData.batas_pembayaran);
  
  const timerInterval = setInterval(() => {
    const now = new Date();
    const remaining = deadline - now;
    
    if (remaining <= 0) {
      clearInterval(timerInterval);
      alert('Waktu pembayaran sudah habis!');
      // Refresh booking status
      return;
    }
    
    const minutes = Math.floor((remaining / 1000 / 60) % 60);
    const seconds = Math.floor((remaining / 1000) % 60);
    
    // Update UI dengan countdown
    document.getElementById('timer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
  
  return timerInterval;
};
```

## 🎨 React Example Component

```javascript
import React, { useState, useEffect } from 'react';
import api from './api';

const BookingForm = () => {
  const [lapangan, setLapangan] = useState(null);
  const [bookingData, setBookingData] = useState({
    id_lapangan: '',
    tanggal: '',
    jam_mulai: '',
    jam_selesai: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLapangan();
  }, []);

  const fetchLapangan = async () => {
    try {
      const response = await api.get('/lapangan');
      setLapangan(response.data.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post('/booking', bookingData);
      
      if (response.data.success) {
        alert('Booking berhasil! Silahkan melakukan pembayaran dalam 15 menit.');
        // Clear form
        setBookingData({
          id_lapangan: '',
          tanggal: '',
          jam_mulai: '',
          jam_selesai: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select
        value={bookingData.id_lapangan}
        onChange={(e) => setBookingData({...bookingData, id_lapangan: e.target.value})}
        required
      >
        <option value="">Pilih Lapangan</option>
        {lapangan?.map(l => (
          <option key={l.id_lapangan} value={l.id_lapangan}>
            {l.nama_lapangan} - Rp {l.harga_per_jam}/jam
          </option>
        ))}
      </select>

      <input
        type="date"
        value={bookingData.tanggal}
        onChange={(e) => setBookingData({...bookingData, tanggal: e.target.value})}
        required
      />

      <input
        type="time"
        value={bookingData.jam_mulai}
        onChange={(e) => setBookingData({...bookingData, jam_mulai: e.target.value})}
        required
      />

      <input
        type="time"
        value={bookingData.jam_selesai}
        onChange={(e) => setBookingData({...bookingData, jam_selesai: e.target.value})}
        required
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Book Lapangan'}
      </button>
    </form>
  );
};

export default BookingForm;
```

## 🔄 Polling untuk Auto-refresh Booking Status

```javascript
// Poll untuk check apakah payment sudah expired
const pollBookingStatus = (bookingId, interval = 5000) => {
  const pollInterval = setInterval(async () => {
    try {
      const response = await api.get(`/booking/${bookingId}`);
      const booking = response.data.data;
      
      // Jika status berubah, stop polling dan update UI
      if (booking.status_pembayaran !== 'pending') {
        clearInterval(pollInterval);
        // Update UI
        console.log('Booking status changed:', booking.status_pembayaran);
      }
    } catch (error) {
      console.error('Poll error:', error);
    }
  }, interval);
  
  return pollInterval;
};
```

## 📡 Environment Variables

Create `.env` di frontend folder:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_JWT_EXPIRY=7d
```

## 🚀 Deployment Checklist

- [ ] API URL pointing ke production server
- [ ] Secure token handling (httpOnly cookies preferred)
- [ ] Error handling untuk network issues
- [ ] Loading states untuk semua requests
- [ ] Timeout handling
- [ ] Auto-refresh token sebelum expire
- [ ] Proper error messages untuk users
- [ ] HTTPS connection

---

**Happy coding! 🎉**
