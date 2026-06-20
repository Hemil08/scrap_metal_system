const express = require('express')
const router = express.Router()
const { getInventory,updateInventory } = require('../controllers/inventoryController')
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', protect, getInventory)
router.put('/:id', protect, authorizeRoles('Admin', 'Manager'), updateInventory)

module.exports = router