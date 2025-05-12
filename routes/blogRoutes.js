const express = require('express');
const router = express.Router();
const {
  createBlog,
  getAllBlogs,
  getAllPublishedBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog
} = require('../controllers/blogController');

const { authenticate, requireModulePermission } = require('../middlewares/authMiddleware');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Protected routes
// Public routes
router.get('/', getAllPublishedBlogs);




// Admin routes - must come before /:slug to avoid conflicts
router.get('/admin', authenticate, requireModulePermission('blogs', 'read'), getAllBlogs);
router.post('/', authenticate, requireModulePermission('blogs', 'create'), upload.single('image'), createBlog);
router.put('/:id', authenticate, requireModulePermission('blogs', 'update'), updateBlog);
router.delete('/:id', authenticate, requireModulePermission('blogs', 'delete'), deleteBlog);

// Public single blog route - must come after admin routes
router.get('/:slug', getSingleBlog);

module.exports = router;
