# Prompt Generator

AI storyboard prompt generator untuk iklan video pendek (POV/UGC style). Generate ide konten, storyboard A/B, dan prompt aktivitas untuk berbagai model video AI (Seedance, Kling, Veo, Wan, MiniMax, LTX).

## Stack

- **Frontend**: Vue 3 + Vite + Tailwind CSS
- **Backend**: Express (layered: routes → controllers → services → repositories)
- **Database**: SQLite (better-sqlite3) + Drizzle ORM (migration only)
- **LLM**: DeepSeek via OpenRouter (configurable)

## Development

```bash
npm install
cp .env.example .env   # isi LLM_API_KEY
npm run server         # backend :3001
npm run dev            # frontend (Vite, proxy /api → :3001)
```

## Test

```bash
npm test
```

## Production (VPS)

### Opsi A — Docker

```bash
cp .env.example .env   # isi LLM_API_KEY, CORS_ORIGIN
docker compose up -d --build
```

- App listen di `:3001` (serve frontend build + API)
- Database di volume `db-data:/data` (persist)
- Backup DB: `docker compose exec app sqlite3 /data/data.db ".backup /backups/data.db"` atau jalankan `scripts/backup-db.sh` dengan DB_PATH yang sesuai

### Opsi B — Manual (tanpa Docker)

```bash
npm ci
npm run build            # build frontend → dist/
npm start                # Express serve dist/ + API di :3001
```

### Reverse proxy (nginx) — recommended

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Configuration (.env)

| Variable | Default | Keterangan |
|---|---|---|
| `LLM_API_KEY` | — (wajib) | API key LLM (OpenRouter) |
| `LLM_BASE_URL` | `https://api.deepseek.com/v1/chat/completions` | Endpoint LLM |
| `LLM_MODEL` | `deepseek-chat` | Model yang dipakai |
| `PORT` | `3001` | Port server |
| `CORS_ORIGIN` | kosong (cross-origin ditolak) | Whitelist origin, comma-separated. Frontend & backend selalu same-origin (dev via Vite proxy, prod via `express.static`), jadi ini cuma perlu diisi kalau ada consumer eksternal |
| `DB_PATH` | `server/data.db` | Lokasi database |

## Backup Database

```bash
./scripts/backup-db.sh                 # backup ke backups/data-YYYYMMDD-HHMMSS.db
./scripts/backup-db.sh server/data.db backups   # custom path
# Retensi otomatis 14 hari
```

## Migrasi Database (Drizzle)

Schema: `server/db/schema.ts`. Saat schema berubah:

```bash
npx drizzle-kit generate --name <nama-perubahan>
# Migration baru otomatis jalan saat server start (runMigrations)
```

## Struktur Backend

```
server/
├── app.js               ← express factory (cors, static, health, error handler)
├── index.js             ← bootstrap + graceful shutdown
├── config.js            ← env config + validasi startup
├── db/                  ← koneksi + migrasi (Drizzle) + schema
├── routes/              ← router tipis
├── controllers/         ← HTTP handlers
├── services/            ← business logic (LLM, ideation, storyboard, activity)
├── repositories/        ← data access
├── schemas/             ← zod validation
├── middlewares/         ← errorHandler, validate, rateLimit, asyncHandler
├── prompts/             ← system prompt templates (skill utama)
└── model-guides.js      ← per-model prompting guides
```