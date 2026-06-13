const Inventory = require('../models/Inventory');

/**
 * @desc    Get all metal stock records
 * @route   GET /api/inventory
 * @access  Private
 */
const getInventory = async (req, res) => {
    try {
        const inventory = await Inventory.find().sort({ metalType: 1 })
        return res.json({ success: true, count: inventory.length, data: inventory })
    } catch (error){
        console.error('Get Inventory Error:', error.message);
        return res.status(500).json({ success: false, message: 'Server Error fetching inventory levels' })
    }
}

/**
 * @desc    Adjust stock quantity manually
 * @route   PUT /api/inventory/:id
 * @access  Private (Admin, Manager)
 */
const updateInventory = async (req, res) => {
    try{
        const { id } = req.params
        const { quantity } = req.body

        if (quantity === undefined || quantity === null || quantity < 0){
            return res.status(400).json({ success: false, message: 'Please provide a valid, non-negative quantity' })
        }

        // Admins or Managers only
        if (req.user.role === 'Worker') {
            return res.status(403).json({ success: false, message: 'Forbidden: Workers cannot adjust inventory levels' });
        }

        const inventory = await Inventory.findById(id)
        if(!inventory){
            return res.status(404).json({ success: false, message: 'Inventory record not found' })
        }

        inventory.quantity = parseFloat(quantity)
        inventory.updateAt = new Date()
        await inventory.save()

        return res.json({ success: true, data: inventory })
    } catch (error){
        console.error('Update Inventory Error:', error.message)
        return res.status(500).json({ success: false, message: 'Server Error updating inventory level' })
    }
}

module.exports = {
    getInventory,
    updateInventory
}