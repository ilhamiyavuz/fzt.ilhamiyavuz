# Türkçe AI Destekli Fizyoterapi Platformu — Mimari Tasarım (Kod Yok)

## 1) Ürün Özeti
Bu ürün; fizyoterapistin hasta takibini dijitalleştiren, hastanın evde egzersiz uygulamasını kolaylaştıran ve kameradan hareket analizi ile anlık geri bildirim sağlayan **yardımcı karar destek platformudur**.

- **Kapsam**: Hasta mobil uygulaması (React Native), fizyoterapist web paneli (Next.js), AI analiz motoru (FastAPI + MediaPipe/MoveNet).
- **Dil**: Varsayılan ve ilk dil tamamen Türkçe.
- **Sınır**: Sistem tanı koymaz; fizyoterapiste klinik takipte yardımcı olur.
- **Entegrasyon**: e-Nabız entegrasyonu yok; bağımsız (standalone) yapı.
- **Hedef**: Hızlı MVP + ölçeklenebilir mimariye evrilebilir kurgu.

---

## 2) Kullanıcı Rolleri

### 2.1 Admin
- Kullanıcı/rol yönetimi
- Klinik ve sistem ayarları
- Audit log izleme

### 2.2 Fizyoterapist
- Hasta kaydı açma
- Tanı/evre/not girişi
- Egzersiz reçetesi ve protokol atama
- AI analiz sonuçlarını ve uyum verilerini izleme

### 2.3 Hasta
- Günlük egzersiz planını görüntüleme
- Kamera ile egzersiz icrası
- Ağrı/durum günlüğü girme
- İlerleme ve bildirimleri takip etme

### 2.4 Refakatçi (opsiyonel)
- Hastanın plan/takvim takibi
- Bildirim ve hatırlatma desteği

---

## 3) Kullanıcı Akışları

## 3.1 Fizyoterapist Ana Akışı
1. Giriş yapar.
2. Yeni hasta ekler veya mevcut hastayı açar.
3. Tanı, klinik not, rehabilitasyon evresi bilgilerini girer.
4. Egzersiz kütüphanesinden program oluşturur veya hazır protokol seçer.
5. Set/tekrar/süre parametrelerini kişiselleştirir.
6. Programı hastaya atar.
7. Takip ekranında uyum, ağrı, ROM, AI form hatalarını izler.
8. Gerekirse programı revize eder.

## 3.2 Hasta Ana Akışı
1. Giriş yapar.
2. “Bugünkü Egzersiz Planım” ekranını açar.
3. Egzersiz detayını (Türkçe açıklama, video, set/tekrar/süre) inceler.
4. Kamera takibi ile egzersizi uygular.
5. AI’dan anlık Türkçe geri bildirim alır.
6. Seansı tamamlar; ağrı/durum günlüğünü girer.
7. Haftalık ilerleme ekranını kontrol eder.

## 3.3 Klinik Not Asistanı Akışı
1. Fizyoterapist serbest metin/dikte not girer.
2. NLP modülü metni yapılandırır: tanı, ağrı skoru, ROM ifadesi, semptom vb.
3. Sistem öneri çıktısı üretir (otomatik karar/veri yorumu yok).
4. Fizyoterapist onayıyla kaydedilir.

## 3.4 ROM Ölçüm Akışı
1. Hasta veya fizyoterapist ROM ölçüm modülünü açar.
2. Kamera/sensör verisi ile açı hesaplanır.
3. Ölçüm kaydedilir (eklem tipi, açı, tarih, güven skoru).
4. Geçmiş ölçümle karşılaştırmalı trend grafiği gösterilir.

---

## 4) Sistem Mimarisi

## 4.1 Yüksek Seviye Bileşenler
- **Mobil Uygulama (React Native)**
  - Hasta odaklı ekranlar, kamera seansı, ağrı günlüğü, bildirimler, erişilebilirlik.
- **Web Panel (Next.js)**
  - Fizyoterapist dashboard, hasta yönetimi, reçeteleme, takip-analiz.
