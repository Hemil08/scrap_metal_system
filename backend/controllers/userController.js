const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private (Admin Only)
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error('Get Users Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error fetching user directory' });
  }
};

/**
 * @desc    Create a new user (Admin portal)
 * @route   POST /api/users
 * @access  Private (Admin Only)
 */
const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already registered with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    const returnedUser = await User.findById(user._id).select('-password');
    return res.status(201).json({ success: true, data: returnedUser });
  } catch (error) {
    console.error('Create User Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error creating user record' });
  }
};

/**
 * @desc    Update a user role/details (Admin portal)
 * @route   PUT /api/users/:id
 * @access  Private (Admin Only)
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update details
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    // Optional: Update password if provided
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();
    const returnedUser = await User.findById(updatedUser._id).select('-password');
    
    return res.json({ success: true, data: returnedUser });
  } catch (error) {
    console.error('Update User Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error updating user record' });
  }
};

/**
 * @desc    Delete a user (Admin portal)
 * @route   DELETE /api/users/:id
 * @access  Private (Admin Only)
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent Admin from deleting themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Operation Denied: You cannot delete your own administrative account' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.findByIdAndDelete(id);
    return res.json({ success: true, message: 'User account removed from database successfully' });
  } catch (error) {
    console.error('Delete User Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error deleting user record' });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser
};
