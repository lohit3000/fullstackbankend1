const { Leave } = require('../models');

// @desc    Submit a leave request
// @route   POST /api/leaves
// @access  Private
const requestLeave = async (req, res) => {
  const { type, startDate, endDate, reason } = req.body;

  try {
    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const leave = await Leave.create({
      employee: req.user._id,
      employeeName: req.user.name,
      type,
      startDate,
      endDate,
      reason,
      status: 'pending'
    });

    res.status(201).json({ success: true, message: 'Leave request submitted successfully', data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current employee's leave requests
// @route   GET /api/leaves/my
// @access  Private
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id });
    res.status(200).json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all leave requests
// @route   GET /api/leaves
// @access  Private/HR/Admin
const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({});
    res.status(200).json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or reject a leave request
// @route   PUT /api/leaves/:id
// @access  Private/HR/Admin
const updateLeaveStatus = async (req, res) => {
  const { status } = req.body;

  try {
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Choose approved or rejected' });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    const updatedLeave = await Leave.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          status,
          approvedBy: req.user.name
        } 
      },
      { new: true }
    );

    res.status(200).json({ success: true, message: `Leave request status updated to ${status}`, data: updatedLeave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  requestLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus
};
