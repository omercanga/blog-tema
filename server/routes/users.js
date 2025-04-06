const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Tüm kullanıcıları getir (sadece admin)
router.get('/', auth, async (req, res) => {
  try {
    console.log('GET /users - User:', req.user);
    
    // Sadece admin kullanıcılar tüm kullanıcıları görebilir
    if (req.user.role !== 'admin') {
      console.log('Yetkisiz erişim denemesi - Role:', req.user.role);
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Kullanıcılar getirilirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni kullanıcı oluştur (sadece admin)
router.post('/', auth, async (req, res) => {
  try {
    console.log('POST /users - User:', req.user);
    console.log('Request body:', req.body);
    
    // Sadece admin kullanıcılar yeni kullanıcı ekleyebilir
    if (req.user.role !== 'admin') {
      console.log('Yetkisiz kullanıcı ekleme denemesi - Role:', req.user.role);
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    const { name, email, password, role } = req.body;

    // E-posta kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('E-posta zaten kullanımda:', email);
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
    }

    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Yeni kullanıcı oluştur
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    await user.save();
    console.log('Yeni kullanıcı oluşturuldu:', user);

    // Şifreyi çıkararak kullanıcı bilgilerini döndür
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Kullanıcı oluşturulurken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcı sil (sadece admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Sadece admin kullanıcılar silme işlemi yapabilir
    if (req.user.role !== 'admin') {
      console.log('Yetkisiz kullanıcı silme denemesi:', req.user.id);
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      console.log('Silinecek kullanıcı bulunamadı:', req.params.id);
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Admin kullanıcıları silinemez
    if (user.role === 'admin') {
      console.log('Admin kullanıcı silme denemesi:', user.email);
      return res.status(400).json({ message: 'Admin kullanıcılar silinemez' });
    }

    // Aktif kullanıcılar silinemez
    if (user.active) {
      console.log('Aktif kullanıcı silme denemesi:', user.email);
      return res.status(400).json({ message: 'Aktif kullanıcılar silinemez. Önce kullanıcıyı pasifleştirin.' });
    }

    await user.deleteOne();
    console.log('Kullanıcı başarıyla silindi:', user.email);
    res.json({ message: 'Kullanıcı başarıyla silindi' });
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Şifre değiştir
router.put('/password', auth, async (req, res) => {
  try {
    console.log('PUT /users/password - User:', req.user);
    
    const { currentPassword, newPassword } = req.body;

    // Kullanıcıyı bul
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('Şifre değiştirilecek kullanıcı bulunamadı:', req.user.id);
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Mevcut şifreyi kontrol et
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.log('Yanlış mevcut şifre');
      return res.status(400).json({ message: 'Mevcut şifre yanlış' });
    }

    // Yeni şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Şifreyi güncelle
    user.password = hashedPassword;
    await user.save();
    console.log('Şifre güncellendi:', req.user.id);

    res.json({ message: 'Şifre başarıyla güncellendi' });
  } catch (error) {
    console.error('Şifre güncellenirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcı rolünü değiştir (sadece admin)
router.put('/:id/role', auth, async (req, res) => {
  try {
    console.log('PUT /users/:id/role - User:', req.user);
    
    // Sadece admin kullanıcılar rol değiştirebilir
    if (req.user.role !== 'admin') {
      console.log('Yetkisiz rol değiştirme denemesi - Role:', req.user.role);
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      console.log('Rol değiştirilecek kullanıcı bulunamadı:', req.params.id);
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Geçersiz rol' });
    }

    user.role = role;
    await user.save();
    console.log('Kullanıcı rolü değiştirildi:', req.params.id, 'Yeni rol:', role);
    res.json({ message: 'Kullanıcı rolü başarıyla değiştirildi' });
  } catch (error) {
    console.error('Rol değiştirirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcıyı devre dışı bırak/etkinleştir (sadece admin)
router.put('/:id/active', auth, async (req, res) => {
  try {
    console.log('PUT /users/:id/active - User:', req.user);
    
    // Sadece admin kullanıcılar kullanıcıyı devre dışı bırakabilir
    if (req.user.role !== 'admin') {
      console.log('Yetkisiz kullanıcı devre dışı bırakma denemesi - Role:', req.user.role);
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      console.log('Devre dışı bırakılacak kullanıcı bulunamadı:', req.params.id);
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const { active } = req.body;
    user.active = active;
    await user.save();
    console.log('Kullanıcı durumu değiştirildi:', req.params.id, 'Yeni durum:', active);
    res.json({ message: active ? 'Kullanıcı etkinleştirildi' : 'Kullanıcı devre dışı bırakıldı' });
  } catch (error) {
    console.error('Kullanıcı durumu değiştirilirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router; 