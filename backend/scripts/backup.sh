#!/bin/bash
# Backup automático do PostgreSQL
# Cron sugerido (todo dia às 2h): 0 2 * * * /caminho/backup.sh

set -e

BACKUP_DIR="${BACKUP_DIR:-/var/backups/erp}"
DB_NAME="${DB_NAME:-erpestoque}"
DB_USER="${DB_USER:-erpuser}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5433}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="$BACKUP_DIR/erp_backup_$TIMESTAMP.sql.gz"

echo "[$TIMESTAMP] Iniciando backup → $FILENAME"
PGPASSWORD="${DB_PASSWORD:-erp123456}" pg_dump \
  -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --no-password \
  | gzip > "$FILENAME"

echo "✅ Backup concluído: $FILENAME ($(du -sh "$FILENAME" | cut -f1))"
find "$BACKUP_DIR" -name "erp_backup_*.sql.gz" -mtime +"$RETENTION_DAYS" -delete
echo "🧹 Backups antigos removidos"
