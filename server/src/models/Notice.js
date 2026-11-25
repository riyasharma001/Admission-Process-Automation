const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required.'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Notice details are required.'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Admission', 'Examination', 'General'],
      default: 'Admission',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notice', noticeSchema);
