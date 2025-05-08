const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const Role = require('../models/Role');

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  accountType: z.enum(['individual', 'organization']).default('individual'),
  role: z.enum([
    'user'
  ]).default('user'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const updateUserSchema = z.object({
  role: z.enum([
    'user',
    'admin',
    'country-admin',
    'state-admin',
    'regional-admin',
    'district-admin',
    'block-admin',
    'area-admin'
  ]).optional(),

  designation: z.enum([
    'board-of-director',
    'executive-director',
    'operations-director',
    'chartered-accountant',
    'auditor',
    'technical-consultant',
    'advisor',
    'country-officer',
    'senior-program-manager',
    'senior-manager',
    'senior-officer',
    'manager',
    'officer',
    'associate',
    'executive',
    'intern',
    'web-developer',
    'assistant',
    'data-entry-operator',
    'receptionist',
    'event-organizer',
    'development-doer',
    'office-attendant',
    'driver',
    'guard',
    'vendor',
    'daily-service-provider',
    'state-program-manager',
    'state-coordinator',
    'state-officer',
    'regional-program-manager',
    'regional-coordinator',
    'regional-officer',
    'district-program-manager',
    'district-coordinator',
    'district-executive',
    'counsellor',
    'cluster-coordinator',
    'volunteer',
    'field-coordinator'
  ]).optional(),

  level: z.number().min(1).max(12).optional(),

  geo: z.object({
    country: z.string(),
    state: z.string().optional(),
    region: z.string().optional(),
    district: z.string().optional(),
    block: z.string().optional(),
    area: z.string().optional(),
  }).optional(),

  assignedRegions: z.array(z.string()).optional()
});

// Cookie configuration
const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    // ✅ Validate request body
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.errors
      });
    }

    const { name, email, password, accountType } = result.data;

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create new user with default role
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      accountType

    });

    await user.save();

    // ✅ Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    })

    // remove password from user
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    // find role by name and append permissions to user
    const role = await Role.findOne({ name: user.role });
    userWithoutPassword.permissions = role.permissions;

    // ✅ Set cookie and respond
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }).status(201).json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};
// Login user
exports.loginUser = async (req, res) => {
  try {
    // Validate request body
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.errors
      });
    }

    const { email, password } = result.data;
    console.log(email, password)
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {

      console.log(user)
      console.log("user not found")
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(isMatch)
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // Set cookie and respond
    // send user without password
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    // find role by name and append permissions to user
    const role = await Role.findOne({ name: user.role });
    userWithoutPassword.permissions = role.permissions;
    res.cookie('token', token, cookieOptions)
       .status(200)
       .json({
         success: true,
         user: userWithoutPassword
       });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get current user details
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // send user without password
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    // find role by name and append permissions to user
    const role = await Role.findOne({ name: user.role });
    userWithoutPassword.permissions = role.permissions;
    res.status(200).json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: error.message
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { accountType } = req.query; // ?accountType=individual or organization

    let query = {};
    if (accountType) {
      query.accountType = accountType;
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// Logout user
exports.logoutUser = (req, res) => {
  res.clearCookie('token', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  }).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Update user details
exports.updateUser = async (req, res) => {
  try {
    // Authorization - users can only update their own profile
    if (req.user?.id !== req.params.id && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // send user without password
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;  

    res.status(200).json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

exports.updateUserController = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate input
    const result = updateUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.errors,
      });
    }

    const updates = result.data;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update only allowed fields
    Object.assign(user, updates);
    await user.save();

    // send user without password
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Update user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
};