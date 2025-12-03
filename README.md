# Madlen AI Case Study

Bu proje, Madlen Case Study kapsamında geliştirilmiş, modern, kullanıcı dostu ve çok modlu (multi-modal) bir yapay zeka sohbet uygulamasıdır. Google Gemini arayüzünden esinlenilerek tasarlanmış olup, gerçek zamanlı yanıt akışı (streaming), görsel analiz yeteneği ve geçmiş sohbet yönetimi gibi özellikler sunar.

## 🚀 Özellikler

*   **Modern Arayüz**: React ve Tailwind CSS ve Shadcn UI kutuphanesi ile geliştirilmiş, temiz, responsive kullanıcı deneyimi.
*   **Çoklu Model Desteği**: Google Gemini 2.0 Flash, Gemma 3, Llama 3, Mistral 7B ve xAI Grok gibi çeşitli yapay zeka modelleri arasında geçiş yapabilme.
*   **Streaming Yanıtlar**: Server-Sent Events (SSE) teknolojisi ile yapay zeka yanıtlarının kelime kelime, gerçek zamanlı olarak ekrana yazılması.
*   **Görsel Analiz (Multi-modal)**: Kullanıcıların görsel yükleyip, bu görseller hakkında soru sorabilmesi.
*   **Sohbet Geçmişi**: SQLite veritabanı üzerinde tutulan sohbet geçmişi, yan menüden eski sohbetlere erişim ve silme özelliği.
*   **Oturum Yönetimi**: Yeni sohbet başlatma, sohbetleri silme

*   **Gözlemlenebilirlik (Observability)**: OpenTelemetry ve Jaeger entegrasyonu ile backend performans takibi.
*   **Kolay Kurulum**: `Makefile` ile tek komutla kurulum ve çalıştırma imkanı.

## 🛠 Teknolojiler

### Frontend
*   **React (Vite)**: Hızlı ve modern frontend geliştirme ortamı.
*   **TypeScript**: Tip güvenliği ve kod kalitesi için.
*   **Tailwind CSS**: Hızlı ve esnek stil oluşturma.
*   **Shadcn/ui**: Modern ve erişilebilir UI bileşenleri (Dialog, Button, Input vb.).
*   **Lucide React**: İkon seti.
*   **Axios & Fetch API**: Backend iletişimi ve streaming veri okuma.

### Backend
*   **FastAPI**: Yüksek performanslı, asenkron Python web framework'ü.
*   **SQLAlchemy**: Veritabanı ORM (SQLite kullanımı).
*   **OpenRouter API**: Farklı LLM modellerine tek bir API üzerinden erişim.
*   **OpenTelemetry**: Uygulama izleme ve trace toplama.

## ⚙️ Kurulum ve Çalıştırma

Projeyi çalıştırmak için aşağıdaki adımları takip edebilirsiniz.

### Ön Gereksinimler
*   Node.js (v18+)
*   Python (3.9+)
*   Docker (Opsiyonel, Jaeger için gerekli)

### 1. Ortam Değişkenleri (.env)
`backend` klasörü altında `.env` dosyası oluşturun ve OpenRouter API anahtarınızı ekleyin:

```env
OPENROUTER_API_KEY=sk-or-v1-......
```

### 2. Hızlı Başlatma (Makefile ile)

Proje kök dizininde terminali açın ve sırasıyla şu komutları çalıştırın:

**Bağımlılıkları Yükle:**
```bash
make install
```

**Backend'i Başlat (Ayrı bir terminalde):**
```bash
make run-backend
```

**Frontend'i Başlat (Ayrı bir terminalde):**
```bash
make run-frontend
```

Uygulama `http://localhost:5173` adresinde çalışacaktır.

### 3. Docker ile Jaeger (Opsiyonel)
Trace verilerini görüntülemek için Jaeger'ı başlatabilirsiniz:

```bash
make docker-up
```
Jaeger arayüzüne `http://localhost:16686` adresinden erişebilirsiniz.

## 📂 Proje Yapısı

```
madlen-case-study/
├── backend/                # Python FastAPI Backend
│   ├── main.py            # Ana uygulama ve API endpoint'leri
│   ├── models.py          # Veritabanı modelleri (SQLAlchemy)
│   ├── services.py        # OpenRouter API entegrasyonu
│   ├── telemetry.py       # OpenTelemetry ayarları
│   └── requirements.txt   # Python bağımlılıkları
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/    # UI Bileşenleri (ChatWindow, Sidebar vb.)
│   │   ├── lib/           # Yardımcı fonksiyonlar
│   │   ├── api.ts         # API istekleri ve tipler
│   │   └── App.tsx        # Ana uygulama mantığı
│   └── package.json       # Frontend bağımlılıkları
├── docker-compose.yml      # Jaeger servisi için Docker yapılandırması
└── Makefile                # Kolay komutlar için Makefile
```
