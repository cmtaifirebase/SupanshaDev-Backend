const express = require("express");
const { 
  getProjects, 
  createProject, 
  updateProject, 
  deleteProject 
} = require("../controllers/projectController");
const { authenticate, requireModulePermission } = require("../middlewares/authMiddleware");

const router = express.Router();

// Protected routes
router.use(authenticate);

// Get all projects
router.get("/", requireModulePermission("projects", "read"), getProjects);

// Create new project
router.post("/", requireModulePermission("projects", "create"), createProject);

// Update project
router.put("/:id", requireModulePermission("projects", "update"), updateProject);

// Delete project
router.delete("/:id", requireModulePermission("projects", "delete"), deleteProject);

module.exports = router; 