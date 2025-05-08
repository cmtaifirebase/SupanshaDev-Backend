const Cause = require('../models/Cause');
const { z } = require('zod');

// Validation schema for cause
const causeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image: z.string().url("Invalid image URL"),
  category: z.enum(['health', 'education', 'environment', 'other']),
  goal: z.number().positive("Goal must be a positive number"),
  raised: z.number().min(0, "Raised amount cannot be negative").optional(),
  isActive: z.boolean().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

// Create a new cause
exports.createCause = async (req, res) => {
  try {
    const result = causeSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        errors: result.error.errors 
      });
    }

    const cause = await Cause.create(result.data);
    res.status(201).json({
      success: true,
      cause
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A cause with this title already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create cause",
      error: err.message
    });
  }
};

// Get all causes
exports.getAllCauses = async (req, res) => {
  try {
    const causes = await Cause.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      causes
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch causes"
    });
  }
};

// Get active causes
exports.getActiveCauses = async (req, res) => {
  try {
    const causes = await Cause.find({ 
      isActive: true,
      endDate: { $gt: new Date() }
    }).sort({ startDate: 1 });
    
    res.status(200).json({
      success: true,
      causes
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch active causes"
    });
  }
};

// Get cause by slug
exports.getCauseBySlug = async (req, res) => {
  try {
    const cause = await Cause.findBySlug(req.params.slug);
    if (!cause) {
      return res.status(404).json({
        success: false,
        message: "Cause not found"
      });
    }
    res.status(200).json({
      success: true,
      cause
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch cause"
    });
  }
};

// Update cause
exports.updateCause = async (req, res) => {
  try {
    const result = causeSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.error.errors
      });
    }

    const cause = await Cause.findByIdAndUpdate(
      req.params.id,
      result.data,
      { new: true, runValidators: true }
    );

    if (!cause) {
      return res.status(404).json({
        success: false,
        message: "Cause not found"
      });
    }

    res.status(200).json({
      success: true,
      cause
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A cause with this title already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update cause",
      error: err.message
    });
  }
};

// Delete cause
exports.deleteCause = async (req, res) => {
  try {
    const cause = await Cause.findByIdAndDelete(req.params.id);
    if (!cause) {
      return res.status(404).json({
        success: false,
        message: "Cause not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Cause deleted successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete cause"
    });
  }
};

// Get causes by category
exports.getCausesByCategory = async (req, res) => {
  try {
    const causes = await Cause.find({ 
      category: req.params.category,
      isActive: true
    }).sort({ startDate: 1 });
    
    res.status(200).json({
      success: true,
      causes
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch causes by category"
    });
  }
};

// Update cause status
exports.updateCauseStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const cause = await Cause.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!cause) {
      return res.status(404).json({
        success: false,
        message: "Cause not found"
      });
    }

    res.status(200).json({
      success: true,
      cause
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update cause status"
    });
  }
}; 