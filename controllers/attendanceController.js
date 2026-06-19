const { Attendance } = require('../models');

// @desc    Check-In attendance (punch-in)
// @route   POST /api/attendance/checkin
// @access  Private
const checkIn = async (req, res) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const nowTime = new Date().toTimeString().split(' ')[0]; // HH:MM:SS

  try {
    // Check if employee already checked in today
    const existingRecord = await Attendance.findOne({ employee: req.user._id, date: today });

    if (existingRecord) {
      return res.status(400).json({ success: false, message: 'You have already checked in today' });
    }

    const record = await Attendance.create({
      employee: req.user._id,
      employeeName: req.user.name,
      date: today,
      checkIn: nowTime,
      status: 'present'
    });

    res.status(201).json({ success: true, message: 'Checked in successfully', data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check-Out attendance (punch-out)
// @route   PUT /api/attendance/checkout
// @access  Private
const checkOut = async (req, res) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const nowTime = new Date().toTimeString().split(' ')[0]; // HH:MM:SS

  try {
    // Find today's record
    const record = await Attendance.findOne({ employee: req.user._id, date: today });

    if (!record) {
      return res.status(400).json({ success: false, message: 'No check-in record found for today' });
    }

    if (record.checkOut) {
      return res.status(400).json({ success: false, message: 'You have already checked out today' });
    }

    const updatedRecord = await Attendance.findByIdAndUpdate(
      record._id,
      { $set: { checkOut: nowTime } },
      { new: true }
    );

    res.status(200).json({ success: true, message: 'Checked out successfully', data: updatedRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current employee's attendance history
// @route   GET /api/attendance/my
// @access  Private
const getMyAttendance = async (req, res) => {
  try {
    const history = await Attendance.find({ employee: req.user._id });
    res.status(200).json({ success: true, count: history.length, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all employees' attendance (HR/Admin)
// @route   GET /api/attendance
// @access  Private/HR/Admin
const getAllAttendance = async (req, res) => {
  try {
    const history = await Attendance.find({});
    res.status(200).json({ success: true, count: history.length, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance
};
