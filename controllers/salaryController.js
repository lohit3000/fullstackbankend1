const { Salary, User } = require('../models');

// @desc    Generate salary slip for an employee
// @route   POST /api/salaries
// @access  Private/HR/Admin
const generateSalarySlip = async (req, res) => {
  const { employeeId, month, year, allowances, deductions } = req.body;

  try {
    if (!employeeId || !month || !year) {
      return res.status(400).json({ success: false, message: 'Please provide employee ID, month, and year' });
    }

    // Find the employee
    const employee = await User.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Check if salary slip already exists for this month and year for the employee
    const existingSlip = await Salary.findOne({ employee: employeeId, month, year });
    if (existingSlip) {
      return res.status(400).json({ success: false, message: `Salary slip already exists for ${month} ${year}` });
    }

    const basicSalary = employee.salary || 0;
    const allowVal = Number(allowances) || 0;
    const dedVal = Number(deductions) || 0;
    const netSalary = basicSalary + allowVal - dedVal;

    const salarySlip = await Salary.create({
      employee: employeeId,
      employeeName: employee.name,
      employeeEmail: employee.email,
      month,
      year: Number(year),
      basicSalary,
      allowances: allowVal,
      deductions: dedVal,
      netSalary,
      status: 'paid'
    });

    res.status(201).json({ success: true, message: 'Salary slip generated successfully', data: salarySlip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current employee's salary slips
// @route   GET /api/salaries/my
// @access  Private
const getMySalaries = async (req, res) => {
  try {
    const salaries = await Salary.find({ employee: req.user._id });
    res.status(200).json({ success: true, count: salaries.length, data: salaries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all generated salary slips
// @route   GET /api/salaries
// @access  Private/HR/Admin
const getAllSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find({});
    res.status(200).json({ success: true, count: salaries.length, data: salaries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  generateSalarySlip,
  getMySalaries,
  getAllSalaries
};
