const express = require('express');
const router = express.Router();
const { 
    createEvent, 
    getAllEvents, 
    getEventById, 
    approveEvent, 
    updateEvent, 
    deleteEvent 
} = require('../controllers/eventController');
const { authenticate, requireModulePermission } = require('../middlewares/authMiddleware');

// Protected routes
router.use(authenticate);

// Public Routes
router.get('/', requireModulePermission('events', 'read'), getAllEvents);
router.get('/:id', requireModulePermission('events', 'read'), getEventById);

// Admin/Organizer Routes
router.post('/', requireModulePermission('events', 'create'), createEvent);
router.patch('/:id/approve', requireModulePermission('events', 'update'), approveEvent);
router.put('/:id', requireModulePermission('events', 'update'), updateEvent);
router.delete('/:id', requireModulePermission('events', 'delete'), deleteEvent);

module.exports = router;
