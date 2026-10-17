# Prompt Mühendisliği ve İyileştirme Günlüğü (Prompt Log)

**Ders:** Sunucu Tabanlı Programlama (DEÜ YBS)  
**Proje:** AI-Powered RFP & Bid Response Generator SaaS  
**Geliştirici:** Özge Soğancı  

---

## 1. Tur: Kısıtsız / Temel Prompt (Zero-Shot)

### Kullanılan Prompt:
> "İhale şartnamelerine otomatik teklif yanıtı üreten bir SaaS uygulaması için backend ve SSE API rotası oluştur."

### Model Çıktısı & Analizi:
* **Çıktı:** Tek kiracılı (single-tenant) yapıda, standart REST API ve WebSocket öneren genel bir Node.js kodu üretildi.
* **Problem / Eksiklik:** 
  1. Dersin kısıtı olan multi-tenant (`tenant_id`) izolasyonu unutuldu.
  2. Gerçek zamanlı akış için gereksiz yere karmaşık WebSocket önerildi.
  3. Güvenlik ve yetkilendirme (`manager` rolü) kontrolleri yer almadı.

---

## 2. Tur: Rol, Bağlam ve Kısıt Eklenmiş Prompt

### Kullanılan Prompt:
> "Sen Next.js ve PostgreSQL konusunda uzman kıdemli bir backend geliştiricisisin. Çok kiracılı (multi-tenant) B2B SaaS mimarimize uygun olarak `RFP_REQUESTS` ve `BID_RESPONSES` tabloları üzerinde çalışan bir API yaz. Her sorguda `tenant_id` zorunlu olsun. Yanıtları Server-Sent Events (SSE) ile stream et."

### Model Çıktısı & Analizi:
* **Çıktı:** Multi-tenant şema ve SSE destekli streaming API kurgulandı.
* **İyileşme:** Veri izolasyonu sağlandı, mimari PaaS/Serverless yapısına uygun hale geldi.
* **Kalan Eksiklik:** Secret değerlerin koda yazılması riski ve çıktı formatı disiplini henüz kısıtlanmadı.

---

## 3. Tur: 6 Bileşenli & Doğrulamalı Profesyonel Prompt (Nihai Sürüm)

### Kullanılan Prompt:
> **[Rol]** Next.js App Router ve PostgreSQL konularında kıdemli yazılım mimarı olarak davran.  
> **[Bağlam]** YBS Sunucu Tabanlı Programlama dersi projesi kapsamında multi-tenant B2B RFP SaaS uygulaması geliştiriyoruz.  
> **[Görev]** SSE (Server-Sent Events) protokolü ile gelen ihale şartnamesini analiz edip canlı akış halinde teklif üreten `POST /api/rfp/generate` rotasını yaz.  
> **[Kısıtlar]**  
> 1. Her sorguda aktif kullanıcının `tenant_id` bilgisi doğrulanmalıdır.  
> 2. Secret API anahtarları koda yazılmamalı, `process.env` üzerinden okunmalıdır.  
> 3. Kod içi tüm açıklamalar Türkçe yazılacaktır.  
> **[Format]** Önce yetki akışını sırala, ardından Next.js App Router uyumlu TypeScript kodunu sun.  
> **[Doğrulama]** Yaptığın mimari varsayımları ve kullandığın paketlerin sürümlerini en sonda belirt.

### Çıktı ve Sonuç:
* Ders sunumundaki 3. ve 4. hafta ilkelerine %100 uyumlu, güvenli, `tenant_id` korumalı ve SSE streaming destekli üretim kodu başarıyla elde edildi ve projeye entegre edildi.
