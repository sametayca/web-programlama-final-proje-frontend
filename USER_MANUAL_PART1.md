# Kullanıcı Kılavuzu - Part 1

Bu kılavuz, Akıllı Kampüs Yönetim Platformu'nun temel özelliklerini kullanmak için adım adım talimatlar içermektedir.

---

## 📋 İçindekiler

1. [Sisteme Kayıt Olma](#1-sisteme-kayıt-olma)
2. [E-posta Doğrulama](#2-e-posta-doğrulama)
3. [Giriş Yapma](#3-giriş-yapma)
4. [Profil Görüntüleme ve Güncelleme](#4-profil-görüntüleme-ve-güncelleme)
5. [Profil Fotoğrafı Yükleme](#5-profil-fotoğrafı-yükleme)
6. [Şifre Sıfırlama](#6-şifre-sıfırlama)

---

## 1. Sisteme Kayıt Olma

### Adımlar:

1. **Kayıt Sayfasına Git**
   - Web tarayıcınızda uygulamayı açın
   - Ana sayfadan "Kayıt Ol" butonuna tıklayın
   - Veya `/register` adresine gidin

2. **Kişisel Bilgileri Doldur**
   - Adınızı girin
   - Soyadınızı girin
   - Telefon numaranızı girin (isteğe bağlı)

3. **Hesap Bilgilerini Doldur**
   - E-posta adresinizi girin (bu adres doğrulama için kullanılacak)
   - Şifrenizi girin (minimum 6 karakter)
   - Şifrenizi tekrar girin (doğrulama için)

4. **Rol ve Bölüm Seçimi**
   - Kullanıcı tipinizi seçin:
     - **Öğrenci:** Öğrenci hesabı oluşturur
     - **Öğretim Üyesi:** Öğretim üyesi hesabı oluşturur
   - Bölümünüzü seçin (dropdown menüden)
   - Öğrenci iseniz, kayıt yılınızı seçin
   - Öğretim üyesi iseniz, unvanınızı seçin

5. **Şartları Kabul Et**
   - Kullanım şartları ve gizlilik politikasını okuyun
   - "Şartları kabul ediyorum" checkbox'ını işaretleyin

6. **Kayıt Ol**
   - "Kayıt Ol" butonuna tıklayın
   - Başarılı kayıt sonrası, e-posta adresinize doğrulama e-postası gönderilecektir

### Ekran Görüntüsü Örnekleri:

```
┌─────────────────────────────────────────┐
│   Akıllı Kampüs Yönetim Platformu      │
│   KAYIT OL                              │
├─────────────────────────────────────────┤
│                                         │
│   Adınız: [________________]           │
│   Soyadınız: [________________]        │
│   Telefon: [________________]          │
│                                         │
│   E-posta: [________________]          │
│   Şifre: [________________]            │
│   Şifre Tekrar: [________________]     │
│                                         │
│   Kullanıcı Tipi: [Öğrenci ▼]         │
│   Bölüm: [Bölüm Seçiniz ▼]            │
│   Kayıt Yılı: [2024]                   │
│                                         │
│   ☐ Şartları kabul ediyorum            │
│                                         │
│   [        Kayıt Ol        ]           │
│                                         │
│   Zaten hesabınız var mı? Giriş Yap   │
└─────────────────────────────────────────┘
```

### Önemli Notlar:

- E-posta adresiniz sistemde benzersiz olmalıdır
- Şifreniz en az 6 karakter olmalıdır (gelecek güncellemede minimum 8 karakter, büyük harf ve rakam gerekecek)
- E-posta doğrulaması yapılmadan sisteme giriş yapılamaz

---

## 2. E-posta Doğrulama

### Adımlar:

1. **E-postanızı Kontrol Edin**
   - Kayıt işleminden sonra e-posta kutunuzu kontrol edin
   - "Akıllı Kampüs - E-posta Doğrulama" konulu e-postayı açın

2. **Doğrulama Linkine Tıklayın**
   - E-posta içindeki doğrulama linkine tıklayın
   - Bu link sizi otomatik olarak doğrulama sayfasına yönlendirecektir

3. **Doğrulama Sonucu**
   - Başarılı doğrulama sonrası yeşil bir onay mesajı görüntülenecektir
   - 3 saniye sonra otomatik olarak giriş sayfasına yönlendirileceksiniz

### Alternatif Yöntem:

Eğer link çalışmıyorsa:

1. `/verify-email` sayfasına gidin
2. E-postanızdaki doğrulama token'ını manuel olarak girin
3. "Doğrula" butonuna tıklayın

### Ekran Görüntüsü:

```
┌─────────────────────────────────────────┐
│   E-posta Doğrulama                     │
├─────────────────────────────────────────┤
│                                         │
│   ✅ E-posta başarıyla doğrulandı!     │
│                                         │
│   Giriş sayfasına yönlendiriliyorsunuz │
│   ...                                   │
│                                         │
└─────────────────────────────────────────┘
```

### Önemli Notlar:

- Doğrulama token'ı 24 saat içinde geçerlidir
- Token süresi dolmuşsa, yeni bir doğrulama e-postası talep edebilirsiniz
- E-posta gelmediyse spam klasörünüzü kontrol edin

---

## 3. Giriş Yapma

### Adımlar:

1. **Giriş Sayfasına Git**
   - Ana sayfadan "Giriş Yap" butonuna tıklayın
   - Veya `/login` adresine gidin

2. **Hesap Bilgilerinizi Girin**
   - E-posta adresinizi girin
   - Şifrenizi girin

3. **İsteğe Bağlı: Beni Hatırla**
   - "Beni hatırla" checkbox'ını işaretleyerek, tarayıcınızda oturum bilgilerinizi saklayabilirsiniz

4. **Giriş Yap**
   - "Giriş Yap" butonuna tıklayın
   - Başarılı giriş sonrası dashboard sayfasına yönlendirileceksiniz

5. **Şifremi Unuttum**
   - Şifrenizi unuttuysanız, "Şifremi Unuttum" linkine tıklayın
   - Şifre sıfırlama işlemi için [Şifre Sıfırlama](#6-şifre-sıfırlama) bölümüne bakın

### Ekran Görüntüsü:

```
┌─────────────────────────────────────────┐
│   Akıllı Kampüs Yönetim Platformu      │
│   GİRİŞ YAP                             │
├─────────────────────────────────────────┤
│                                         │
│   E-posta: [________________]          │
│   Şifre: [________________]            │
│                                         │
│   ☐ Beni hatırla                       │
│                                         │
│   [        Giriş Yap        ]          │
│                                         │
│   Şifremi Unuttum?                     │
│                                         │
│   Hesabınız yok mu? Kayıt Ol          │
└─────────────────────────────────────────┘
```

### Önemli Notlar:

- E-posta doğrulaması yapılmamış hesaplarla giriş yapılamaz
- Yanlış şifre veya e-posta girişinde hata mesajı gösterilir
- Oturum süresi 15 dakikadır, süre dolduğunda token yenilenir

---

## 4. Profil Görüntüleme ve Güncelleme

### Profil Görüntüleme:

1. **Dashboard'a Giriş**
   - Giriş yaptıktan sonra otomatik olarak dashboard sayfasına yönlendirilirsiniz

2. **Profil Sayfasına Git**
   - Sağ üst köşedeki kullanıcı menüsünden "Profil" seçeneğine tıklayın
   - Veya `/profile` adresine gidin

3. **Profil Bilgilerini Görüntüle**
   - Kişisel bilgileriniz
   - E-posta adresiniz
   - Rolünüz (Öğrenci/Öğretim Üyesi)
   - Bölüm bilgileriniz
   - Öğrenci iseniz: Öğrenci numaranız, GPA, burs durumu
   - Öğretim üyesi iseniz: Personel numaranız, unvanınız

### Profil Güncelleme:

1. **Düzenleme Moduna Geç**
   - Profil sayfasında "Düzenle" butonuna tıklayın

2. **Bilgileri Güncelle**
   - Adınızı güncelleyin
   - Soyadınızı güncelleyin
   - Telefon numaranızı güncelleyin

3. **Değişiklikleri Kaydet**
   - "Kaydet" butonuna tıklayın
   - Başarılı güncelleme sonrası yeşil bir onay mesajı görüntülenecektir

### Ekran Görüntüsü:

```
┌─────────────────────────────────────────┐
│   Profil                                │
├─────────────────────────────────────────┤
│   [Fotoğraf]                            │
│                                         │
│   Ad: [Ahmet]                           │
│   Soyad: [Yılmaz]                       │
│   E-posta: ahmet@example.com           │
│   Telefon: [+905551234567]             │
│                                         │
│   Rol: Öğrenci                          │
│   Bölüm: Bilgisayar Mühendisliği       │
│   Öğrenci No: BM240001                 │
│   GPA: 3.50                             │
│                                         │
│   [        Kaydet        ]              │
└─────────────────────────────────────────┘
```

### Önemli Notlar:

- E-posta adresi değiştirilemez
- Şifre değişikliği için ayrı bir bölüm kullanılır

---

## 5. Profil Fotoğrafı Yükleme

### Adımlar:

1. **Profil Sayfasına Git**
   - Dashboard'dan profil sayfasına gidin

2. **Fotoğraf Yükle**
   - Profil fotoğrafı alanında "Fotoğraf Yükle" butonuna tıklayın
   - Dosya seçici penceresi açılacaktır

3. **Dosya Seç**
   - Bilgisayarınızdan bir fotoğraf seçin
   - **Format:** JPG veya PNG
   - **Maksimum Boyut:** 5MB

4. **Yüklemeyi Tamamla**
   - Seçtiğiniz dosyayı yükleyin
   - Başarılı yükleme sonrası yeni fotoğrafınız profilde görünecektir

### Ekran Görüntüsü:

```
┌─────────────────────────────────────────┐
│   Profil Fotoğrafı                      │
├─────────────────────────────────────────┤
│                                         │
│      ┌─────────────┐                    │
│      │   [Fotoğraf]│                    │
│      │             │                    │
│      └─────────────┘                    │
│                                         │
│   [  Fotoğraf Yükle  ]                 │
│                                         │
│   Desteklenen formatlar: JPG, PNG      │
│   Maksimum boyut: 5MB                  │
└─────────────────────────────────────────┘
```

### Önemli Notlar:

- Yalnızca JPG ve PNG formatları desteklenir
- Dosya boyutu 5MB'ı geçmemelidir
- Eski fotoğrafınız otomatik olarak silinir

---

## 6. Şifre Sıfırlama

### Şifre Sıfırlama Talebi:

1. **Şifremi Unuttum Sayfasına Git**
   - Giriş sayfasından "Şifremi Unuttum" linkine tıklayın
   - Veya `/forgot-password` adresine gidin

2. **E-posta Adresinizi Girin**
   - Kayıtlı e-posta adresinizi girin

3. **Sıfırlama Linki Gönder**
   - "Sıfırlama Linki Gönder" butonuna tıklayın
   - E-posta adresinize şifre sıfırlama linki gönderilecektir

4. **E-postanızı Kontrol Edin**
   - E-posta kutunuzu kontrol edin
   - "Akıllı Kampüs - Şifre Sıfırlama" konulu e-postayı açın

### Şifre Sıfırlama:

1. **E-postadaki Linke Tıklayın**
   - E-posta içindeki şifre sıfırlama linkine tıklayın
   - Bu link sizi şifre sıfırlama sayfasına yönlendirecektir

2. **Yeni Şifre Belirleyin**
   - Yeni şifrenizi girin (minimum 6 karakter)
   - Yeni şifrenizi tekrar girin (doğrulama için)

3. **Şifreyi Sıfırla**
   - "Şifreyi Sıfırla" butonuna tıklayın
   - Başarılı sıfırlama sonrası giriş sayfasına yönlendirileceksiniz

### Ekran Görüntüsü:

**Şifremi Unuttum:**
```
┌─────────────────────────────────────────┐
│   Şifremi Unuttum                       │
├─────────────────────────────────────────┤
│                                         │
│   E-posta adresinizi girin:            │
│   [________________]                    │
│                                         │
│   [  Sıfırlama Linki Gönder  ]         │
│                                         │
│   Giriş sayfasına dön                  │
└─────────────────────────────────────────┘
```

**Şifre Sıfırlama:**
```
┌─────────────────────────────────────────┐
│   Şifre Sıfırlama                       │
├─────────────────────────────────────────┤
│                                         │
│   Yeni Şifre: [________________]       │
│   Şifre Tekrar: [________________]     │
│                                         │
│   [      Şifreyi Sıfırla      ]        │
└─────────────────────────────────────────┘
```

### Önemli Notlar:

- Sıfırlama token'ı 24 saat içinde geçerlidir
- Token süresi dolmuşsa, yeni bir sıfırlama talebi oluşturmanız gerekir
- E-posta gelmediyse spam klasörünüzü kontrol edin
- Güvenlik nedeniyle, e-posta mevcut olmasa bile aynı mesaj gösterilir

---

## 🔐 Güvenlik Önerileri

1. **Güçlü Şifre Kullanın**
   - Minimum 6 karakter (önerilen: 8+ karakter, büyük harf, rakam)
   - Kişisel bilgilerinizi içermesin
   - Farklı platformlar için farklı şifreler kullanın

2. **E-posta Doğrulamasını Tamamlayın**
   - Hesabınızın güvenliği için e-posta doğrulamasını mutlaka yapın

3. **Oturumu Kapatın**
   - Paylaşımlı bilgisayarlarda kullanım sonrası mutlaka çıkış yapın

4. **Şüpheli Aktiviteleri Bildirin**
   - Hesabınızla ilgili şüpheli bir durum fark ederseniz, sistem yöneticisine bildirin

---

## ❓ Sık Sorulan Sorular (SSS)

**S: E-posta doğrulama e-postası gelmedi, ne yapmalıyım?**
C: Spam klasörünüzü kontrol edin. Hala yoksa, kayıt işlemini tekrar deneyin veya sistem yöneticisine başvurun.

**S: Şifremi unuttum, nasıl sıfırlarım?**
C: Giriş sayfasındaki "Şifremi Unuttum" linkini kullanarak e-posta adresinize şifre sıfırlama linki talep edebilirsiniz.

**S: Profil fotoğrafım çok büyük, yüklenmiyor.**
C: Fotoğrafınızı sıkıştırın veya boyutunu küçültün. Maksimum 5MB desteklenmektedir.

**S: E-posta adresimi değiştirebilir miyim?**
C: Şu anda e-posta adresi değiştirilememektedir. Bu özellik gelecek güncellemelerde eklenecektir.

---

**Son Güncelleme:** Aralık 2024

