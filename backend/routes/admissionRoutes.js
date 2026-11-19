const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// @route   POST /api/admissions/pay-fee
// @desc    Simulate paying admission application fee
router.post('/pay-fee', protect, async (req, res) => {
  try {
    const updated = await User.updateById(req.user._id || req.user.id, {
      applicationFeeStatus: 'Paid',
      admissionStatus: 'Under Review'
    });
    return res.status(200).json({
      success: true,
      message: 'Application fee payment successful!',
      user: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/admissions/update-status
// @desc    Update admission status (e.g. for testing various states)
router.post('/update-status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Application Submitted', 'Under Review', 'Documents Verified', 'Offer Letter Issued', 'Admission Confirmed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid admission status' });
    }
    const updated = await User.updateById(req.user._id || req.user.id, {
      admissionStatus: status
    });
    return res.status(200).json({
      success: true,
      message: `Admission status updated to "${status}"`,
      user: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
