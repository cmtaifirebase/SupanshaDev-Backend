const express = require("express");
const { 
  getVolunteers, 
  createVolunteer, 
  updateVolunteerStatus, 
  updateVolunteer, 
  deleteVolunteer, 
  addVolunteerEvent, 
  updateVolunteerNotes 
} = require("../controllers/volunteerController");
const { authenticate, requireModulePermission } = require("../middlewares/authMiddleware");

const router = express.Router();

// Protected routes
// router.use(authenticate);

// Get all volunteers
router.get("/", requireModulePermission("volunteers", "read"), getVolunteers);

// Create new volunteer
router.post("/", requireModulePermission("volunteers", "create"), createVolunteer);

// Update volunteer status
router.patch("/:id/status", requireModulePermission("volunteers", "update"), updateVolunteerStatus);

// Update volunteer details
router.put("/:id", requireModulePermission("volunteers", "update"), updateVolunteer);

// Delete volunteer
router.delete("/:id", requireModulePermission("volunteers", "delete"), deleteVolunteer);

// Add volunteer event
router.post("/:id/events", requireModulePermission("volunteers", "update"), addVolunteerEvent);

// Update volunteer notes
router.patch("/:id/notes", requireModulePermission("volunteers", "update"), updateVolunteerNotes);

module.exports = router; 