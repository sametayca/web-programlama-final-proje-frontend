# Web Programlama Final Projesi - Frontend

Akıllı Kampüs Yönetim Platformu için React tabanlı frontend uygulaması.

## 🎯 Proje Hakkında

Bu proje, modern bir üniversite kampüsü için geliştirilmiş kapsamlı yönetim sisteminin frontend uygulamasıdır. React 18, Vite ve Material-UI kullanılarak geliştirilmiştir.

## ✨ Özellikler

- ✅ Modern ve responsive UI/UX
- ✅ Kullanıcı kayıt ve giriş sayfaları
- ✅ E-posta doğrulama
- ✅ Şifre sıfırlama
- ✅ Profil yönetimi
- ✅ Profil fotoğrafı yükleme
- ✅ JWT tabanlı kimlik doğrulama
- ✅ Token yenileme
- ✅ Rol tabanlı route koruması
- ✅ Toast bildirimleri
- ✅ Form validasyonu

## 🛠️ Teknolojiler

- **Framework**: React 18
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Notifications**: React Toastify
- **Testing**: Jest + React Testing Library

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 18+
- npm veya yarn

### 1. Repository'yi Klonlayın

```bash
git clone https://github.com/KULLANICI_ADINIZ/web-programlama-final-proje-frontend.git
cd web-programlama-final-proje-frontend
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Ortam Değişkenlerini Yapılandırın

`.env` dosyası oluşturun:

```env
# Backend API URL
VITE_API_URL=http://localhost:3000/api
```

Production için:
```env
VITE_API_URL=https://your-backend-api.com/api
```

### 4. Development Sunucusunu Başlatın

```bash
npm run dev
```

Uygulama `http://localhost:3001` adresinde çalışacaktır.

### 5. Production Build

```bash
npm run build
```

Build dosyaları `dist/` klasörüne oluşturulacaktır.

### 6. Preview Production Build

```bash
npm run preview
```

## 🐳 Docker ile Çalıştırma

### Dockerfile ile

```bash
# Build
docker build -t frontend-app .

# Run
docker run -p 3001:3001 -e VITE_API_URL=http://localhost:3000/api frontend-app
```

### Docker Compose ile

`docker-compose.yml` dosyası oluşturun:

```yaml
version: '3.8'

services:
  frontend:
    build: .
    container_name: frontend-app
    environment:
      VITE_API_URL: http://localhost:3000/api
    ports:
      - "3001:3001"
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev
```

Çalıştırın:
```bash
docker-compose up -d
```

## 📁 Proje Yapısı

```
frontend/
├── src/
│   ├── pages/           # Sayfa bileşenleri
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Profile.jsx
│   │   └── ...
│   ├── components/      # Yeniden kullanılabilir bileşenler
│   │   ├── Layout.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/         # React Context'leri
│   │   └── AuthContext.jsx
│   ├── services/        # API servisleri
│   │   └── api.js
│   ├── tests/           # Test dosyaları
│   ├── App.jsx          # Ana uygulama bileşeni
│   ├── main.jsx         # Giriş noktası
│   └── theme.js         # MUI tema yapılandırması
├── public/              # Statik dosyalar
├── dist/                # Build çıktıları
├── Dockerfile
├── vite.config.js
└── package.json
```

## 🧪 Testler

```bash
# Tüm testleri çalıştır
npm test

# Test coverage ile
npm test -- --coverage

# Watch mode
npm run test:watch
```

## 🎨 Sayfalar

- **Login** (`/login`) - Kullanıcı giriş sayfası
- **Register** (`/register`) - Kullanıcı kayıt sayfası
- **Verify Email** (`/verify-email`) - E-posta doğrulama sayfası
- **Forgot Password** (`/forgot-password`) - Şifre sıfırlama talebi
- **Reset Password** (`/reset-password`) - Şifre sıfırlama
- **Dashboard** (`/dashboard`) - Ana dashboard (korumalı)
- **Profile** (`/profile`) - Kullanıcı profili (korumalı)

## 🔐 Kimlik Doğrulama

Uygulama JWT tabanlı kimlik doğrulama kullanır:

- Access token localStorage'da saklanır
- Refresh token cookie'de saklanır
- Token otomatik yenilenir
- Korumalı route'lar `ProtectedRoute` bileşeni ile korunur

## 📱 Responsive Design

Uygulama tüm cihazlarda (mobil, tablet, desktop) çalışacak şekilde tasarlanmıştır.

## 🎯 Özellikler

### Form Validasyonu
- React Hook Form ile form yönetimi
- Client-side validasyon
- Hata mesajları

### State Management
- React Context API ile global state yönetimi
- AuthContext ile kimlik doğrulama durumu

### API İletişimi
- Axios ile HTTP istekleri
- Interceptor'lar ile token yönetimi
- Hata yönetimi

## 🐛 Sorun Giderme

### API Bağlantı Hatası
- Backend API'nin çalıştığından emin olun
- `.env` dosyasındaki `VITE_API_URL` değerini kontrol edin
- CORS ayarlarını kontrol edin

### Port Çakışması
- Port 3001 kullanımdaysa, Vite otomatik olarak başka bir port seçecektir
- Veya `vite.config.js` dosyasında port ayarlayın

### Build Hataları
- `node_modules` klasörünü silin ve `npm install` çalıştırın
- Cache'i temizleyin: `npm run build -- --force`

## 📝 Environment Variables

- `VITE_API_URL`: Backend API'nin base URL'i (zorunlu)

## 🔗 Backend API

Bu frontend uygulaması, backend API ile iletişim kurar. Backend repo'su: [web-programlama-final-proje-backend](https://github.com/KULLANICI_ADINIZ/web-programlama-final-proje-backend)

## 📞 İletişim

Sorularınız için GitHub Issues kullanabilirsiniz.

## 📄 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

---

**Not**: Bu frontend uygulaması, backend API ile birlikte çalışmak üzere tasarlanmıştır. Backend'in çalıştığından emin olun.

