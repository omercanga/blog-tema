const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');

// Tüm blog yazılarını getir (public)
router.get('/', async (req, res) => {
  try {
    const posts = await Blog.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Tek bir blog yazısını ID ile getir (protected)
router.get('/id/:id', auth, async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Blog yazısı bulunamadı' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Tek bir blog yazısını slug ile getir (public)
router.get('/:slug', async (req, res) => {
  try {
    const post = await Blog.findOne({ slug: req.params.slug });
    if (!post) {
      return res.status(404).json({ message: 'Blog yazısı bulunamadı' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni blog yazısı oluştur (protected)
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, excerpt, slug, featuredImage, tags } = req.body;
    
    // Eğer excerpt boşsa, içerikten oluştur
    const postExcerpt = excerpt || content.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
    
    const post = new Blog({
      title,
      content,
      excerpt: postExcerpt,
      slug,
      featuredImage,
      tags,
      status: 'published',
      publishedAt: new Date()
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Blog yazısı oluşturulurken bir hata oluştu' });
  }
});

// Blog yazısını güncelle (protected)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, excerpt, slug, featuredImage, tags } = req.body;
    
    // Eğer excerpt boşsa, içerikten oluştur
    const postExcerpt = excerpt || content.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
    
    const post = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        excerpt: postExcerpt,
        slug,
        featuredImage,
        tags,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: 'Blog yazısı bulunamadı' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Blog yazısı güncellenirken bir hata oluştu' });
  }
});

// Blog yazısını sil (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Blog.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Blog yazısı bulunamadı' });
    }
    res.json({ message: 'Blog yazısı başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Blog yazısı silinirken bir hata oluştu' });
  }
});

module.exports = router; 