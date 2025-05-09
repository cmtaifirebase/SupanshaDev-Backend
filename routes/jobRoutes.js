const express = require('express');
const router = express.Router();
const { 
    createJob,
    createJobApplication,
    getAllJobApplications, 
    getSingleJobApplication, 
    updateJobApplication, 
    deleteJobApplication,
    getApplicantsForJob,
    updateApplicationStatus,
    getMyApplications
} = require('../controllers/jobController');
const { authenticate, requireModulePermission } = require('../middlewares/authMiddleware');

// Protected routes
router.use(authenticate);

// Organization routes
router.post('/post', requireModulePermission('jobs', 'create'), createJob);
router.get('/applicants/:jobId', requireModulePermission('jobs', 'read'), getApplicantsForJob);
router.patch('/application-status', requireModulePermission('jobs', 'update'), updateApplicationStatus);

// Individual routes
router.get('/my-applications', getMyApplications);

// Public
router.get('/', requireModulePermission('jobs', 'read'), getAllJobApplications);
router.get('/:id', getSingleJobApplication);

// Admin/Organizer routes
router.post('/', requireModulePermission('jobs', 'create'), createJobApplication);
router.put('/:id', requireModulePermission('jobs', 'update'), updateJobApplication);
router.delete('/:id', requireModulePermission('jobs', 'delete'), deleteJobApplication);

module.exports = router;