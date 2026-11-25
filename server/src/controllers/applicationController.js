const fs = require('fs');
const Application = require('../models/Application');
const Course = require('../models/Course');
const Counter = require('../models/Counter');
const User = require('../models/User');

const SESSION = '2026-27';
const SESSION_YEAR = SESSION.slice(0, 4);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REVIEW_CHECKLIST_FIELDS = [
  'personalDetails',
  'academicDetails',
  'documents',
  'eligibility',
];
const REVIEW_NOTE_REQUIRED_STATUSES = ['Documents Pending', 'Rejected'];

const DOCUMENT_LABELS = {
  photo: 'Passport size photograph',
  marksheet10: 'Class 10 marksheet',
  marksheet12: 'Class 12 marksheet',
  idProof: 'Photo ID proof',
};

function parseObject(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return {};
  }
}

function cleanupFiles(files) {
  if (!files) return;
  const allFiles = Array.isArray(files) ? files : Object.values(files).flat();
  allFiles.forEach((file) => {
    fs.unlink(file.path, () => {});
  });
}

function validateApplication(personal, academics) {
  const requiredPersonal = [
    ['fullName', 'Full name'],
    ['dob', 'Date of birth'],
    ['gender', 'Gender'],
    ['category', 'Category'],
    ['fatherName', "Father's name"],
    ['motherName', "Mother's name"],
    ['phone', 'Mobile number'],
    ['email', 'Email address'],
    ['address', 'Address'],
    ['city', 'City'],
    ['state', 'State'],
    ['pincode', 'PIN code'],
  ];

  for (const [key, label] of requiredPersonal) {
    if (!String(personal[key] ?? '').trim()) return `${label} is required.`;
  }

  if (!EMAIL_PATTERN.test(String(personal.email).trim())) {
    return 'Please enter a valid email address.';
  }
  if (!/^[6-9]\d{9}$/.test(String(personal.phone).trim())) {
    return 'Please enter a valid 10-digit mobile number.';
  }
  if (!/^\d{6}$/.test(String(personal.pincode).trim())) {
    return 'Please enter a valid 6-digit PIN code.';
  }

  const tenth = academics.tenth || {};
  const twelfth = academics.twelfth || {};
  const academicFields = [
    ['board', 'board name'],
    ['school', 'school/college name'],
    ['passingYear', 'passing year'],
    ['percentage', 'percentage'],
  ];

  for (const [key, label] of academicFields) {
    if (!String(tenth[key] ?? '').trim()) return `Class 10 ${label} is required.`;
    if (!String(twelfth[key] ?? '').trim()) return `Class 12 ${label} is required.`;
  }

  for (const [className, marks] of [
    ['Class 10', tenth],
    ['Class 12', twelfth],
  ]) {
    const percentage = Number(marks.percentage);
    if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
      return `${className} percentage should be between 0 and 100.`;
    }
  }

  return null;
}

