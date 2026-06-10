#!/bin/bash
# Restauração: ./restore.sh /caminho/backup.sql.gz
set -e
if [ -z "$1" ]; then echo "Uso: $0 <backup.sql.gz>"; exit 1; fi
DB_NAME="${DB_NAME:-erpestoque}"
DB_USER="${DB_USER:-erpuser}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5433}"
echo "⚠️  Restaurar '$DB_NAME' de '$1'?"
read -p "Confirmar? (s/N) " -n 1 -r; echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then echo "Cancelado."; exit 0; fi
PGPASSWORD="${DB_PASSWORD:-erp123456}" gunzip -c "$1" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"
echo "✅ Restauração concluída!"
