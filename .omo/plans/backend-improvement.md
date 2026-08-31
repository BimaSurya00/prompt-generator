# Backend Improvement Plan — prompt-generator

## Konteks

- **Users**: 3–5 orang (internal kantor)
- **Hosting**: VPS kantor
- **Stack**: Express (tetap) + SQLite (tetap) + Drizzle ORM (migration only)
- **Kontrak API**: response JSON semua endpoint WAJIB identik — frontend tidak berubah
- **Deadline**: tidak ada (sebisanya)
- **Prinsip**: jangan ganti teknologi, benahi struktur

## Diagnosa (sebelum)

- `routes/api.js` 333 baris monolitik: 9 endpoint campur validasi + DB + LLM + parsing
- Tidak ada layering (controller/service/repository)
- Error handling duplikat 9×, bocor `e.message` ke client
- Validasi manual inline, tidak ada schema
- DB: schema inline `CREATE TABLE IF NOT EXISTS`, migrasi `try/catch ALTER TABLE` gagal diam-diam
- Tidak ada index selain PK
- `usage_logs` tumbuh tanpa batas
- Tidak bisa deploy langsung: Express tidak serve `dist/`, tidak ada health check
- `cors()` terbuka semua origin, tidak ada rate limit (LLM = biaya!)
- PORT hardcoded, tidak ada graceful shutdown, tidak ada test

## Keputusan

- Framework: **Express + layering** (bukan ganti framework)
- Database: **SQLite + Drizzle migration only** (query tetap better-sqlite3)
- Validasi: **zod**
- Exec: bertahap per phase, review tiap phase

---

## Phase 0 — Quick wins sebelum deploy (Wajib)

**Tujuan**: production-ready dasar tanpa mengubah struktur besar.

1. `server/app.js` — express app factory (testable), dipisah dari `index.js`
2. `server/config.js` — env config terpusat + validasi startup (fail fast kalau `LLM_API_KEY` kosong, PORT dari env)
3. `middlewares/errorHandler.js` — 1 error handler terpusat, tidak bocor `e.message` ke client (log detail, respon generik)
4. `middlewares/notFound.js` — 404 JSON
5. `GET /api/health` — health check (status + uptime + db check)
6. `express.static('dist')` — serve production build + SPA fallback
7. CORS whitelist dari env (bukan `cors()` terbuka)
8. Body size limit (`express.json({ limit: '1mb' })`)
9. `package.json`: script `start` + PORT dari env
10. Graceful shutdown (SIGTERM/SIGINT → close server + db)

**Keluar**: server bisa `npm run build && npm start` di VPS, health check jalan, error tidak bocor.

---

## Phase 1 — Layering (Wajib)

**Tujuan**: `api.js` monolitik pecah jadi arsitektur berlapis.

```
server/
├── app.js                ← factory express (dari Phase 0)
├── index.js              ← bootstrap (listen + shutdown)
├── config.js             ← env config
├── db/
│   ├── index.js          ← koneksi SQLite (better-sqlite3)
│   ├── migrations/       ← Drizzle migration files
│   └── drizzle/          ← Drizzle generated
├── repositories/         ← data access
│   ├── topicRepo.js
│   ├── ideaRepo.js
│   ├── promptRepo.js
│   ├── activityRepo.js
│   └── usageRepo.js
├── services/             ← business logic
│   ├── llm.service.js    ← (ex-deepseek.js, murni LLM)
│   ├── ideation.service.js  ← generate 15 ide + parsing + normalizeAngle
│   ├── storyboard.service.js ← generate A/B + template + durasi
│   └── activity.service.js   ← generate aktivitas + normalizeSceneTimes + retry
├── controllers/          ← HTTP handlers (tipis)
│   ├── ideas.controller.js
│   ├── prompts.controller.js
│   ├── activity.controller.js
│   └── history.controller.js
├── routes/               ← router tipis → controller
│   ├── ideas.routes.js
│   ├── prompts.routes.js
│   ├── activity.routes.js
│   └── history.routes.js
├── schemas/              ← zod validation
│   ├── ideas.schema.js
│   ├── prompts.schema.js
│   └── activity.schema.js
├── middlewares/          ← errorHandler, notFound, validate, rateLimit
├── prompts/              ← (sudah ada)
├── model-guides.js       ← (sudah ada)
└── storyboard-templates.json  ← (sudah ada)
```

**Aturan**:
- Controller hanya: validasi via schema → panggil service → `res.json`
- Service: business logic + LLM + parsing (tanpa req/res)
- Repository: query SQLite saja
- Response JSON IDENTIK dengan sekarang

---

## Phase 2 — Database proper (Wajib)

**Tujuan**: migration system + index + maintenance.

1. Setup **Drizzle ORM migration only**:
   - `drizzle.config.ts` + schema definisi (tabel: topics, ideas, prompts, usage_logs, activity_prompts)
   - Migration runner: generate + apply berurutan, track di tabel `__drizzle_migrations`
   - Migrasi existing data.db → state awal via migration (bukan CREATE TABLE inline)
2. **Index**:
   - `ideas(topic_id)`
   - `prompts(idea_id)`
   - `activity_prompts(created_at)`
   - `usage_logs(created_at)`
3. **Cleanup job** usage_logs: hapus > 30 hari (dijalankan saat startup / interval)
4. **Backup script**: `scripts/backup-db.sh` → `sqlite3 data.db ".backup backups/data-YYYYMMDD.db"` + retensi 14 hari
5. Hapus `CREATE TABLE IF NOT EXISTS` dari db.js → pindah ke migration

---

## Phase 3 — Security & reliability (Wajib)

1. **Rate limit** per IP pada `/generate-*` endpoints (proteksi cost LLM) — misal 10 req/menit per IP, pakai `express-rate-limit`
2. **Retry LLM** dengan exponential backoff (2-3 attempt) — bukan cuma 1x manual di activity
3. **Startup validation** di config.js: LLM_API_KEY kosong → server tidak start
4. Zod error → 400 dengan pesan field-spesifik

---

## Phase 4 — Tests (Opsional, menyusul)

- vitest + supertest
- Unit: normalizeAngle, normalizeSceneTimes, parseVariant, enforceSceneDuration
- Integration: tiap route dengan LLM di-mock

---

## Phase 5 — Deploy infra (Opsional, menyusul)

- Dockerfile + docker-compose (server + volume db) — atau dokumentasi systemd/pm2 untuk VPS
- README deployment section
- Cek firewall VPS + reverse proxy (nginx) untuk /api

---

## Catatan Penting

- **Jangan commit `.env`** — sudah di gitignore, pastikan tetap
- **Backup data.db sebelum refactor** — data user 3-5 orang jangan sampai hilang
- **Kontrak API identik** — setiap fase harus test ulang endpoint
- File backup lama `deepseek.js.bak` sudah dihapus