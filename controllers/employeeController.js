const { User } = require('../models');
const bcrypt = require('bcryptjs');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private/HR/Admin
const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({});
    // Exclude password in response
    const formatted = employees.map(emp => {
      const { password, ...rest } = emp;
      return rest;
    });
    res.status(200).json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single employee details
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res) => {
  try {
    // If user is employee, they can only view their own profile
    if (req.user.role === 'employee' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view other employee details' });
    }

    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const { password, ...rest } = employee;
    res.status(200).json({ success: true, data: rest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update employee details
// @route   PUT /api/employees/:id
// @access  Private/HR/Admin
const updateEmployee = async (req, res) => {
  const { name, email, department, designation, salary, status, role, password } = req.body;

  try {
    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Role updates are restricted
    if (role && req.user.role !== 'admin' && employee.role !== role) {
      return res.status(403).json({ success: false, message: 'Only Admin can change employee roles' });
    }

    // Salaries are restricted
    if (salary !== undefined && req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ success: false, message: 'Only Admin/HR can change employee salaries' });
    }

    const updateFields = {
      name: name || employee.name,
      email: email || employee.email,
      department: department || employee.department,
      designation: designation || employee.designation,
      salary: salary !== undefined ? salary : employee.salary,
      status: status || employee.status,
      role: role || employee.role
    };

    // If password update requested
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    const updatedEmployee = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    const { password: pw, ...rest } = updatedEmployee;
    res.status(200).json({ success: true, message: 'Employee details updated successfully', data: rest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete employee (Admin only)
// @route   DELETE /api/employees/:id
// @access  Private/Admin
const deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Prevent deleting oneself
    if (employee._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Admin cannot delete their own account' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Employee removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
};