async function createApplication(req, res, next) {
  try {
    if (req.user.role !== 'student') {
      cleanupFiles(req.files);
      return res.status(403).json({ message: 'Only student accounts can submit admission applications.' });
    }

    const personal = parseObject(req.body.personal);
    const academics = parseObject(req.body.academics);
    const courseId = req.body.course;

    const problem = validateApplication(personal, academics);
    if (problem) {
      cleanupFiles(req.files);
      return res.status(400).json({ message: problem });
    }

    const course = courseId ? await Course.findById(courseId) : null;
    if (!course || !course.isActive) {
      cleanupFiles(req.files);
      return res.status(400).json({ message: 'Please select a valid programme that is open for admission.' });
    }

    const existing = await Application.findOne({
      applicant: req.user._id,
      course: course._id,
    });
    if (existing) {
      cleanupFiles(req.files);
      return res.status(409).json({
        message: `You have already applied for ${course.name}. Your application number is ${existing.applicationNo}.`,
      });
    }

    const files = req.files || {};
    const missing = Object.keys(DOCUMENT_LABELS).filter((field) => !files[field] || !files[field].length);
    if (missing.length) {
      cleanupFiles(files);
      return res.status(400).json({
        message: `Please upload: ${missing.map((field) => DOCUMENT_LABELS[field]).join(', ')}.`,
      });
    }

    const documents = Object.entries(files).flatMap(([field, list]) =>
      list.map((file) => ({
        field,
        label: DOCUMENT_LABELS[field] || field,
        fileName: file.filename,
        originalName: file.originalname,
        url: `/uploads/${file.filename}`,
        mimeType: file.mimetype,
        size: file.size,
      }))
    );

    const sequence = await Counter.next(`application-${SESSION_YEAR}`);
    const applicationNo = `ABES-${SESSION_YEAR}-${String(sequence).padStart(4, '0')}`;

    const application = await Application.create({
      applicationNo,
      applicant: req.user._id,
      course: course._id,
      session: SESSION,
      personal,
      academics,
      documents,
      status: 'Submitted',
      remarks: '',
      timeline: [
        {
          status: 'Submitted',
          message: 'Application submitted online. It will be checked by the admission cell.',
          changedBy: personal.fullName,
        },
      ],
    });

    await application.populate('course', 'name code degree duration feePerYear');

    return res.status(201).json({
      message: 'Application submitted successfully. Please keep your application number safe.',
      application,
    });
  } catch (error) {
    cleanupFiles(req.files);
    return next(error);
  }
}

async function myApplications(req, res, next) {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .select('-review')
      .populate('course', 'name code degree duration feePerYear')
      .sort({ createdAt: -1 });

    return res.json({ count: applications.length, applications });
  } catch (error) {
    return next(error);
  }
}

async function listApplications(req, res, next) {
  try {
    const { status, course, q } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (course) filter.course = course;

    let applications = await Application.find(filter)
      .populate('applicant', 'name email phone')
      .populate('course', 'name code degree')
      .sort({ createdAt: -1 });

    if (q) {
      const term = String(q).toLowerCase();
      applications = applications.filter((application) => {
        const applicantName = application.applicant ? application.applicant.name : '';
        const applicantEmail = application.applicant ? application.applicant.email : '';
        return (
          application.applicationNo.toLowerCase().includes(term) ||
          application.personal.fullName.toLowerCase().includes(term) ||
          applicantName.toLowerCase().includes(term) ||
          applicantEmail.toLowerCase().includes(term)
        );
      });
    }

    return res.json({ count: applications.length, applications });
  } catch (error) {
    return next(error);
  }
}

async function getApplication(req, res, next) {
  try {
    const application = await Application.findById(req.params.id)
      .populate('course')
      .populate('applicant', 'name email phone');

    if (!application) return res.status(404).json({ message: 'Application not found.' });

    const isOwner = application.applicant && application.applicant._id.equals(req.user._id);
    const isStaff = ['admin', 'reviewer'].includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: 'You are not allowed to view this application.' });
    }

    // The verification checklist and internal review notes are for staff only.
    if (!isStaff) {
      const studentView = application.toObject();
      delete studentView.review;
      return res.json(studentView);
    }

    return res.json(application);
  } catch (error) {
    return next(error);
  }
}

function normalizeChecklist(input) {
  const source = input && typeof input === 'object' ? input : {};
  return REVIEW_CHECKLIST_FIELDS.reduce((result, field) => {
    result[field] = source[field] === true;
    return result;
  }, {});
}

