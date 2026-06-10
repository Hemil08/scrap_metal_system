const jwt = require('jsonwebtoken')
const User = require('../models/User');

// Helper function to generate JWT
const generateToken = (user) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d' // Token valid for 30 days
  });
}

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try{
        // Basic validation
        if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'Worker' // Default to worker if role unspecified
        });

        if(user){
            return res.status(201).json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id)
                }
            })
        } else {
            return res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error){
        console.error('Register Controller Error:', error.message);
        return res.status(500).json({ success: false, message: 'Server Error during registration' })
    }
};

/**
 * @desc    Authenticate a user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try{

        // Validation
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        // Find user
        const user = await User.findOne({ email })
        if (!user){
            return res.status(401).json({ success: false, message: 'Invalid credentials - email not registered' });
        }

        // Match password
        const isMatch = await user.matchPassword(password);
        if(!isMatch){
            return res.status(401).json({success: false, message: 'Invalid credentials - password incorrect'})
        }

        return res.json({
            success: true,
            data:{
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            }
        });
    } catch (error){
        console.error('Login Controller Error:', error.message);
        return res.status(500).json({ success: false, message: 'Server Error during login' })
    }
}

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */

const getUserProfile = async (req, res) => {
    try{
        // req.user is set by authMiddleware
        const user = await User.findById(req.user._id).select('-password');
        if(user){
            return res.json({
                success: true,
                data: user
            })
        } else {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error){
        console.error('Get Profile Controller Error:', error.message);
        return res.status(500).json({ success: false, message: 'Server Error fetching user profile' })
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile
}