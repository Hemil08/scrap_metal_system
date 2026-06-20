const express = require('express')
const router = express.Router()
const { getSales, createSale } = require('../controllers/salesController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', protect, authorizeRoles('Admin', 'Manager'), getSales);
router.post('/', protect, authorizeRoles('Admin', 'Manager'), createSale);

module.exports = router;