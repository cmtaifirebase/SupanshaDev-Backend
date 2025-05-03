const express = require('express');
const router = express.Router();
const { 
    createJob, 
    getAllJobs, 
    getSingleJob, 
    updateJob, 
    deleteJob 
} = require('../controllers/jobController');
const { authenticate, requireModulePermission } = require('../middlewares/authMiddleware');

// Protected routes
router.use(authenticate);

// Public
router.get('/', requireModulePermission('jobs', 'read'), getAllJobs);
router.get('/:id', getSingleJob);

// Admin/Organizer routes
router.post('/', requireModulePermission('jobs', 'create'), createJob);
router.put('/:id', requireModulePermission('jobs', 'update'), updateJob);
router.delete('/:id', requireModulePermission('jobs', 'delete'), deleteJob);

module.exports = router;