// SupanshaDev Backend/controllers/roleController.js
const Role = require('../models/Role');

// Create a new role
exports.createRole = async (req, res) => {
  try {
    const { name, permissions, description } = req.body;
    const role = new Role({ name, permissions, description });
    await role.save();
    res.status(201).json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update a role
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissions, description } = req.body;
    const role = await Role.findByIdAndUpdate(
      id, 
      { name, permissions, description }, 
      { new: true }
    );
    if (!role) {
      return res.status(404).json({ success: false, error: 'Role not found' });
    }
    res.json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete a role
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByIdAndDelete(id);
    if (!role) {
      return res.status(404).json({ success: false, error: 'Role not found' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get a role by ID
exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ success: false, error: 'Role not found' });
    }
    res.json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });  
  }
};

// Get a role by name
exports.getRoleByName = async (req, res) => {
  try {
    const { name } = req.params;
    const role = await Role.findOne({ name });
    if (!role) {
      return res.status(404).json({ success: false, error: 'Role not found' });
    }
    res.json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all permissions by role name
exports.getAllPermissionsByRoleName = async (req, res) => {
  try {
    const { name } = req.params;
    const role = await Role.findOne({ name });
    if (!role) {
      return res.status(404).json({ success: false, error: 'Role not found' });
    }
    res.json({ success: true, data: role.permissions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


