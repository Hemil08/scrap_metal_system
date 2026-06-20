const { classifyImage } = require('../services/aiService');

/**
 * @desc    Submit an image for AI classification without saving a scrap entry
 * @route   POST /api/ai/predict
 * @access  Private
 */
const predictImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file for classification' });
    }

    console.log(`--- [AI CONTROLLER] Direct prediction triggered for file: ${req.file.filename} ---`);
    
    // Call our AI classification pipeline
    const aiResult = await classifyImage(req.file.path);
    
    return res.json({
      success: true,
      data: {
        predictedType: aiResult.metalType,
        confidence: aiResult.confidence,
        imageUrl: `/uploads/${req.file.filename}`,
        rawLabel: aiResult.rawLabel
      }
    });
  } catch (error) {
    console.error('AI Predict Controller Error:', error.message);
    return res.status(500).json({ success: false, message: `Classification failed: ${error.message}` });
  }
};

module.exports = {
  predictImage
};
