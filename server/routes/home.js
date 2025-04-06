const express = require('express');
const router = express.Router();
const Home = require('../models/Home');
const auth = require('../middleware/auth');

// Ana sayfa içeriğini getir (public)
router.get('/', async (req, res) => {
  try {
    const content = await Home.findOne();
    if (!content) {
      // Varsayılan içerik oluştur
      const defaultContent = await Home.create({
        title: 'Ömer ÇANGA',
        subtitle: 'Full Stack Developer',
        about: 'Merhaba, ben Ömer ÇANGA. Full Stack Developer olarak çalışıyorum.',
        skills: 'JavaScript, React, Node.js, MongoDB, Express',
        experience: 'Yazılım geliştirme deneyimlerim...',
        education: 'Eğitim bilgilerim...',
        contact: 'İletişim bilgilerim...'
      });
      return res.json(defaultContent);
    }
    res.json(content);
  } catch (error) {
    console.error('Error fetching home content:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Ana sayfa içeriğini güncelle (protected)
router.put('/', auth, async (req, res) => {
  try {
    const content = await Home.findOne();
    if (!content) {
      return res.status(404).json({ message: 'Ana sayfa içeriği bulunamadı' });
    }

    const updatedContent = await Home.findByIdAndUpdate(
      content._id,
      req.body,
      { new: true }
    );

    res.json(updatedContent);
  } catch (error) {
    console.error('Error updating home content:', error);
    res.status(500).json({ message: 'Ana sayfa içeriği güncellenirken bir hata oluştu' });
  }
});

module.exports = router; 