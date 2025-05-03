const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 6 
  },

  // Add a field to choose between Member or Organization
  accountType: {
    type: String,
    required: true,
    enum: ['member', 'organization']
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

  permissions: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Set default permissions based on role
userSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('role')) {
    const defaultPermissions = {
      'admin': {
        'dashboard': { read: true, create: true, update: true, delete: true },
        'certificates': { read: true, create: true, update: true, delete: true },
        'reports': { read: true, create: true, update: true, delete: true },
        'formats': { read: true, create: true, update: true, delete: true },
        'events': { read: true, create: true, update: true, delete: true },
        'jobs': { read: true, create: true, update: true, delete: true },
        'blogs': { read: true, create: true, update: true, delete: true },
        'causes': { read: true, create: true, update: true, delete: true },
        'crowd-funding': { read: true, create: true, update: true, delete: true },
        'forum': { read: true, create: true, update: true, delete: true },
        'shop': { read: true, create: true, update: true, delete: true }
      },
      'country-admin': {
        'dashboard': { read: true, create: false, update: false, delete: false },
        'certificates': { read: true, create: true, update: true, delete: false },
        'reports': { read: true, create: true, update: true, delete: false },
        'formats': { read: true, create: false, update: false, delete: false },
        'events': { read: true, create: true, update: true, delete: false },
        'jobs': { read: true, create: true, update: true, delete: false },
        'blogs': { read: true, create: true, update: true, delete: false },
        'causes': { read: true, create: true, update: true, delete: false },
        'crowd-funding': { read: true, create: true, update: true, delete: false },
        'forum': { read: true, create: true, update: true, delete: false },
        'shop': { read: true, create: false, update: false, delete: false }
      },
      'state-admin': {
        'dashboard': { read: true, create: false, update: false, delete: false },
        'certificates': { read: true, create: true, update: true, delete: false },
        'reports': { read: true, create: true, update: true, delete: false },
        'formats': { read: true, create: false, update: false, delete: false },
        'events': { read: true, create: true, update: true, delete: false },
        'jobs': { read: true, create: true, update: true, delete: false },
        'blogs': { read: true, create: true, update: true, delete: false },
        'causes': { read: true, create: true, update: true, delete: false },
        'crowd-funding': { read: true, create: true, update: true, delete: false },
        'forum': { read: true, create: true, update: true, delete: false },
        'shop': { read: true, create: false, update: false, delete: false }
      },
      'user': {
        'dashboard': { read: true, create: false, update: false, delete: false },
        'certificates': { read: true, create: false, update: false, delete: false },
        'reports': { read: true, create: false, update: false, delete: false },
        'formats': { read: true, create: false, update: false, delete: false },
        'events': { read: true, create: false, update: false, delete: false },
        'jobs': { read: true, create: false, update: false, delete: false },
        'blogs': { read: true, create: false, update: false, delete: false },
        'causes': { read: true, create: false, update: false, delete: false },
        'crowd-funding': { read: true, create: false, update: false, delete: false },
        'forum': { read: true, create: true, update: true, delete: false },
        'shop': { read: true, create: false, update: false, delete: false }
      }
    };

    if (defaultPermissions[this.role]) {
      this.permissions = defaultPermissions[this.role];
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
