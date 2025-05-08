const mongoose = require('mongoose');
const slugify = require('slugify');

const causeSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  slug: { 
    type: String, 
    unique: true, 
    lowercase: true 
  },
  description: { 
    type: String, 
    required: true, 
    trim: true 
  },
  image: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['health', 'education', 'environment', 'other']
  },
  goal: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  raised: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  startDate: { 
    type: Date, 
    default: Date.now 
  },
  endDate: { 
    type: Date 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for progress percentage
causeSchema.virtual('progress').get(function() {
  return Math.min(100, (this.raised / this.goal) * 100);
});

// Pre-save middleware to generate slug
causeSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }
  next();
});

causeSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update && update.title) {
    update.slug = slugify(update.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }
  next();
});

// Static method to find by slug
causeSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug });
};

const Cause = mongoose.model('Cause', causeSchema);

module.exports = Cause; 