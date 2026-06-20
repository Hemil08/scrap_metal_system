const mongoose = require('mongoose')

const SaleSchema = new mongoose.Schema({
    buyerName:{
        type: String,
        required: [true, 'Please provide the buyer name'],
        trim: true
    },
    metalType:{
        type: String,
        required: [true, 'Please specify metal type sold'],
        enum: ['Copper', 'Steel', 'Aluminium', 'Brass']
    },
    quantity:{
        type: Number,
        required: [true, 'Please provide sales quantity (kg)'],
        min: [0.1, 'Sales quantity must be greater than zero']
    },
    price: {
        type: Number,
        required: [true, 'Please provide total sales price'],
        min: [0, 'Sales price cannot be negative']
    },
    soldBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Sale',SaleSchema)