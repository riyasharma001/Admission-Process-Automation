const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Course code is required.'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Course name is required.'],
      trim: true,
    },
    degree: {
      type: String,
      required: [true, 'Degree type is required.'],
      trim: true,
    },
    duration: {
      type: String,
      default: '4 years',
      trim: true,
    },
    seats: {
      type: Number,
      required: [true, 'Number of seats is required.'],
      min: [0, 'Seats cannot be negative.'],
    },
    feePerYear: {
      type: Number,
      required: [true, 'Fee is required.'],
      min: [0, 'Fee cannot be negative.'],
    },
    eligibility: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