- **API Backend (FastAPI)**
  - Kimlik doğrulama, iş kuralları, CRUD, raporlama, bildirim orkestrasyonu.
- **AI Analiz Servisi (FastAPI/Python ayrı servis önerilir)**
  - Pose estimation, açı hesaplama, tekrar sayma, form analizi, Türkçe geri bildirim.
- **PostgreSQL**
  - Operasyonel veriler (kullanıcı, seans, log, not, ROM, ağrı).
- **Object Storage (S3 uyumlu)**
  - Egzersiz videoları, görseller, gerekirse seans medya parçaları.
- **Gerçek Zaman Katmanı (WebSocket)**
  - Kamera egzersizi sırasında anlık geri bildirim iletimi.

## 4.2 Mimari Yaklaşım
- **MVP**: Modüler monolith (tek backend) + AI için ayrı servis/worker.
- **Evrim**: Yük arttığında servis ayrıştırma:
  - Auth Service
  - Clinical Data Service
  - Exercise & Session Service
  - AI Analysis Service
  - Notification Service

## 4.3 Güvenlik Prensipleri
- JWT access + refresh token
- RBAC (Admin/Fizyoterapist/Hasta/Refakatçi)
- Hassas alanlar için şifreleme (at-rest)
- Audit log zorunluluğu
- Onam kayıtları (consent)
- Medya URL’lerinde süreli imzalı erişim
- API request validasyonu (Pydantic)

## 4.4 Ölçeklenebilirlik Notları
- Kamera analizi CPU/GPU yoğun: queue tabanlı işleme (Celery/RQ + Redis) opsiyonlu
- Sık okunan dashboard verileri için cache (Redis)
- Raporlama sorgularını OLTP’den ayırmak için ileride read-replica/warehouse planı

---

## 5) Veritabanı Şeması (Öneri)

Aşağıdaki şema PostgreSQL odaklıdır. Tüm tablolarda ortak alanlar önerilir:
- `id (uuid, pk)`
- `created_at (timestamptz)`
- `updated_at (timestamptz)`
- `deleted_at (timestamptz, nullable)` (soft delete gereken yerlerde)

## 5.1 `users`
- Alanlar: `id`, `email (unique)`, `phone (unique, nullable)`, `password_hash`, `role`, `is_active`, `last_login_at`
- İlişkiler: 1-1 physiotherapists / patients / caregiver_profiles
- İndeks: `email`, `phone`, `role`
- Validasyon: email format, güçlü parola, role enum

## 5.2 `physiotherapists`
- Alanlar: `id`, `user_id (fk users)`, `full_name`, `license_no`, `specialty`, `clinic_name`
- İlişkiler: 1-N patients, 1-N exercise_programs
- İndeks: `user_id unique`, `license_no`

## 5.3 `patients`
- Alanlar: `id`, `user_id (fk users)`, `physiotherapist_id (fk physiotherapists)`, `full_name`, `birth_date`, `gender`, `height_cm`, `weight_kg`, `rehab_phase`
- İlişkiler: 1-N diagnoses, pain_logs, exercise_sessions, rom_measurements
- İndeks: `physiotherapist_id`, `full_name`
- Validasyon: boy/kilo aralıkları, doğum tarihi geçmişte olmalı

## 5.4 `caregiver_profiles`
- Alanlar: `id`, `user_id`, `patient_id`, `relation_type`
- İlişkiler: N-1 patient
- İndeks: `patient_id`

## 5.5 `diagnoses`
- Alanlar: `id`, `patient_id`, `physiotherapist_id`, `diagnosis_code`, `diagnosis_text`, `operation_date`, `stage`
- İndeks: `patient_id`, `diagnosis_code`
- Validasyon: operation_date gelecekte olmamalı

## 5.6 `exercise_library`
- Alanlar: `id`, `name_tr`, `description_tr`, `category`, `difficulty_level`, `target_joints (jsonb)`, `media_url`, `is_active`
- İndeks: `category`, `name_tr gin_trgm_ops`
- Validasyon: Türkçe ad/açıklama zorunlu

