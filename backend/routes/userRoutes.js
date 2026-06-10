const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController')
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Mount routes - All user administration actions require Admin privileges
router.use(protect);
router.use(authorizeRoles('Admin'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;