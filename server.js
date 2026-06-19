require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/dbConnect');

// Connect to Database & Auto-Seed
connectDB().then(async () => {
  try {
    const { seedDB } = require('./seed');
    await seedDB(false);
  } catch (error) {
    console.error('⚠️ Auto-seeding check failed:', error.message);
  }
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Employee Management System API' });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/salaries', require('./routes/salaryRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
