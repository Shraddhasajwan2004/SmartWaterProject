const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// 1. Configure CORS dynamically
const allowedOrigins = [
  'http://localhost:3000',                  // Local React
  process.env.FRONTEND_URL                  // Production React (Set this in Render env vars)
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1 && !process.env.ALLOW_ALL_CORS) {
      // In development/testing you might want to allow all temporarily
      return callback(null, true); 
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// 2. Request Logger
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/data', require('./routes/dataRoutes'));

// Basic Health Check Route
app.get('/', (req, res) => {
  res.send('Smart Water Backend is Running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));