## 5.7 `exercise_programs`
- Alanlar: `id`, `patient_id`, `physiotherapist_id`, `title_tr`, `start_date`, `end_date`, `status`
- İndeks: `patient_id`, `status`, `(patient_id, status)`

## 5.8 `exercise_program_items`
- Alanlar: `id`, `program_id`, `exercise_id`, `day_of_week`, `sets`, `reps`, `hold_seconds`, `rest_seconds`, `order_no`
- İlişkiler: N-1 exercise_programs, N-1 exercise_library
- İndeks: `program_id`, `(program_id, day_of_week)`
- Validasyon: sets/reps > 0

## 5.9 `exercise_sessions`
- Alanlar: `id`, `patient_id`, `program_item_id`, `started_at`, `ended_at`, `completion_rate`, `ai_score_avg`, `pain_before`, `pain_after`
- İndeks: `patient_id`, `started_at desc`
- Validasyon: pain 0-10 aralığı

## 5.10 `exercise_repetition_logs`
- Alanlar: `id`, `session_id`, `rep_no`, `is_correct`, `movement_score`, `error_type`, `min_angle`, `max_angle`, `duration_ms`
- İndeks: `session_id`, `(session_id, rep_no)`
- Validasyon: rep_no >= 1, score 0-100

## 5.11 `rom_measurements`
- Alanlar: `id`, `patient_id`, `joint_type`, `movement_type`, `angle_degree`, `measured_at`, `source_type(camera/sensor/manual)`, `confidence_score`
- İndeks: `(patient_id, joint_type, measured_at desc)`
- Validasyon: açı 0-180/ekleme özel üst sınır

## 5.12 `pain_logs`
- Alanlar: `id`, `patient_id`, `pain_level`, `fatigue_level`, `stiffness_level`, `swelling_level`, `note_tr`, `logged_at`
- İndeks: `patient_id`, `logged_at desc`
- Validasyon: tüm skorlar 0-10

## 5.13 `progress_notes`
- Alanlar: `id`, `patient_id`, `physiotherapist_id`, `note_tr`, `week_no`
- İndeks: `(patient_id, week_no)`

## 5.14 `ai_feedback_logs`
- Alanlar: `id`, `session_id`, `timestamp_ms`, `feedback_code`, `feedback_text_tr`, `severity`, `suppressed_reason`
- İndeks: `session_id`, `feedback_code`

## 5.15 `clinical_notes`
- Alanlar: `id`, `patient_id`, `physiotherapist_id`, `raw_note_tr`, `structured_json`, `summary_tr`, `source(text/voice)`, `approved_by_user`
- İndeks: `patient_id`, `physiotherapist_id`
- Validasyon: `structured_json` şema kontrolü

## 5.16 `consent_records`
- Alanlar: `id`, `patient_id`, `consent_type`, `version`, `accepted_at`, `revoked_at`, `ip_address`
- İndeks: `(patient_id, consent_type, version)`

## 5.17 `notifications`
- Alanlar: `id`, `user_id`, `title_tr`, `body_tr`, `channel(push/inapp)`, `scheduled_at`, `sent_at`, `read_at`, `status`
- İndeks: `user_id`, `status`, `scheduled_at`

## 5.18 `achievements`
- Alanlar: `id`, `patient_id`, `badge_code`, `badge_name_tr`, `earned_at`, `points`
- İndeks: `patient_id`, `badge_code`

## 5.19 `gamification_profiles`
- Alanlar: `id`, `patient_id`, `level`, `total_points`, `streak_days`, `avatar_config_json`
- İndeks: `patient_id unique`

## 5.20 `audit_logs`
- Alanlar: `id`, `actor_user_id`, `action`, `entity_type`, `entity_id`, `changes_json`, `ip_address`, `created_at`
- İndeks: `(actor_user_id, created_at desc)`, `(entity_type, entity_id)`

