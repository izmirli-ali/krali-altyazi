# KRALI release checks

`node scripts/verify-appearance-release.js KRALI_ALTYAZI_v6.6.2_OTA_FINAL.zip`

Bu kontrol, OTA ZIP paketinin içindeki gerçek HTML/CSS/JS dosyalarını denetler. GÖRÜNÜM ana satırlarının gerekli input ID'lerini, slider yasağını, idempotent DOM taşıma sırasını ve korunması gereken renderer/ASR/timeline writer sembollerini doğrular.

Bu bir Premiere runtime testi değildir. Yeni bir UI sürümünde önce bu kontrol, ardından uygun bir yerel Chromium/Playwright ortamında 390 px / 620 px / geniş panel ekran görüntüsü doğrulaması çalıştırılmalıdır.
