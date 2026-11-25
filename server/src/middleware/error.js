const multer = require('multer');

function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  console.error(`[${req.method}] ${req.originalUrl} ->`, err.message);

  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: 'Each document must be 5 MB or smaller.',
      LIMIT_FILE_COUNT: 'You can upload up to 4 documents.',
      LIMIT_UNEXPECTED_FILE: 'Unexpected file field. Please upload the documents asked for.',
    };
    return res.status(400).json({ message: messages[err.code] || err.message });
  }

  if (err.message === 'Only JPG, PNG or PDF files are allowed.') {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === 'ValidationError') {
    const first = Object.values(err.errors)[0];
    return res.status(400).json({ message: first ? first.message : 'Please check the details you entered.' });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid value for ${err.path}.` });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || err.keyPattern || {})[0];
    const readable = field === 'email' ? 'An account with this email already exists.' : 'This record already exists.';
    return res.status(400).json({ message: readable });
  }

  return res
    .status(err.statusCode || 500)
    .json({ message: err.message || 'Something went wrong on the server.' });
}

module.exports = { notFound, errorHandler };
