const express = require('express');
const router = express.Router();
const {
  requestLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, requestLeave)
  .get(protect, authorize('admin', 'hr'), getAllLeaves);

router.route('/my')
  .get(protect, getMyLeaves);

router.route('/:id')
  .put(protect, authorize('admin', 'hr'), updateLeaveStatus);

module.exports = router;
