const express = require('express');
const router = express.Router();
const {
  getScrapRecords,
  createScrapRecord,
  updateScrapRecord,
  deleteScrapRecord
} = require('../controllers/scrapController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Mount routes
router.get('/', protect, getScrapRecords);
router.post('/', protect, upload.single('image'), createScrapRecord);
router.put('/:id', protect, upload.single('image'), updateScrapRecord);
router.delete('/:id', protect, deleteScrapRecord);

module.exports = router;
