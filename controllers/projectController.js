const Project = require('../models/Project');
const { z } = require('zod');

// Validation schemas
const createProjectSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  category: z.string(),
  location: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  budget: z.number().min(0),
  status: z.enum(['planning', 'active', 'completed', 'cancelled']).default('planning'),
  team: z.array(z.string()),
  objectives: z.array(z.string()),
  beneficiaries: z.number().min(0),
  progress: z.number().min(0).max(100).default(0)
});

const updateProjectSchema = createProjectSchema.partial();

// Get all projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new project
exports.createProject = async (req, res) => {
  try {
    const validatedData = createProjectSchema.parse(req.body);
    
    // Check if project with same title exists
    const existingProject = await Project.findOne({ title: validatedData.title });
    if (existingProject) {
      return res.status(400).json({ success: false, error: 'Project with this title already exists' });
    }

    const project = new Project(validatedData);
    await project.save();

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateProjectSchema.parse(req.body);

    const project = await Project.findByIdAndUpdate(
      id,
      validatedData,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}; 