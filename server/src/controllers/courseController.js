const Course = require('../models/Course');
const Application = require('../models/Application');

function coursePayload(body) {
  return {
    code: String(body.code || '').trim().toUpperCase(),
    name: String(body.name || '').trim(),
    degree: String(body.degree || '').trim(),
    duration: String(body.duration || '4 years').trim(),
    seats: Number(body.seats),
    feePerYear: Number(body.feePerYear),
    eligibility: String(body.eligibility || '').trim(),
    description: String(body.description || '').trim(),
    isActive: body.isActive === undefined ? true : body.isActive === true || body.isActive === 'true',
  };
}

function validatePayload(payload) {
  if (!payload.code) return 'Course code is required.';
  if (!payload.name) return 'Course name is required.';
  if (!payload.degree) return 'Degree type is required.';
  if (!Number.isFinite(payload.seats) || payload.seats < 0) {
    return 'Enter a valid number of seats.';
  }
  if (!Number.isFinite(payload.feePerYear) || payload.feePerYear < 0) {
    return 'Enter a valid annual fee.';
  }
  return null;
}

async function listCourses(req, res, next) {
  try {
    const showAll = req.query.all === 'true';
    const filter = showAll ? {} : { isActive: true };
    const courses = await Course.find(filter).sort({ degree: 1, name: 1 });
    return res.json({ count: courses.length, courses });
  } catch (error) {
    return next(error);
  }
}

async function getCourse(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Programme not found.' });
    return res.json(course);
  } catch (error) {
    return next(error);
  }
}

async function createCourse(req, res, next) {
  try {
    const payload = coursePayload(req.body);
    const problem = validatePayload(payload);
    if (problem) return res.status(400).json({ message: problem });

    const course = await Course.create(payload);
    return res.status(201).json({ message: 'Programme added successfully.', course });
  } catch (error) {
    return next(error);
  }
}

async function updateCourse(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Programme not found.' });

    const payload = coursePayload(req.body);
    const problem = validatePayload(payload);
    if (problem) return res.status(400).json({ message: problem });
    if (req.body.isActive === undefined) payload.isActive = course.isActive;

    Object.assign(course, payload);
    await course.save();

    return res.json({ message: 'Programme updated successfully.', course });
  } catch (error) {
    return next(error);
  }
}

async function deleteCourse(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Programme not found.' });

    const applicationCount = await Application.countDocuments({ course: course._id });
    if (applicationCount > 0) {
      return res.status(400).json({
        message: `This programme has ${applicationCount} application(s). Mark it inactive instead of deleting it.`,
      });
    }

    await course.deleteOne();
    return res.json({ message: 'Programme removed successfully.' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listCourses, getCourse, createCourse, updateCourse, deleteCourse };