---

## 6) API Tasarımı (REST)

> Tüm endpoint’lerde dil varsayılanı `tr-TR`. Tüm hata mesajları Türkçe döner.

## 6.1 Auth

### `POST /api/v1/auth/register`
- Request: `{ email, phone, password, role }`
- Response: `{ user_id, role, message: "Kayıt başarılı" }`
- Hatalar: `409 kullanıcı mevcut`, `422 doğrulama hatası`

### `POST /api/v1/auth/login`
- Request: `{ email_or_phone, password }`
- Response: `{ access_token, refresh_token, expires_in, user }`
- Hatalar: `401 hatalı kimlik bilgisi`, `423 hesap pasif`

### `POST /api/v1/auth/refresh`
- Request: `{ refresh_token }`
- Response: `{ access_token, expires_in }`

### `POST /api/v1/auth/forgot-password`
- Request: `{ email }`
- Response: `{ message: "Şifre sıfırlama bağlantısı gönderildi" }`

---

## 6.2 Patients

### `POST /api/v1/patients`
- (Fizyoterapist)
- Request: hasta profil bilgileri
- Response: `{ patient_id, message }`
- Hatalar: `403 yetki yok`, `422 veri hatası`

### `GET /api/v1/patients`
- Query: `search`, `page`, `size`
- Response: `{ items: [...], total }`

### `GET /api/v1/patients/{patient_id}`
- Response: hasta profil + özet metrikler

### `PATCH /api/v1/patients/{patient_id}`
- Request: güncellenecek alanlar
- Response: güncel kayıt

---

## 6.3 Physiotherapists

### `GET /api/v1/physiotherapists/me/dashboard`
- Response: 
  - `total_active_patients`
  - `today_exercised_count`
  - `low_adherence_patients`
  - `pain_increase_patients`
  - `top_error_exercises`
  - `performance_7d`

### `POST /api/v1/physiotherapists/protocols/apply`
- Request: `{ patient_id, protocol_code, start_date }`
- Response: `{ program_id, message }`

---

## 6.4 Exercises

### `GET /api/v1/exercises/library`
- Query: `category`, `difficulty`
- Response: egzersiz listesi (Türkçe metinler)

### `POST /api/v1/exercises/library`
- Request: egzersiz tanımı + medya URL
- Response: oluşturulan egzersiz

---

## 6.5 Exercise Programs

### `POST /api/v1/exercise-programs`
- Request:
```json
{
  "patient_id": "uuid",
  "title_tr": "Diz Rehabilitasyon Hafta 1",
  "items": [
    { "exercise_id": "uuid", "day_of_week": 1, "sets": 3, "reps": 10, "hold_seconds": 2, "rest_seconds": 30 }
  ]
}
```
- Response: `{ program_id, status: "active" }`

### `GET /api/v1/exercise-programs/{patient_id}/active`
- Response: aktif program + bugünkü öğeler

---

## 6.6 Exercise Sessions

### `POST /api/v1/exercise-sessions/start`
- Request: `{ patient_id, program_item_id }`
- Response: `{ session_id, websocket_url }`

### `POST /api/v1/exercise-sessions/{session_id}/complete`
- Request: `{ completion_rate, pain_before, pain_after }`
- Response: `{ message: "Seans tamamlandı" }`

### `GET /api/v1/exercise-sessions/{session_id}`
- Response: seans özeti + tekrar logları

---

## 6.7 ROM

### `POST /api/v1/rom/measurements`
- Request: `{ patient_id, joint_type, movement_type, angle_degree, source_type }`
- Response: kayıt + karşılaştırma özeti

### `GET /api/v1/rom/measurements/{patient_id}`
- Query: `joint_type`, `period=weekly|monthly`
- Response: trend serisi

---

## 6.8 Pain Logs

### `POST /api/v1/pain-logs`
- Request: `{ patient_id, pain_level, fatigue_level, stiffness_level, swelling_level, note_tr }`
- Response: `{ log_id, message }`

