const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Blog = require('./models/Blog');
require('dotenv').config();

// MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/sanal-pc')
  .then(() => {
    console.log('MongoDB bağlantısı başarılı');
    seedDatabase();
  })
  .catch(err => {
    console.error('MongoDB bağlantı hatası:', err);
    process.exit(1);
  });

async function seedDatabase() {
  try {
    // Mevcut verileri temizle
    await User.deleteMany({});
    await Blog.deleteMany({});
    console.log('Mevcut veriler temizlendi');

    // Admin kullanıcısı oluştur
    const hashedPassword = await bcrypt.hash('123456', 10);
    const adminUser = await User.create({
      name: 'Ömer ÇANGA',
      email: 'omercanga@gmail.com',
      password: hashedPassword,
      role: 'admin'  // Admin rolünü açıkça belirt
    });
    console.log('Admin kullanıcısı oluşturuldu:', adminUser);

    // Örnek blog yazıları oluştur
    const blogPosts = [
      {
        title: 'Hoş Geldiniz',
        content: 'Bu benim ilk blog yazım.',
        excerpt: 'İlk blog yazısı özeti',
        slug: 'hos-geldiniz',
        author: adminUser._id,
        status: 'published',
        tags: ['genel', 'tanıtım'],
        publishedAt: new Date()
      }
    ];

    await Blog.insertMany(blogPosts);
    console.log('Örnek blog yazıları oluşturuldu');

    console.log('Veritabanı başarıyla dolduruldu');
    process.exit(0);
  } catch (error) {
    console.error('Veritabanı doldurulurken hata:', error);
    process.exit(1);
  }
} 