const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Healthcare', 'Education', 'Biodiversity', 'Research'],
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Review', 'Published'],
    default: 'Draft'
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  publishDate: {
    type: Date,
    default: null
  },
  estimatedReadTime: {
    type: String,
    default: null
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  metaDescription: {
    type: String,
    maxlength: 160
  },
  seoKeywords: {
    type: [String],
    validate: [arr => arr.length <= 10, '{PATH} exceeds the limit of 10']
  },
  tags: {
    type: [String],
    validate: [arr => arr.length <= 7, '{PATH} exceeds the limit of 7']
  },
  schemaTags: {
    type: Object // for storing JSON-LD structured data
  },
  audioRequired: {
    type: Boolean,
    default: false
  },
  videoUrl: {
    type: String,
    default: null
  },
  content: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
