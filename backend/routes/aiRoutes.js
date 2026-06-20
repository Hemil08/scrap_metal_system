const express = require('express');
const router = express.Router();
const { predictImage } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/predict', protect, upload.single('image'), predictImage);

module.exports = router;