### `GET /api/v1/pain-logs/{patient_id}`
- Response: zaman serisi + özet

---

## 6.9 Clinical Notes

### `POST /api/v1/clinical-notes/parse`
- Request: `{ patient_id, raw_note_tr, source }`
- Response: `{ structured_json, summary_tr, warning: "Bu çıktı tanı amacı taşımaz" }`

### `POST /api/v1/clinical-notes`
- Request: onaylı yapılandırılmış not
- Response: `{ clinical_note_id }`

### `GET /api/v1/clinical-notes/{patient_id}`
- Response: not listesi

---

## 6.10 AI Analysis

### `POST /api/v1/ai-analysis/session-frame`
- Request: frame/meta (MVP’de düşük FPS paketleme)
- Response: `{ rep_count, form_score, feedback_text_tr, detected_errors }`

### `GET /api/v1/ai-analysis/sessions/{session_id}/summary`
- Response: tekrar bazlı analiz özeti

### `WS /api/v1/ai-analysis/live/{session_id}`
- Olaylar:
  - `rep_update`
  - `feedback`
  - `posture_warning`
  - `session_complete`

---

## 6.11 Notifications

### `POST /api/v1/notifications/schedule`
- Request: `{ user_id, title_tr, body_tr, scheduled_at, channel }`
- Response: `{ notification_id }`

### `GET /api/v1/notifications/me`
- Response: kullanıcı bildirim listesi

---

## 6.12 Reports

### `GET /api/v1/reports/patient/{patient_id}/weekly`
- Response: uyum oranı, ağrı trendi, ROM değişimi, AI hata dağılımı

### `GET /api/v1/reports/physio/overview`
- Response: klinik genel metrikleri

---

## 6.13 Gamification

### `GET /api/v1/gamification/profile/{patient_id}`
- Response: seviye, puan, seri, rozetler

### `POST /api/v1/gamification/events`
- Request: `{ patient_id, event_code, context }`
- Response: `{ earned_points, new_badges }`

---

## 7) Eksik ve Riskli Noktalar

1. **Regülasyon ve KVKK uyumu**
   - Açık rıza/onam metin sürümleme, veri saklama süresi, silme/anonimleştirme politikası netleştirilmeli.

2. **AI doğruluk ve klinik güven sınırları**
   - Farklı cihaz kamera kalitesi, ışık, açı ve kıyafet koşulları performansı düşürebilir.
   - AI önerileri yalnızca yönlendirici olmalı; klinik karar sorumluluğu profesyonelde kalmalı.

3. **Gerçek zamanlı gecikme**
   - Düşük donanımlı telefonlarda canlı analiz FPS düşebilir; cihaz üstü/servis üstü hibrit strateji gerekebilir.

4. **Veri modeli büyümesi**
   - `exercise_repetition_logs` çok hızlı büyür; partitioning ve arşivleme planı gerekir.

5. **Bildirim güvenilirliği**
   - iOS/Android push teslimat farklılıkları sebebiyle in-app fallback tasarlanmalı.

6. **Erişilebilirlik tutarlılığı**
   - Büyük yazı/yüksek kontrast/sesli yönlendirme tüm ekranlarda standardize edilmezse kullanıcı deneyimi bozulur.

7. **Klinik not NLP riski**
   - Türkçe tıbbi terimlerde yanlış ayrıştırma olabilir; “insan onayı olmadan kaydetme” kapalı olmalı.

8. **Güvenli medya erişimi**
   - Egzersiz videoları ve potansiyel seans medya verileri için süreli URL ve anti-hotlinking gerekir.

9. **MVP kapsam kayması**
   - Pediatrik oyunlaştırma ve ileri gait analizi MVP’ye alınırsa takvim ciddi uzar; Faz 2’ye bırakılmalı.

10. **Gözlemlenebilirlik eksikliği**
   - Başlangıçtan itibaren metrik/log/izleme (APM, central logging) kurulmazsa üretimde hata analizi zorlaşır.

