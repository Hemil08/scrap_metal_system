const mongoose = require('mongoose')

const ScrapRecordSchema = new mongoose.Schema({
    metalType:{
        type:String,
        required: [true, 'Please provide the metal type'],
        enum: ['Copper', 'Steel', 'Aluminium', 'Brass']
    },

    predictedType: {
        type: String,
        required: [true, 'Please provide the predicted metal type']
    },

    weight: {
        type: Number,
        required: [true, 'Please provide the scrap weight (kg)'],
        min: [0, 'Weight cannot be negative']
    },

    supplier:{
        type: String,
        required: [true, 'Please provide the supplier name'],
        trim: true,
    },

    location:{
        type: String,
        required: [true, 'Please provide the scrap location'],
        default: 'Bay 1'
    },

    status:{
        type: String,
        enum: ['Collected', 'Processing', 'Refined', 'Sold'],
        default: 'Collected'
    },

    image:{
        type: String,
        default: ''
    },

    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    createdAt:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ScrapRecord', ScrapRecordSchema)