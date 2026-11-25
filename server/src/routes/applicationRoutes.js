const express = require('express');
const upload = require('../middleware/upload');
const { protect, adminOnly, staffOnly } = require('../middleware/auth');
const {
  createApplication,
  myApplications,
  listApplications,
  getApplication,
  reviewApplication,
  updateStatus,
  getStats,
  exportCsv,
} = require('../controllers/applicationController');

const router = express.Router();

const applicationUploads = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'marksheet10', maxCount: 1 },
  { name: 'marksheet12', maxCount: 1 },
  { name: 'idProof', maxCount: 1 },
]);

router.post('/', protect, applicationUploads, createApplication);
router.get('/my', protect, myApplications);
router.get('/stats', protect, staffOnly, getStats);
router.get('/export/csv', protect, staffOnly, exportCsv);
router.get('/', protect, staffOnly, listApplications);
router.get('/:id', protect, getApplication);
router.patch('/:id/review', protect, staffOnly, reviewApplication);
router.patch('/:id/status', protect, adminOnly, updateStatus);

module.exports = router;
