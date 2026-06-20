const Sale = require('../models/Sale');
const Inventory = require('../models/Inventory');

/**
 * @desc    Get all sales transaction records
 * @route   GET /api/sales
 * @access  Private (Manager, Admin)
 */
const getSales = async (req, res) => {
    try{
        // Workers don't see financial transaction histories
        if (req.user.role === 'Worker') {
            return res.status(403).json({ success: false, message: 'Forbidden: Workers do not have access to sales histories' });
        }

        const sales = await Sale.find()
            .populate('soldBy', 'name email role')
            .sort({ createdAt: -1 })

        return res.json({ success: true, count: sales.length, data: sales })
    } catch (error){
        console.error('Get Sales Error:', error.message);
        return res.status(500).json({ success: false, message: 'Server Error fetching sales registry' });
    }
}

/**
 * @desc    Record a new sales transaction (verifies and deducts stock)
 * @route   POST /api/sales
 * @access  Private (Admin, Manager)
 */
