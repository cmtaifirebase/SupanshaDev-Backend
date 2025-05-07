const express = require('express');
const {
  createDonation,
  getAllDonations,
  getSingleDonation,
  deleteDonation,
  getTotalDonation,
  getDonationByCause,
  updateDonation,
  getDonationOverview,
  getUserDonations
} = require('../controllers/donationController');
const { authenticate, requireModulePermission } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/', createDonation);

// Protected routes
router.use(authenticate);

// User routes
router.get('/user/:userId', getUserDonations);

// Admin routes
router.get('/', requireModulePermission('donations', 'read'), getAllDonations);
router.put('/:id', requireModulePermission('donations', 'update'), updateDonation);
router.delete('/:id', requireModulePermission('donations', 'delete'), deleteDonation);
router.get('/total', requireModulePermission('donations', 'read'), getTotalDonation);
router.get('/overview', requireModulePermission('donations', 'read'), getDonationOverview);
router.get('/cause', requireModulePermission('donations', 'read'), getDonationByCause);
router.get('/:id', requireModulePermission('donations', 'read'), getSingleDonation);

module.exports = router;
