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
                { supplier: { $regex: search, $options: 'i' } },
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

/**
 * @desc    Update a scrap record (with real-time stock sync)
 * @route   PUT /api/scrap/:id
 * @access  Private (Worker, Manager, Admin)
 */
const updateScrapRecord = async (req,res) => {
    try{
        const { id } = req.params
        const { metalType, weight, supplier, location, status } = req.body

        const record = await ScrapRecord.findById(id)

        if(!record){
            return res.status(404).json({ success: false, message: 'Scrap record not found' })
        }

        // Capture old states for inventory adjustments
        const oldStatus = record.status
        const oldWeight = record.weight
        const oldMetalType = record.metalType

        // Apply updates
        if (metalType) record.metalType = metalType
        if (weight) record.weight = parseFloat(weight)
        if (supplier) record.supplier = supplier
        if (location) record.location = location
        if (status) record.status = status

        // If another image was uploaded during edit (seldom, but supported)
        if (req.file){
            // Try to delete old image if it exists and is local
            if (record.image){
                const oldPath = path.join(__dirname, '..', record.image)
                if (fs.existsSync(oldPath)){
                    fs.unlinkSync(oldPath)
                }
            }

            record.image = `/uploads/${req.file.filename}`
            try{
                const aiResult = await classifyImage(req.file.path)
                record.predictedType = aiResult.metalType
                if (!metalType) record.metalType = aiResult.metalType
            } catch (err) {
                console.error('AI Classification failure on update:', err.message)
            }
        }

        const updatedRecord = await record.save()

        // Reconcile Inventory
        // Case 1: Status was NOT refined, and is STILL NOT refined. But maybe metalType or weight changed (No inventory impact).
        // Case 2: Status transitioned from non-Refined TO Refined. Add current weight to inventory.

        if(oldStatus !== 'Refined' && updatedRecord.status === 'Refined'){
            await adjustInventoryStock(updateScrapRecord.metalType, updatedRecord.weight)
        }

        // Case 3: Status transitioned from Refined TO non-Refined. Deduct old weight from inventory.
        else if (oldStatus === 'Refined' && updateScrapRecord.status !== 'Refined'){
            await adjustInventoryStock(oldMetalType, -oldWeight)
        }

        // Case 4: Status WAS Refined and IS STILL Refined.
        else if(oldStatus === 'Refined' && updatedRecord.status === 'Refined'){
            // If metal type changed
            if(oldMetalType !== updateScrapRecord.metalType){
                await adjustInventoryStock(oldMetalType, -oldWeight); // Deduct old type
                await adjustInventoryStock(updatedRecord.metalType, updatedRecord.weight); // Add new type
            }
            // If only weight changed
            else if (oldWeight !== updatedRecord.weight){
                const weightDiff = updatedRecord.weight - oldWeight;
                await adjustInventoryStock(updatedRecord.metalType, weightDiff)
            }
        }

        return res.json({ success: true, data: updatedRecord })
    } catch (error) {
        console.error('Updated Scrap Record Error:', error.message)
        return res.status(500).json({ success: false, message:'Server Error updating scrap record' })
    }
}

/**
 * @desc    Delete a scrap record (reconciles inventory if deleted record was refined)
 * @route   DELETE /api/scrap/:id
 * @access  Private (Admin, Manager)
 */
const deleteScrapRecord = async (req, res) => {
    try{
        const { id } = req.params

        // Managers or Admins only
        if (req.user.role === 'Worker') {
        return res.status(403).json({ success: false, message: 'Forbidden: Workers cannot delete scrap entries' });
        }

        const record = await ScrapRecord.findById(id)
        if (!record){
            return res.status(404).json({ success: false, message: 'Scrap record not found' })
        }

        // Delete uploaded image file from local uploads
        if (record.image) {
            const imgPath = path.join(__dirname, '..', record.image);
            if (fs.existsSync(imgPath)) {
                try {
                    fs.unlinkSync(imgPath);
                } catch (err) {
                    console.error('Failed to delete image file on disk:', err.message);
                }
            }
        }

        // If it was refined, deduct weight from inventory before deleting!
        if (record.status === 'Refined'){
            await adjustInventoryStock(record.metalType, -record.weight)
        }

        await ScrapRecord.findByIdAndDelete(id)

        return res.json({ success: true, message: 'Scrap record deleted and inventory updated successfully' })
    } catch (error){
        console.error('Delete Scrap Record Error:', error.message)
        return res.status(500).json({ success: false, message: 'Server Error deleting scrap record' })
    }
}

module.exports = {
    getScrapRecords,
    createScrapRecord,
    updateScrapRecord,
    deleteScrapRecord
}