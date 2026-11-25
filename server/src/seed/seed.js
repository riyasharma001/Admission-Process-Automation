const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Course = require('../models/Course');
const Notice = require('../models/Notice');
const Application = require('../models/Application');
const Counter = require('../models/Counter');

const SESSION = '2026-27';
const SESSION_YEAR = SESSION.slice(0, 4);

const courses = [
  {
    code: 'CSE',
    name: 'Computer Science & Engineering',
    degree: 'B.Tech',
    duration: '4 years',
    seats: 240,
    feePerYear: 165000,
    eligibility: '10+2 with Physics, Chemistry and Mathematics, minimum 50% marks. JEE Main / CUET score preferred.',
    description:
      'Covers programming, data structures, operating systems, computer networks, databases and software engineering, with elective specialisations in the final year.',
  },
  {
    code: 'IT',
    name: 'Information Technology',
    degree: 'B.Tech',
    duration: '4 years',
    seats: 120,
    feePerYear: 155000,
    eligibility: '10+2 with Physics, Chemistry and Mathematics, minimum 50% marks. JEE Main / CUET score preferred.',
    description:
      'Focuses on application development, web technologies, networking, cyber security and IT infrastructure management.',
  },
  {
    code: 'AIML',
    name: 'Computer Science & Engineering (AI & ML)',
    degree: 'B.Tech',
    duration: '4 years',
    seats: 120,
    feePerYear: 165000,
    eligibility: '10+2 with Physics, Chemistry and Mathematics, minimum 50% marks. JEE Main / CUET score preferred.',
    description:
      'Specialised programme in artificial intelligence, machine learning, deep learning, natural language processing and data-driven systems.',
  },
  {
    code: 'DS',
    name: 'Computer Science & Engineering (Data Science)',
    degree: 'B.Tech',
    duration: '4 years',
    seats: 60,
    feePerYear: 165000,
    eligibility: '10+2 with Physics, Chemistry and Mathematics, minimum 50% marks. JEE Main / CUET score preferred.',
    description:
      'Builds a foundation in statistics, big data, data visualisation and applied machine learning for analytics roles.',
  },
  {
    code: 'ECE',
    name: 'Electronics & Communication Engineering',
    degree: 'B.Tech',
    duration: '4 years',
    seats: 180,
    feePerYear: 145000,
    eligibility: '10+2 with Physics, Chemistry and Mathematics, minimum 50% marks. JEE Main / CUET score preferred.',
    description:
      'Covers electronic devices, communication systems, embedded systems, signal processing and VLSI design.',
  },
  {
    code: 'ME',
    name: 'Mechanical Engineering',
    degree: 'B.Tech',
    duration: '4 years',
    seats: 120,
    feePerYear: 130000,
    eligibility: '10+2 with Physics, Chemistry and Mathematics, minimum 50% marks. JEE Main / CUET score preferred.',
    description:
      'Studies thermal engineering, machine design, manufacturing processes, CAD/CAM and industrial engineering.',
  },
  {
    code: 'CE',
    name: 'Civil Engineering',
    degree: 'B.Tech',
    duration: '4 years',
    seats: 60,
    feePerYear: 125000,
    eligibility: '10+2 with Physics, Chemistry and Mathematics, minimum 50% marks. JEE Main / CUET score preferred.',
    description:
      'Covers structural engineering, surveying, geotechnical engineering, transportation and construction management.',
  },
  {
    code: 'MBA',
    name: 'Master of Business Administration',
    degree: 'MBA',
    duration: '2 years',
    seats: 120,
    feePerYear: 140000,
    eligibility: "Bachelor's degree in any discipline with minimum 50% marks. Valid CAT / MAT / CMAT / CUET PG score preferred.",
    description:
      'Two-year management programme with specialisations in marketing, finance, human resources and business analytics.',
  },
  {
    code: 'MCA',
    name: 'Master of Computer Applications',
    degree: 'MCA',
    duration: '2 years',
    seats: 60,
    feePerYear: 120000,
    eligibility: "Bachelor's degree with Mathematics at 10+2 or graduation level, minimum 50% marks. CUET PG score preferred.",
    description:
      'Advanced programme in software development, algorithms, database systems, cloud computing and application architecture.',
  },
];

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

