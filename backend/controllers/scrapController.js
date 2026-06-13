const ScrapRecord = require('../models/ScrapRecord');
const Inventory = require('../models/Inventory');
const {classifyImage} = require('../services/aiService');
const fs = require('fs');
const path = require('path');

// Helper function to update inventory quantity
const adjustInventoryStock = async (metalType, weightAdjustment) => {
    try{
        const inventory = await Inventory.findOne({ metalType });
        if (inventory) {
            inventory.quantity = Math.max(0, inventory.quantity + weightAdjustment);
            inventory.updateAt = new Date()
            await inventory.save()
        } else if(weightAdjustment > 0){
            await Inventory.create({
                metalType,
                quantity: weightAdjustment,
                updatedAt: new Date()
            });
        }
    } catch (error){
        console.error(`--- [INVENTORY RECONCILIATION ERROR] Failed to adjust ${metalType} by ${weightAdjustment}kg:`, error.message);
    }
};

/**
 * @desc    Get all scrap records with filtering & search
 * @route   GET /api/scrap
 * @access  Private
 */
const getScrapRecords = async (req, res) => {
    try{
        const { search, metalType, status } = req.query

        // Construct query object
        let query = {};

        // 1. Role boundaries (Optional: If workers should only see their own entries, but in SMEs usually they share view access. We will allow shared reading for Managers/Workers, which is standard)
        if (metalType){
            query.metalType = metalType
        }

        if(status){
            query.status = status
        }

        if(search){
            // Search by supplier or location (case-insensitive)
            query.$or = [
                {supplier: { $regex: search, $options: 'i' }},
                { location: { $regex: search, $options: 'i' } }
            ]
        }

        const records = await ScrapRecord.find(query)
            .populate('createdBy', 'name email none')
            .sort({ createdAt: -1 })

        return res.json({ success: true, count: records.length, data: records })
    } catch(error){
        console.error('Get Scrap Records Error:', error.message)
        return res.status(500).json({ success: false, message: 'Server Error fetching scrap records' });
    }
};

/**
 * @desc    Create new scrap record (includes image upload and AI classification)
 * @route   POST /api/scrap
 * @access  Private (Worker, Manager, Admin)
 */
const createScrapRecord = async (req,res) => {
    try{
        const { metalType, weight, supplier, location, status } = req.body

        if(!weight || !supplier){
            return res.status(400).json({ success: false, message: 'Please provide weight and supplier' })
        }

        let finalMetalType= metalType || 'Steel';
        let predictedType = 'Not Classified'
        let imageRelativePath = '';

        // If an image was uploaded, trigger AI classification
        if(req.file){
            imageRelativePath = `/uploads/${req.file.filename}`;
            console.log(`--- [AI CONTROLLER] New image uploaded: ${req.file.filename}. Triggering AI prediction... ---`)

            try{
                const aiResult = await classifyImage(req.file.path)
                predictedType = aiResult.metalType

                // If the frontend didn't specify a metalType, we use the AI prediction!
                if (!metalType){
                    finalMetalType = aiResult.metalType
                }

                 console.log(`--- [AI CONTROLLER] Classification Result: ${aiResult.metalType} (Confidence: ${aiResult.confidence}%) ---`);
            } catch (aiError){
                console.error('AI Classification Failure during creation:', aiError.message)
                predictedType = 'Classification Failed'
            }
        }

        // Create the scrap record
        const record = await ScrapRecord.create({
            metalType: finalMetalType,
            predictedType: predictedType,
            weight: parseFloat(weight),
            supplier: supplier,
            location: location || 'Bay 1',
            status: status || 'Collected',
            image: imageRelativePath,
            createdBy: req.user._id
        })

        // If status is immediately marked as "Refined", add to warehouse inventory stock
        if (record.status === 'Refined'){
            await adjustInventoryStock(record.metalType, record.weight)
        }

        return res.status(201).json({ success: true, data: record })
    } catch (error) {
        console.error('Create Scrap Record Error:', error.message);
        return res.status(500).json({ success: false, message: 'Server Error creating scrap record' });
    }
}