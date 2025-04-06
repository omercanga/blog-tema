# Ömer ÇANGA

## Blog Projesi - Sanal PC

Bu proje, modern bir blog platformu geliştirme sürecini içermektedir. React ve Node.js kullanılarak geliştirilen bu blog platformu, Medium benzeri bir kullanıcı deneyimi sunmaktadır.

### Proje Özellikleri

- **Modern UI/UX**: Material-UI kullanılarak geliştirilmiş, responsive tasarım
- **Zengin İçerik Editörü**: React-Quill entegrasyonu ile gelişmiş içerik düzenleme
- **Markdown Desteği**: ReactMarkdown ile içerik görüntüleme
- **Admin Paneli**: Blog yazılarını yönetmek için kapsamlı admin arayüzü
- **Etiket Sistemi**: Blog yazılarını kategorize etmek için etiket sistemi
- **Önizleme Özelliği**: Yazıları yayınlamadan önce önizleme imkanı

### Teknik Detaylar

#### Frontend (React)

- **React Router**: Sayfa yönlendirmeleri için
- **Material-UI**: UI bileşenleri için
- **React-Quill**: Zengin metin editörü için
- **ReactMarkdown**: Markdown içeriği görüntülemek için
- **Axios**: API istekleri için
- **Date-fns**: Tarih formatlaması için

#### Backend (Node.js)

- **Express.js**: Web sunucusu için
- **MongoDB**: Veritabanı için
- **JWT**: Kimlik doğrulama için
- **Multer**: Dosya yüklemeleri için

### Geliştirme Sürecinde Karşılaşılan Zorluklar ve Çözümleri

1. **React-Quill ve ReactMarkdown Uyumsuzluğu**:
   - Sorun: React-Quill'in ürettiği HTML formatı ile ReactMarkdown'ın beklediği format arasında uyumsuzluk
   - Çözüm: HTML içeriğini doğrudan göstermek için dangerouslySetInnerHTML kullanıldı

2. **API Endpoint Sorunları**:
   - Sorun: Blog güncelleme işleminde 404 hatası
   - Çözüm: API endpoint URL'leri düzeltildi (/api/admin/blog/ → /api/blog/)

3. **DOMNodeInserted Hatası**:
   - Sorun: React-Quill'in eski bir DOM olayını kullanması
   - Çözüm: clipboard.matchVisual: false ayarı eklendi

### Proje Yapısı

```
sanal-pc/
├── client/                 # Frontend (React)
│   ├── public/             # Statik dosyalar
│   └── src/                # Kaynak kodlar
│       ├── components/     # Yeniden kullanılabilir bileşenler
│       ├── pages/          # Sayfa bileşenleri
│       ├── context/        # Context API
│       ├── hooks/          # Custom hooks
│       └── utils/          # Yardımcı fonksiyonlar
└── server/                 # Backend (Node.js)
    ├── controllers/        # İş mantığı
    ├── models/             # Veritabanı modelleri
    ├── routes/             # API rotaları
    ├── middleware/         # Ara yazılımlar
    └── utils/              # Yardımcı fonksiyonlar
```

### Kurulum ve Çalıştırma

1. Projeyi klonlayın:
   ```bash
   git clone https://github.com/omercanga/sanal-pc.git
   cd sanal-pc
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   # Backend için
   cd server
   npm install

   # Frontend için
   cd ../client
   npm install
   ```

3. Uygulamayı çalıştırın:
   ```bash
   # Backend için
   cd server
   npm start

   # Frontend için
   cd ../client
   npm start
   ```

### Gelecek Planları

- [ ] Yorum sistemi eklemek
- [ ] Sosyal medya paylaşım butonları
- [ ] SEO optimizasyonu
- [ ] Çoklu dil desteği
- [ ] İstatistik paneli

### Katkıda Bulunma

Projeye katkıda bulunmak isterseniz, lütfen bir pull request gönderin. Büyük değişiklikler için, önce bir issue açarak neyi değiştirmek istediğinizi tartışalım.

### Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.

---

## İletişim

- GitHub: [@omercanga](https://github.com/omercanga)
- LinkedIn: [Ömer ÇANGA](https://www.linkedin.com/in/omercanga/)
- Twitter: [@omercanga](https://twitter.com/omercanga) 