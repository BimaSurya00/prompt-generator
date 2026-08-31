#!/usr/bin/env bash
set -euo pipefail

# Backup SQLite database. Simpan ke backups/ dengan tanggal, retensi 14 hari.
# Usage: ./scripts/backup-db.sh [path-to-data.db] [backup-dir]

DB_PATH="${1:-server/data.db}"
BACKUP_DIR="${2:-backups}"
DATE=$(date +%Y%m%d-%H%M%S)
DEST="$BACKUP_DIR/data-$DATE.db"

mkdir -p "$BACKUP_DIR"
sqlite3 "$DB_PATH" ".backup '$DEST'"
echo "Backup: $DEST ($(du -h "$DEST" | cut -f1))"

# Retensi 14 hari
find "$BACKUP_DIR" -name 'data-*.db' -mtime +14 -delete
echo "Retensi: hapus backup > 14 hari"