const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, authorize('admin', 'hr'), getEmployees);

router.route('/:id')
  .get(protect, getEmployeeById)
  .put(protect, authorize('admin', 'hr'), updateEmployee)
  .delete(protect, authorize('admin'), deleteEmployee);

module.exports = router;
