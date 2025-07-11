require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectDB = require('../db/db');
connectDB();

// API Routes
const authRoutes = require('../routes/authRoutes');
const blogRoutes = require('../routes/blogRoutes');
const eventRoutes = require('../routes/eventRoutes');
const jobRoutes = require('../routes/jobRoutes');
const contactRoutes = require('../routes/contactRoutes');
const donationRoutes = require('../routes/donationRoutes');
const activityRoutes = require('../routes/activityRoutes')
const userRoutes = require('../routes/userRoutes')
const roleRoutes = require('../routes/roleRoutes')
const causeRoutes = require('../routes/causeRoutes')
const volunteerRoutes = require('../routes/volunteerRoutes')

// Initialize Express app
const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:3000",
  "https://supanshadevelopment-kaxpaxhir-adarshs-projects-5a0ea829.vercel.app"
];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
// }));
app.use(cors({
  origin: ["http://localhost:3000", "https://supanshadevelopment2.vercel.app","http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 600,
}));


app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(cookieParser());


// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Supansha Backend API',
    version: '1.0.0',
    documentation: '/api-docs' // If you have API docs
  });
});



app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/job', jobRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/donation', donationRoutes);
app.use('/api/activities', activityRoutes)
app.use('/api/users', userRoutes)
app.use('/api/roles', roleRoutes)
app.use('/api/cause', causeRoutes)
app.use('/api/volunteers', volunteerRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app; // Export the app for testing
