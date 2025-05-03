const express = require('express');
const {
  createDonation,
  getAllDonations,
  getSingleDonation,
  deleteDonation,
  getTotalDonation,
  getDonationByCause,
  updateDonation,
  getDonationOverview
} = require('../controllers/donationController');
const { authenticate, requireModulePermission } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protected routes
router.use(authenticate);

// Get all donations
router.get('/', requireModulePermission('donations', 'read'), getAllDonations);

// Create new donation
router.post('/', requireModulePermission('donations', 'create'), createDonation);

// Update donation
router.put('/:id', requireModulePermission('donations', 'update'), updateDonation);

// Delete donation
router.delete('/:id', requireModulePermission('donations', 'delete'), deleteDonation);

// Get total donations
router.get('/total', requireModulePermission('donations', 'read'), getTotalDonation);

// Get donation overview
router.get('/overview', requireModulePermission('donations', 'read'), getDonationOverview);

router.get('/cause', requireModulePermission('donations', 'read'), getDonationByCause);
router.get('/:id', requireModulePermission('donations', 'read'), getSingleDonation);

module.exports = router;
