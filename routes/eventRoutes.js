const express = require('express');
const router = express.Router();
const { 
    createEvent, 
    getAllEvents, 
    getEventById,
    getEventBySlug, 
    approveEvent, 
    updateEvent, 
    deleteEvent,
    getAllApprovedEvents
} = require('../controllers/eventController');
const { authenticate, requireModulePermission } = require('../middlewares/authMiddleware');

// Public routes (no authentication required)
router.get('/', getAllApprovedEvents);

// Protected routes

// Admin Routes - must come after public routes
router.get('/admin', authenticate, requireModulePermission('events', 'read'), getAllEvents);
router.get('/admin/:id', authenticate, requireModulePermission('events', 'read'), getEventById);
router.post('/', authenticate, requireModulePermission('events', 'create'), createEvent);
router.patch('/:id/approve', authenticate, requireModulePermission('events', 'update'), approveEvent);
router.put('/:id', authenticate, requireModulePermission('events', 'update'), updateEvent);
router.delete('/:id', authenticate, requireModulePermission('events', 'delete'), deleteEvent);

// Public Routes
router.get('/:slug', getEventBySlug);

module.exports = router;
