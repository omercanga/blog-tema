const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Admin kullanıcısını oluştur (ilk kez çalıştırıldığında)
const createAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ email: 'omercanga@gmail.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      const adminUser = await User.create({
        name: 'Ömer ÇANGA',
        email: 'omercanga@gmail.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin kullanıcısı oluşturuldu:', adminUser);
    } else {
      // Admin kullanıcısının rolünü kontrol et ve gerekirse güncelle
      if (adminExists.role !== 'admin') {
        adminExists.role = 'admin';
        await adminExists.save();
        console.log('Admin kullanıcısının rolü güncellendi:', adminExists);
      } else {
        console.log('Admin kullanıcısı zaten mevcut:', adminExists);
      }
    }
  } catch (error) {
    console.error('Admin kullanıcısı oluşturulurken hata:', error);
  }
};

createAdminUser();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt received');

    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }

    if (!user.active) {
      console.log('Login failed: User account is inactive');
      return res.status(403).json({ message: 'Hesabınız devre dışı bırakılmış' });
    }

    // Şifre kontrolü
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login failed: Invalid password');
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Login successful for user:', user.email);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    console.log('Register attempt:', req.body);
    const { name, email, password } = req.body;

    // Kullanıcı zaten var mı kontrol et
    let user = await User.findOne({ email });
    if (user) {
      console.log('E-posta zaten kullanımda:', email);
      return res.status(400).json({ message: 'Bu email adresi zaten kullanımda' });
    }

    // Yeni kullanıcı oluştur
    user = new User({
      name,
      email,
      password,
      role: 'user' // Varsayılan olarak normal kullanıcı
    });

    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    console.log('Yeni kullanıcı oluşturuldu:', user);

    // JWT token oluştur
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    // Kullanıcı bilgilerini döndür (şifre hariç)
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ token, user: userResponse });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Şifre güncelleme route'u (sadece admin)
router.put('/update-password', auth, async (req, res) => {
  try {
    console.log('PUT /auth/update-password - User:', req.user);
    
    // Sadece admin kullanıcılar şifre güncelleyebilir
    if (req.user.role !== 'admin') {
      console.log('Yetkisiz şifre güncelleme denemesi - Role:', req.user.role);
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    const { email, newPassword } = req.body;
    console.log('Şifre güncelleme isteği:', email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('Şifresi güncellenecek kullanıcı bulunamadı:', email);
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Şifreyi güncelle
    user.password = newPassword;
    await user.save();
    console.log('Kullanıcı şifresi güncellendi:', email);
    res.json({ message: 'Kullanıcı şifresi başarıyla güncellendi' });
  } catch (error) {
    console.error('Şifre güncellenirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router; 