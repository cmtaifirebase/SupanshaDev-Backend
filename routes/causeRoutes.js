const express = require('express');
const {
  createCause,
  getAllCauses,
  getActiveCauses,
  getCauseBySlug,
  updateCause,
  deleteCause,
  getCausesByCategory,
  updateCauseStatus
} = require('../controllers/causeController');
const { authenticate, requireModulePermission } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.get('/active', getActiveCauses);
router.get('/category/:category', getCausesByCategory);
router.get('/:slug', getCauseBySlug);

// Protected routes
router.use(authenticate);

// Admin routes
router.post('/', requireModulePermission('causes', 'create'), createCause);
router.get('/', requireModulePermission('causes', 'read'), getAllCauses);
router.put('/:id', requireModulePermission('causes', 'update'), updateCause);
router.delete('/:id', requireModulePermission('causes', 'delete'), deleteCause);
router.patch('/:id/status', requireModulePermission('causes', 'update'), updateCauseStatus);

module.exports = router; 