async function reviewApplication(req, res, next) {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found.' });

    const checklist = normalizeChecklist(req.body.checklist);
    const notes = String(req.body.notes || '').trim();
    const newStatus = String(req.body.status || '');

    if (newStatus && !Application.STATUSES.includes(newStatus)) {
      return res.status(400).json({ message: 'Please select a valid application status.' });
    }
    if (REVIEW_NOTE_REQUIRED_STATUSES.includes(newStatus) && !notes) {
      return res.status(400).json({
        message: `Add a note for the applicant before marking the application as ${newStatus}.`,
      });
    }
    if (newStatus === 'Approved' && !REVIEW_CHECKLIST_FIELDS.every((field) => checklist[field])) {
      return res.status(400).json({
        message: 'Complete all four verification checks before approving this application.',
      });
    }

    application.review = {
      checklist,
      notes,
      reviewedBy: req.user.name,
      reviewedAt: new Date(),
    };

    if (newStatus) {
      const changed = application.status !== newStatus || application.remarks !== notes;
      application.status = newStatus;
      application.remarks = notes;

      if (changed) {
        application.timeline.push({
          status: newStatus,
          message: notes || `Application marked as ${newStatus}.`,
          changedBy: req.user.name,
        });
      }
    }

    await application.save();
    await application.populate('course', 'name code degree');
    await application.populate('applicant', 'name email phone');

    return res.json({
      message: newStatus
        ? `Application marked as ${newStatus}.`
        : 'Verification checklist and review notes saved.',
      application,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status, remarks } = req.body;
    if (!Application.STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Please select a valid application status.' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found.' });

    const note = String(remarks || '').trim();
    application.status = status;
    application.remarks = note;
    application.timeline.push({
      status,
      message: note || `Application marked as ${status}.`,
      changedBy: req.user.name,
    });

    await application.save();
    await application.populate('course', 'name code degree');
    await application.populate('applicant', 'name email phone');

    return res.json({ message: `Application marked as ${status}.`, application });
  } catch (error) {
    return next(error);
  }
}

async function getStats(req, res, next) {
  try {
    const [totalApplications, totalStudents, activeCourses, submitted, underReview, documentsPending, approved, rejected] =
      await Promise.all([
        Application.countDocuments(),
        User.countDocuments({ role: 'student' }),
        Course.countDocuments({ isActive: true }),
        Application.countDocuments({ status: 'Submitted' }),
        Application.countDocuments({ status: 'Under Review' }),
        Application.countDocuments({ status: 'Documents Pending' }),
        Application.countDocuments({ status: 'Approved' }),
        Application.countDocuments({ status: 'Rejected' }),
      ]);

    const byCourse = await Application.aggregate([
      { $group: { _id: '$course', count: { $sum: 1 } } },
      { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
      { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          name: { $ifNull: ['$course.name', 'Removed programme'] },
          code: { $ifNull: ['$course.code', '-'] },
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    const recentApplications = await Application.find()
      .populate('applicant', 'name email')
      .populate('course', 'name code')
      .sort({ createdAt: -1 })
      .limit(6);

    return res.json({
      totalApplications,
      totalStudents,
      activeCourses,
      statusCounts: {
        Submitted: submitted,
        'Under Review': underReview,
        'Documents Pending': documentsPending,
        Approved: approved,
        Rejected: rejected,
      },
      pendingApplications: submitted + underReview + documentsPending,
      byCourse,
      recentApplications,
    });
  } catch (error) {
    return next(error);
  }
}

async function exportCsv(req, res, next) {
  try {
    const applications = await Application.find()
      .populate('applicant', 'name email')
      .populate('course', 'name code')
      .sort({ createdAt: -1 });

    const header = [
      'Application No',
      'Applicant',
      'Email',
      'Mobile',
      'Programme',
      'Course Code',
      'Category',
      'Gender',
      'Class 10 %',
      'Class 12 %',
      'Status',
      'Remarks',
      'Submitted On',
    ];

    const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

    const rows = applications.map((application) => [
      application.applicationNo,
      application.personal.fullName,
      application.applicant ? application.applicant.email : application.personal.email,
      application.personal.phone,
      application.course ? application.course.name : '-',
      application.course ? application.course.code : '-',
      application.personal.category,
      application.personal.gender,
      application.academics.tenth ? application.academics.tenth.percentage : '',
      application.academics.twelfth ? application.academics.twelfth.percentage : '',
      application.status,
      application.remarks,
      new Date(application.createdAt).toLocaleDateString('en-IN'),
    ]);

    const csv = [header, ...rows].map((row) => row.map(escape).join(',')).join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="abes-admissions-${new Date().toISOString().slice(0, 10)}.csv"`
    );
    return res.send(`\uFEFF${csv}`);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createApplication,
  myApplications,
  listApplications,
  getApplication,
  reviewApplication,
  updateStatus,
  getStats,
  exportCsv,
};
