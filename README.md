## KoreERP

KoreERP é um ERP multiempresa em Flutter + Node/Express/Prisma/PostgreSQL para estoque, vendas, compras, OS, fiscal, financeiro e cadastros administrativos.

## Módulos

| Módulo | Status | Funcionalidades |
|---|---|---|
| Dashboard | ✅ | Cockpit executivo, indicadores, alertas estoque, movimentações recentes, faturamento do dia com contexto empresa/filial |
| Produtos | ✅ | CRUD, filtro por categoria, importar CSV, exportar CSV, etiquetas, busca por código de barras |
| Estoque | ✅ | Entrada, saída, ajuste, histórico completo e contexto por filial |
| Compras | ✅ | Pedido de compra, recebimento parcial/total, histórico, cancelamento |
| Vendas | ✅ | PDV com scanner, venda rápida, baixa automática de estoque, cancelamento com estorno |
| Ordens de Serviço | ✅ | Abertura, atualização de status, peças utilizadas com baixa de estoque, laudo, mão de obra, garantia |
| Clientes | ✅ | CRUD completo |
| Fornecedores | ✅ | CRUD completo |
| Relatórios | ✅ | Estoque, movimentações, vendas, compras, sugestão de reposição, exportação CSV |
| Notificações | ✅ | Widget flutuante em tempo real, alertas de estoque crítico e baixo |
| Usuários | ✅ | CRUD, perfis, RBAC completo e vínculo empresa/filial |
| Cadastros base | ✅ | Empresas, filiais, unidades, formas/condições de pagamento, centros de custo e plano de contas |
| Financeiro | ✅ | Contas a receber/pagar, caixa, fluxo de caixa, DRE e baixas parciais/totais |
| Etiquetas | ✅ | Impressão HTML 80×40mm com código de barras |
| Importação Excel | ✅ | CSV com template, criação automática de categorias/marcas |
| Exportação Excel | ✅ | CSV de estoque, movimentações, vendas, sugestão de reposição |
| Scanner código de barras | ✅ | Scanner USB e busca rápida por código |
| Auditoria | ✅ | Log geral de ações em compras, vendas, OS, produtos |
| Backup | ✅ | Script shell com retenção configurável e cron |
| Rede Local | ✅ | API HTTP — basta configurar o IP do servidor no app |

## Stack

- **Backend:** Node.js 20 + Express 5 + TypeScript + Prisma ORM
- **Frontend:** Flutter Desktop (Windows/Linux/macOS)
- **Banco:** PostgreSQL 16 (Docker)

## Decisão de arquitetura

O repositório mantém **uma única arquitetura de backend**: Node/Express com rotas por módulo, controllers/services e Prisma/PostgreSQL. Não há duas arquiteturas ativas no código versionado.

As arquiteturas .NET avaliadas anteriormente — Minimal API com repositórios Npgsql e Controllers com EF Core/AppDbContext — foram tratadas como legado externo/descartado. Se alguma regra de negócio antiga for recuperada em branch, backup ou repositório externo, ela deve ser migrada para a stack Node/Express antes de qualquer código legado ser removido ou arquivado. O roteiro de conferência fica em `docs/auditoria-arquiteturas-dotnet.md`.

Para evitar regressão, execute `npm run architecture:check` dentro de `backend`; o script falha se artefatos .NET/C# forem reintroduzidos.

## Instalação

### Opção 1 — Docker Compose (recomendado)

```bash
git clone ...
cd ErpEstoque

cp backend/.env.example backend/.env
# Edite JWT_SECRET no .env

docker compose up -d          # Sobe PostgreSQL + Backend
cd backend && npm install
npx prisma migrate deploy     # Cria tabelas
npm run seed                  # Popula dados iniciais
```

### Opção 2 — Desenvolvimento local

```bash
# PostgreSQL via Docker (apenas o banco)
docker compose up postgres -d

cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run seed
npm run dev                   # Backend em :4000
```

### Frontend

```bash
cd frontend
flutter pub get

# Desenvolvimento
flutter run -d windows

# Build de produção
flutter build windows
```

**Login padrão:** `admin` / `admin123`

O seed cria a empresa `KoreERP Demonstração`, a filial `Matriz` e o vínculo do administrador a esse contexto.


## Fiscal NF-e / ACBrLib

O Flutter agora possui um módulo inicial **Fiscal NF-e** para conectar o ERP ao gateway NfeWeb/ACBrLib. Configure a URL fiscal com:

```bash
flutter run --dart-define=API_URL=http://servidor-erp:4000 --dart-define=NFEWEB_API_URL=http://oracle-arm:3333
```

No Flutter Web, também é possível apontar o gateway fiscal em tempo de execução:

```js
localStorage.setItem('ERP_NFEWEB_API_URL', 'http://oracle-arm:3333')
```

A arquitetura recomendada é manter a ACBrLibNFe (`.so`) no servidor Oracle/NfeWeb e acessar por HTTP, porque Flutter Web não carrega `.so` via FFI e Desktop/Android exigiriam binários específicos por plataforma.

## Rede local

Veja `REDE_LOCAL.md` para configurar múltiplos terminais.

## Backup

```bash
# Manual
./backend/scripts/backup.sh

# Restauração
./backend/scripts/restore.sh /var/backups/erp/erp_backup_YYYYMMDD_HHMMSS.sql.gz

# Cron automático (todo dia às 2h)
0 2 * * * /caminho/ErpEstoque/backend/scripts/backup.sh
```


## Produção e segurança

Antes de publicar ou expor o backend fora do ambiente local/rede confiável:

- Defina `JWT_SECRET` forte e único.
- Defina `CORS_ORIGINS` com as origens HTTP realmente usadas pelo frontend Web, separadas por vírgula.
- Altere a senha do usuário `admin` no primeiro acesso.
- Execute `npx prisma migrate deploy` antes de iniciar o backend.
- Use HTTPS/proxy reverso se houver acesso fora da rede local.

## Perfis de acesso

| Perfil | Acesso |
|---|---|
| Administrador | Tudo |
| Gerente | Tudo exceto usuários |
| Atendente | Vendas, OS, Clientes |
| Estoquista | Estoque, Produtos, Compras, Fornecedores |
| Técnico | OS |


## Multiempresa KoreERP

As rotas operacionais exigem JWT com `empresaId`/`filialId` ou cabeçalhos `X-Empresa-Id` e `X-Filial-Id`. O middleware `requireTenant` valida o vínculo em `usuarios_filiais`; serviços críticos usam filtros por tenant para impedir leitura cruzada entre empresas/filiais. Consulte `docs/koreerp.md` para detalhes.
