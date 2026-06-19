const { Review, User } = require('../models');

// @desc    Submit a performance review for an employee
// @route   POST /api/reviews
// @access  Private/HR/Admin
const createReview = async (req, res) => {
  const { employeeId, rating, feedback, reviewPeriod } = req.body;

  try {
    if (!employeeId || !rating || !feedback || !reviewPeriod) {
      return res.status(400).json({ success: false, message: 'Please provide employee ID, rating, feedback, and review period' });
    }

    const employee = await User.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const review = await Review.create({
      employee: employeeId,
      employeeName: employee.name,
      reviewerName: req.user.name,
      rating: Number(rating),
      feedback,
      reviewPeriod
    });

    res.status(201).json({ success: true, message: 'Performance review submitted successfully', data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current employee's reviews
// @route   GET /api/reviews/my
// @access  Private
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ employee: req.user._id });
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews (HR/Admin)
// @route   GET /api/reviews
// @access  Private/HR/Admin
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({});
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReview,
  getMyReviews,
  getAllReviews
};
