const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Blog = require('../models/Blog');

// Admin middleware - sadece admin kullanıcıların erişimine izin verir
const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }
    next();
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @route   GET api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private/Admin
router.get('/dashboard', [auth, isAdmin], async (req, res) => {
  try {
    const blogCount = await Blog.countDocuments();
    const recentPosts = await Blog.find().sort({ date: -1 }).limit(5);
    
    res.json({
      blogCount,
      recentPosts
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/blog/:id
// @desc    Get a blog post by ID
// @access  Private/Admin
router.get('/blog/:id', [auth, isAdmin], async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ msg: 'Blog post not found' });
    }
    res.json(blog);
  } catch (err) {
    console.error('Error fetching blog post:', err);
    res.status(500).json({ message: 'Blog yazısı getirilirken bir hata oluştu' });
  }
});

// @route   POST api/admin/blog
// @desc    Create a new blog post
// @access  Private/Admin
router.post('/blog', [auth, isAdmin], async (req, res) => {
  const { title, content, image, slug } = req.body;

  try {
    const newBlog = new Blog({
      title,
      content,
      image,
      slug,
      author: req.user.id
    });

    const blog = await newBlog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/admin/blog/:id
// @desc    Update a blog post
// @access  Private/Admin
router.put('/blog/:id', [auth, isAdmin], async (req, res) => {
  const { title, content, image, slug } = req.body;

  try {
    let blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ msg: 'Blog post not found' });
    }

    blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: { title, content, image, slug } },
      { new: true }
    );

    res.json(blog);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/blog/:id
// @desc    Delete a blog post
// @access  Private/Admin
router.delete('/blog/:id', [auth, isAdmin], async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ msg: 'Blog post not found' });
    }

    await Blog.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Blog post removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router; 