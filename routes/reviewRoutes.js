const express = require('express');
const router = express.Router();
const {
  createReview,
  getMyReviews,
  getAllReviews
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorize('admin', 'hr'), createReview)
  .get(protect, authorize('admin', 'hr'), getAllReviews);

router.route('/my')
  .get(protect, getMyReviews);

module.exports = router;
