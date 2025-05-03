const express = require('express');
const { createContact, getAllContacts, getSingleContact, deleteContact } = require('../controllers/contactController');
const { authenticate, requireModulePermission } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protected routes
router.use(authenticate);

// Get all contacts
router.get('/', requireModulePermission('contacts', 'read'), getAllContacts);

// Create new contact
router.post('/', requireModulePermission('contacts', 'create'), createContact);

// Get single contact
router.get('/:id', requireModulePermission('contacts', 'read'), getSingleContact);

// Delete contact
router.delete('/:id', requireModulePermission('contacts', 'delete'), deleteContact);

module.exports = router;
