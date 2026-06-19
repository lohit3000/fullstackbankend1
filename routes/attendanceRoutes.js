const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/checkin', protect, checkIn);
router.put('/checkout', protect, checkOut);
router.get('/my', protect, getMyAttendance);
router.get('/', protect, authorize('admin', 'hr'), getAllAttendance);

module.exports = router;
