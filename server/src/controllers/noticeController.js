const Notice = require('../models/Notice');

const CATEGORIES = ['Admission', 'Examination', 'General'];

async function listNotices(req, res, next) {
  try {
    const showAll = req.query.all === 'true';
    const notices = await Notice.find(showAll ? {} : { isActive: true }).sort({ date: -1, createdAt: -1 });
    return res.json({ count: notices.length, notices });
  } catch (error) {
    return next(error);
  }
}

async function createNotice(req, res, next) {
  try {
    const title = String(req.body.title || '').trim();
    const body = String(req.body.body || '').trim();
    const category = String(req.body.category || 'Admission');

    if (!title) return res.status(400).json({ message: 'Notice title is required.' });
    if (!body) return res.status(400).json({ message: 'Notice details are required.' });
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Please select a valid notice category.' });
    }

    const notice = await Notice.create({
      title,
      body,
      category,
      date: req.body.date ? new Date(req.body.date) : new Date(),
    });

    return res.status(201).json({ message: 'Notice published.', notice });
  } catch (error) {
    return next(error);
  }
}

async function updateNotice(req, res, next) {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: 'Notice not found.' });

    if (req.body.title !== undefined) {
      const title = String(req.body.title).trim();
      if (!title) return res.status(400).json({ message: 'Notice title cannot be empty.' });
      notice.title = title;
    }
    if (req.body.body !== undefined) {
      const body = String(req.body.body).trim();
      if (!body) return res.status(400).json({ message: 'Notice details cannot be empty.' });
      notice.body = body;
    }
    if (req.body.category !== undefined) {
      if (!CATEGORIES.includes(req.body.category)) {
        return res.status(400).json({ message: 'Please select a valid notice category.' });
      }
      notice.category = req.body.category;
    }
    if (req.body.isActive !== undefined) {
      notice.isActive = req.body.isActive === true || req.body.isActive === 'true';
    }
    if (req.body.date) notice.date = new Date(req.body.date);

    await notice.save();
    return res.json({ message: 'Notice updated.', notice });
  } catch (error) {
    return next(error);
  }
}

async function deleteNotice(req, res, next) {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ message: 'Notice not found.' });
    return res.json({ message: 'Notice deleted.' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listNotices, createNotice, updateNotice, deleteNotice };
