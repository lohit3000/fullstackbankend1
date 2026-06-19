const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  checkIn: {
    type: String, // HH:MM:SS
    required: true
  },
  checkOut: {
    type: String, // HH:MM:SS
    default: null
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'leave'],
    default: 'present'
  }
}, {
  timestamps: true
});

// Compound unique key so an employee has only one attendance record per day
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