const notices = [
  {
    title: 'Online applications open for the 2026-27 session',
    body:
      'Applications for B.Tech, MBA and MCA programmes are now open. Candidates should fill the online form, upload the required documents and keep the application number for future reference. The last date for online submission is 30 June 2026.',
    category: 'Admission',
    date: daysAgo(2),
  },
  {
    title: 'Document verification schedule for B.Tech applicants',
    body:
      'Document verification for B.Tech applicants will begin on 15 June 2026 at the admission office. Bring original marksheets of Classes 10 and 12, photo ID proof and four passport size photographs. Reporting time is 10:00 am.',
    category: 'Admission',
    date: daysAgo(5),
  },
  {
    title: 'Hostel accommodation request form',
    body:
      'Students who wish to apply for hostel accommodation should submit the hostel request form at the hostel office along with the admission receipt. Rooms are allotted on a first-come, first-served basis. For details, contact the hostel office at hostel@abes.ac.in.',
    category: 'General',
    date: daysAgo(8),
  },
  {
    title: 'First merit list announcement',
    body:
      'The first merit list for B.Tech admissions will be published on 5 July 2026 on the college notice board and this portal. Selected candidates must complete fee payment within seven days of the announcement.',
    category: 'Admission',
    date: daysAgo(11),
  },
  {
    title: 'Admission help desk timings',
    body:
      'The admission help desk is open from Monday to Saturday, 9:00 am to 5:00 pm. Candidates can call +91 120 713 5111 or write to admissions@abes.ac.in for queries about eligibility, fees and document verification.',
    category: 'General',
    date: daysAgo(15),
  },
];

const demoApplicants = [
  {
    name: 'Riya Sharma',
    email: 'student@example.com',
    phone: '9876543210',
    courseCode: 'CSE',
    status: 'Under Review',
    remarks: 'Documents received. Academic details are being verified with the board records.',
    personal: {
      fullName: 'Riya Sharma',
      dob: '2006-04-12',
      gender: 'Female',
      category: 'General',
      fatherName: 'Rajesh Sharma',
      motherName: 'Sunita Sharma',
      phone: '9876543210',
      email: 'student@example.com',
      address: 'B-42, Raj Nagar Extension',
      city: 'Ghaziabad',
      state: 'Uttar Pradesh',
      pincode: '201017',
    },
    academics: {
      tenth: { board: 'CBSE', school: 'Delhi Public School, Ghaziabad', passingYear: '2022', percentage: 92.4 },
      twelfth: {
        board: 'CBSE',
        school: 'Delhi Public School, Ghaziabad',
        passingYear: '2024',
        stream: 'Physics, Chemistry, Mathematics',
        percentage: 88.6,
      },
      entrance: { exam: 'JEE Main', rollNumber: '2401102345', score: '92.4 percentile', rank: '15420' },
    },
  },
  {
    name: 'Aman Verma',
    email: 'aman@example.com',
    phone: '9812345678',
    courseCode: 'ME',
    status: 'Approved',
    remarks: 'Eligibility confirmed. Provisional admission letter will be issued after fee payment.',
    personal: {
      fullName: 'Aman Verma',
      dob: '2005-11-03',
      gender: 'Male',
      category: 'OBC',
      fatherName: 'Mahesh Verma',
      motherName: 'Kavita Verma',
      phone: '9812345678',
      email: 'aman@example.com',
      address: 'H.No. 18, Model Town',
      city: 'Meerut',
      state: 'Uttar Pradesh',
      pincode: '250002',
    },
    academics: {
      tenth: { board: 'UP Board', school: 'Saraswati Vidya Mandir, Meerut', passingYear: '2021', percentage: 85.2 },
      twelfth: {
        board: 'UP Board',
        school: 'Saraswati Vidya Mandir, Meerut',
        passingYear: '2023',
        stream: 'Physics, Chemistry, Mathematics',
        percentage: 79.8,
      },
      entrance: { exam: 'JEE Main', rollNumber: '2401098765', score: '78.1 percentile', rank: '48210' },
    },
  },
  {
    name: 'Sneha Gupta',
    email: 'sneha@example.com',
    phone: '9898989898',
    courseCode: 'MBA',
    status: 'Submitted',
    remarks: '',
    personal: {
      fullName: 'Sneha Gupta',
      dob: '2003-07-21',
      gender: 'Female',
      category: 'General',
      fatherName: 'Anil Gupta',
      motherName: 'Poonam Gupta',
      phone: '9898989898',
      email: 'sneha@example.com',
      address: 'C-9, Sector 15',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201301',
    },
    academics: {
      tenth: { board: 'ICSE', school: 'St. Mary’s Convent School, Noida', passingYear: '2019', percentage: 90.1 },
      twelfth: {
        board: 'ISC',
        school: 'St. Mary’s Convent School, Noida',
        passingYear: '2021',
        stream: 'Commerce',
        percentage: 87.3,
      },
      entrance: { exam: 'CAT', rollNumber: 'CAT24003321', score: '82 percentile', rank: '' },
    },
  },
];

