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