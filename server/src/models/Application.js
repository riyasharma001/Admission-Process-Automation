const mongoose = require('mongoose');

const APPLICATION_STATUSES = [
  'Submitted',
  'Under Review',
  'Documents Pending',
  'Approved',
  'Rejected',
];

const documentSchema = new mongoose.Schema(
  {
    field: { type: String, required: true },
    label: { type: String, required: true },
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    url: { type: String, required: true },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const personalSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    dob: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    category: {
      type: String,
      enum: ['General', 'OBC', 'SC', 'ST', 'EWS'],
      required: true,
    },
    fatherName: { type: String, required: true, trim: true },
    motherName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const academicsSchema = new mongoose.Schema(
  {
    tenth: {
      board: { type: String, default: '' },
      school: { type: String, default: '' },
      passingYear: { type: String, default: '' },
      percentage: { type: Number, default: 0 },
    },
    twelfth: {
      board: { type: String, default: '' },
      school: { type: String, default: '' },
      passingYear: { type: String, default: '' },
      stream: { type: String, default: '' },
      percentage: { type: Number, default: 0 },
    },
    entrance: {
      exam: { type: String, default: '' },
      rollNumber: { type: String, default: '' },
      score: { type: String, default: '' },
      rank: { type: String, default: '' },
    },
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    message: { type: String, default: '' },
    changedBy: { type: String, default: 'System' },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const reviewChecklistSchema = new mongoose.Schema(
  {
    personalDetails: { type: Boolean, default: false },
    academicDetails: { type: Boolean, default: false },
    documents: { type: Boolean, default: false },
    eligibility: { type: Boolean, default: false },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    checklist: { type: reviewChecklistSchema, default: () => ({}) },
    notes: { type: String, default: '' },
    reviewedBy: { type: String, default: '' },
    reviewedAt: { type: Date, default: null },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    applicationNo: {
      type: String,
      required: true,
      unique: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    session: {
      type: String,
      default: '2026-27',
    },
    personal: {
      type: personalSchema,
      required: true,
    },
    academics: {
      type: academicsSchema,
      default: () => ({}),
    },
    documents: {
      type: [documentSchema],
      default: [],
    },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: 'Submitted',
    },
    remarks: {
      type: String,
      default: '',
    },
    timeline: {
      type: [timelineSchema],
      default: [],
    },
    review: {
      type: reviewSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

// One application per applicant per programme.
applicationSchema.index({ applicant: 1, course: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
Application.STATUSES = APPLICATION_STATUSES;

module.exports = Application;