async function seed() {
  await connectDB();

  for (const course of courses) {
    await Course.findOneAndUpdate(
      { code: course.code },
      course,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log(`Programmes ready: ${courses.length}`);

  let admin = await User.findOne({ email: 'admin@abes.ac.in' });
  if (!admin) {
    admin = await User.create({
      name: 'Admission Cell',
      email: 'admin@abes.ac.in',
      password: 'Admin@123',
      phone: '01207135111',
      role: 'admin',
    });
  }
  console.log('Staff account ready: admin@abes.ac.in / Admin@123');

  let reviewer = await User.findOne({ email: 'reviewer@abes.ac.in' });
  if (!reviewer) {
    reviewer = await User.create({
      name: 'Priya Nair',
      email: 'reviewer@abes.ac.in',
      password: 'Reviewer@123',
      phone: '01207135112',
      role: 'reviewer',
    });
  }
  console.log('Reviewer account ready: reviewer@abes.ac.in / Reviewer@123');

  for (const notice of notices) {
    await Notice.findOneAndUpdate(
      { title: notice.title },
      notice,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log(`Notices ready: ${notices.length}`);

  for (const demo of demoApplicants) {
    let student = await User.findOne({ email: demo.email });
    if (!student) {
      student = await User.create({
        name: demo.name,
        email: demo.email,
        password: 'Student@123',
        phone: demo.phone,
        role: 'student',
      });
    }

    const course = await Course.findOne({ code: demo.courseCode });
    if (!course) continue;

    const existing = await Application.findOne({ applicant: student._id, course: course._id });
    if (existing) continue;

    const sequence = await Counter.next(`application-${SESSION_YEAR}`);
    const applicationNo = `ABES-${SESSION_YEAR}-${String(sequence).padStart(4, '0')}`;

    const timeline = [
      {
        status: 'Submitted',
        message: 'Application submitted online.',
        changedBy: demo.name,
        date: daysAgo(12),
      },
    ];
    if (demo.status !== 'Submitted') {
      timeline.push({
        status: demo.status,
        message: demo.remarks || `Application marked as ${demo.status}.`,
        changedBy: 'Admission Cell',
        date: daysAgo(4),
      });
    }

    await Application.create({
      applicationNo,
      applicant: student._id,
      course: course._id,
      session: SESSION,
      personal: demo.personal,
      academics: demo.academics,
      documents: [],
      status: demo.status,
      remarks: demo.remarks,
      timeline,
    });
  }
  console.log('Sample students and applications ready: student@example.com / Student@123');

  // Give older applications the review fields added with the reviewer feature.
  await Application.updateMany(
    { review: { $exists: false } },
    {
      $set: {
        review: {
          checklist: {
            personalDetails: false,
            academicDetails: false,
            documents: false,
            eligibility: false,
          },
          notes: '',
          reviewedBy: '',
          reviewedAt: null,
        },
      },
    }
  );

  // Make sure the counter is never behind existing application numbers.
  const existingApplications = await Application.find({
    applicationNo: new RegExp(`^ABES-${SESSION_YEAR}-`),
  }).select('applicationNo');
  const highest = existingApplications.reduce((max, application) => {
    const value = Number.parseInt(String(application.applicationNo).split('-').pop(), 10);
    return Number.isFinite(value) && value > max ? value : max;
  }, 0);
  if (highest > 0) {
    await Counter.findByIdAndUpdate(
      `application-${SESSION_YEAR}`,
      { $max: { seq: highest } },
      { upsert: true }
    );
  }

  const counts = {
    programmes: await Course.countDocuments(),
    notices: await Notice.countDocuments(),
    students: await User.countDocuments({ role: 'student' }),
    reviewers: await User.countDocuments({ role: 'reviewer' }),
    applications: await Application.countDocuments(),
  };
  console.log('Seed complete:', counts);
  console.log('Staff login: admin@abes.ac.in / Admin@123');
  console.log('Reviewer login: reviewer@abes.ac.in / Reviewer@123');
  console.log('Student login: student@example.com / Student@123');
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
