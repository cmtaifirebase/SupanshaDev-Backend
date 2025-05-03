const express = require('express');
const router = express.Router();
const {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog
} = require('../controllers/blogController');

const { authenticate, requireModulePermission } = require('../middlewares/authMiddleware');

// Protected routes
router.use(authenticate);

// Public
router.get('/', getAllBlogs);
router.get('/:slug', getSingleBlog);

// Admin/Contributor routes
router.post('/', requireModulePermission('blogs', 'create'), createBlog);
router.put('/:id', requireModulePermission('blogs', 'update'), updateBlog);
router.delete('/:id', requireModulePermission('blogs', 'delete'), deleteBlog);

module.exports = router;
