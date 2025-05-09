const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Role = require('./Role'); // Adjust the path if needed

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address'
    ]
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 6 
  },
  accountType: {
    type: String,
    required: true,
    enum: ['individual', 'organization']
  },
  role: { 
    type: String, 
    required: true,
    enum: [
      'admin',
      'country-admin',
      'state-admin',
      'regional-admin',
      'district-admin',
      'block-admin',
      'area-admin',
      'user'
    ],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  designation: {
    type: String,
    enum: [
      'board-of-director', 'executive-director', 'operations-director', 'chartered-accountant',
      'auditor', 'technical-consultant', 'advisor', 'country-officer', 'senior-program-manager',
      'senior-manager', 'senior-officer', 'manager', 'officer', 'associate', 'executive', 'intern',
      'web-developer', 'assistant', 'data-entry-operator', 'receptionist', 'event-organizer',
      'development-doer', 'office-attendant', 'driver', 'guard', 'vendor', 'daily-service-provider',
      'state-program-manager', 'state-coordinator', 'state-officer', 'regional-program-manager',
      'regional-coordinator', 'regional-officer', 'district-program-manager', 'district-coordinator',
      'district-executive', 'counsellor', 'cluster-coordinator', 'volunteer', 'field-coordinator'
    ],
    default: null
  },
  level: { 
    type: Number, 
    min: 1, 
    max: 12, 
    default: 1 
  },
  geo: {
    country: { type: String, default: null },
    state: { type: String, default: null },
    region: { type: String, default: null },
    district: { type: String, default: null },
    block: { type: String, default: null },
    area: { type: String, default: null }
  },
  assignedRegions: [{ type: String, default: [] }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Job/Organization/Individual job features
  jobPostsThisYear: { type: Number, default: 0 }, // For organizations
  isPaidMember: { type: Boolean, default: false }, // For organizations
  jobApplicationsThisYear: { type: Number, default: 0 }, // For individuals
  isUpgraded: { type: Boolean, default: false }, // For individuals
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Assign default permissions dynamically based on role
userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('role')) {
    try {
      const roleDoc = await Role.findOne({ name: this.role });
      if (roleDoc) {
        this.permissions = roleDoc.permissions;
      } else {
        this.permissions = {}; // fallback
      }
      next();
    } catch (err) {
      return next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('User', userSchema);
