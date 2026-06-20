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
const createSale = async (req, res) => {
    try{
        const { buyerName, metalType, quantity, price } = req.body

        // Managers or Admins only
        if (req.user.role === 'Worker') {
            return res.status(403).json({ success: false, message: 'Forbidden: Workers cannot process sales transactions' });
        }

        if (!buyerName || !metalType || !quantity || !price) {
            return res.status(400).json({ success: false, message: 'Please provide buyerName, metalType, quantity, and price' });
        }

        // 1. Check stock availability in inventory
        const inventory = await Inventory.findOne({ metalType });
        if (!inventory || inventory.quantity < parseFloat(quantity)) {
            const currentStock = inventory ? inventory.quantity : 0;
            return res.status(400).json({
                success: false,
                message: `Insufficient Stock: Cannot sell ${quantity}kg of ${metalType}. Current stock is only ${currentStock}kg.`
            });
        }

        // 2. Process sale transaction
        const sale = await Sale.create({
            buyerName,
            metalType,
            quantity: parseFloat(quantity),
            price: parseFloat(price),
            soldBy: req.user._id
        });

        // 3. Deduct stock from inventory
        inventory.quantity -= parseFloat(quantity);
        inventory.updatedAt = new Date();
        await inventory.save();

        // 4. Return sale details populated with user who sold it
        const populatedSale = await Sale.findById(sale._id).populate('soldBy', 'name email');

        return res.status(201).json({ success: true, data: populatedSale });
    } catch (error) {
        console.error('Create Sale Error:', error.message);
        return res.status(500).json({ success: false, message: 'Server Error processing sales transaction' });
    }
}

module.exports = {
  getSales,
  createSale
};