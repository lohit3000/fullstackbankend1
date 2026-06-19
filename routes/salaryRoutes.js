const express = require('express');
const router = express.Router();
const {
  generateSalarySlip,
  getMySalaries,
  getAllSalaries
} = require('../controllers/salaryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorize('admin', 'hr'), generateSalarySlip)
  .get(protect, authorize('admin', 'hr'), getAllSalaries);

router.route('/my')
  .get(protect, getMySalaries);

module.exports = router;
