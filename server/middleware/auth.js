const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Token received');

    if (!token) {
      console.log('Token not found');
      return res.status(401).json({ message: 'Yetkilendirme başarısız' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified');

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('User not found for token');
      return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
    }

    if (!user.active) {
      console.log('Inactive user access attempt');
      return res.status(403).json({ message: 'Hesabınız devre dışı bırakılmış' });
    }

    console.log('User authenticated successfully');
    req.user = { id: user._id, role: user.role };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Geçersiz token' });
    } else if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token süresi dolmuş' });
    }
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

module.exports = auth; 