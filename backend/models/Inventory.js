const mongoose = require('mongoose')

const InventorySchema = new mongoose.Schema({
    metalType: {
        type: String,
        required: [true, 'Please specify the metal type'],
        unique: true,
        enum: ['Copper', 'Steel', 'Aluminium', 'Brass']
    },

    quantity: {
        type: Number,
        required: [true, 'Please provide the quantity in kg'],
        default: 0,
        min: [0, 'Quantity cannot be negative']
    },

    updatedAt:{
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model('Inventory', InventorySchema)