# Operação em Rede Local (LAN)

## Arquitetura

```
[Servidor (PC principal)]          [Clientes na rede]
  ┌─────────────────────┐            ┌──────────────┐
  │  Backend :4000      │◄──────────►│ Flutter App  │
  │  PostgreSQL :5433   │            └──────────────┘
  │  (Docker)           │            ┌──────────────┐
  └─────────────────────┘◄──────────►│ Flutter App  │
                                     └──────────────┘
```

## 1. Configurar o servidor

```bash
# No PC que vai ser o servidor:
git clone ...
cd ErpEstoque

# Copiar e configurar .env
cp backend/.env.example backend/.env
# Editar JWT_SECRET

# Subir tudo via Docker
docker compose up -d

# Rodar migrations e seed (primeira vez)
cd backend
npm install
npx prisma migrate deploy
npm run seed
```

## 2. Descobrir o IP do servidor

```bash
# Windows
ipconfig
# Exemplo: 192.168.1.100

# Linux/macOS
ip addr show
# Exemplo: 192.168.1.100
```

## 3. Configurar o Flutter para usar o IP do servidor

Edite `frontend/lib/core/api_service.dart`:

```dart
// Trocar localhost pelo IP do servidor na rede
static const String baseUrl = 'http://192.168.1.100:4000';
```

E em `frontend/lib/modules/login/login_service.dart`:
```dart
static const String baseUrl = 'http://192.168.1.100:4000';
```

## 4. Compilar o app para os clientes

```bash
cd frontend
flutter build windows   # Para Windows
flutter build linux     # Para Linux
flutter build macos     # Para macOS
```

O executável fica em `build/windows/x64/runner/Release/`.

## 5. Firewall

Libere a porta 4000 no firewall do servidor:

```bash
# Windows (PowerShell admin)
New-NetFirewallRule -DisplayName "ERP Backend" -Direction Inbound -Port 4000 -Protocol TCP -Action Allow

# Linux (ufw)
sudo ufw allow 4000/tcp
```

## 6. Backup automático (Linux)

```bash
# Adicionar ao cron (todo dia às 2h)
crontab -e
# Adicionar linha:
0 2 * * * /caminho/para/ErpEstoque/backend/scripts/backup.sh >> /var/log/erp_backup.log 2>&1
```

## Múltiplos usuários simultâneos

O backend suporta múltiplas conexões simultâneas por padrão.
O Prisma usa pool de conexões (padrão: 5 conexões).
Para aumentar o pool, adicione ao DATABASE_URL:
```
DATABASE_URL="postgresql://...?connection_limit=20"
```
