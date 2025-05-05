const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const {authenticate, requireRole} = require('../middlewares/authMiddleware');
router.use(authenticate);

router.post('/', requireRole('admin'), roleController.createRole);
router.get('/', requireRole('admin'), roleController.getRoles);
router.put('/:id', requireRole('admin'), roleController.updateRole);
router.get('/:id', requireRole('admin'), roleController.getRoleById);
router.get('/:name', requireRole('admin'), roleController.getRoleByName);
router.get('/:name/permissions', requireRole('admin'), roleController.getAllPermissionsByRoleName);

router.delete('/:id', requireRole('admin'), roleController.deleteRole);


module.exports = router;
