# Auditoria antes de descartar arquiteturas .NET

## Contexto

Antes de descartar definitivamente as arquiteturas **Minimal API + repositórios Npgsql** e **Controllers + EF Core/AppDbContext**, a decisão deve ser tratar o backend atual **Node/Express + TypeScript + Prisma/PostgreSQL** como arquitetura única apenas depois de conferir se há funcionalidades, regras ou modelagem que precisam ser migradas.

Nesta revisão do repositório não foram encontrados artefatos .NET versionados (`*.cs`, `*.csproj`, `*.sln`, `Program.cs`, `AppDbContext` ou `appsettings*.json`). Portanto, não há código .NET local para copiar diretamente; o que precisa ser trazido deve vir de branch, backup, repositório externo ou documentação da implementação anterior.

## Itens que precisam ser verificados e trazidos, se existirem

### Minimal API + repositórios Npgsql

Trazer para a arquitetura atual qualquer item que exista apenas nessa implementação:

- Endpoints e contratos HTTP não existentes em `backend/src/server.ts` ou nos arquivos `*.routes.ts` dos módulos.
- Consultas SQL manuais otimizadas, especialmente relatórios, dashboards, saldos de estoque e telas com agregações grandes.
- Transações explícitas com `NpgsqlTransaction`, principalmente fluxos de venda, compra, cancelamento, baixa e estorno de estoque.
- Validações de entrada e códigos de erro que não existam nos controllers/services atuais.
- Índices, views, constraints e scripts SQL criados fora do Prisma.
- Configurações de pool, timeout e retry importantes para PostgreSQL em ARM64 com poucos recursos.

### Controllers + EF Core/AppDbContext

Trazer para a arquitetura atual qualquer item que exista apenas nessa implementação:

- Entidades, propriedades, relacionamentos e constraints do `AppDbContext` que não estejam refletidos em `backend/prisma/schema.prisma`.
- Migrations EF Core com colunas, índices, chaves únicas ou tabelas ausentes no Prisma.
- Data annotations/fluent API que representem regras obrigatórias de domínio.
- Controllers/actions que tenham endpoints não mapeados nos módulos atuais.
- DTOs, filtros, paginação, ordenação e validações que ainda não existam no backend atual.
- Policies/autorização, claims e regras multiempresa/multifilial que não estejam cobertas por middlewares e services atuais.

## Mapa de destino na arquitetura única

| Item encontrado na arquitetura antiga | Destino na arquitetura atual |
|---|---|
| Endpoint HTTP | `backend/src/modules/<modulo>/*.routes.ts` e controller correspondente |
| Regra de negócio | `backend/src/modules/<modulo>/*.service.ts` ou `backend/src/core/business-rules.ts` |
| SQL otimizado | Service do módulo, preferindo Prisma; SQL raw apenas quando medido e necessário |
| Tabela/coluna/índice | `backend/prisma/schema.prisma` + migration Prisma |
| Autenticação/autorização | `backend/src/middlewares` e módulo `auth`/`usuarios` |
| Configuração de runtime | `backend/.env.example`, Dockerfile ou documentação de deploy |
| Teste de regra crítica | `backend/tests/**/*.test.ts` |

## Checklist obrigatório antes da remoção final

1. Inventariar branches, backups e repositórios externos que possam conter a implementação .NET.
2. Comparar rotas antigas com as rotas atuais do Express.
3. Comparar modelo EF Core/AppDbContext e migrations antigas com `backend/prisma/schema.prisma`.
4. Comparar SQL Npgsql manual com services atuais para não perder otimizações importantes.
5. Migrar regras/contratos ausentes para módulos Node/Express.
6. Adicionar ou atualizar testes em `backend/tests` para cada regra migrada.
7. Rodar `npm --prefix backend run architecture:check`, `npm --prefix backend test` e `npm --prefix backend run build`.
8. Só então remover os artefatos .NET remanescentes e manter o check preventivo ativo.

## Comandos usados nesta auditoria local

```bash
find . -type f \( -name '*.cs' -o -name '*.csproj' -o -name '*.sln' \) -not -path './backend/node_modules/*' -print
git log --all --name-only --pretty=format: | rg '\.(cs|csproj|sln)$|appsettings.*\.json|Program\.cs|AppDbContext|Npgsql|Minimal API|EntityFramework' -n
npm --prefix backend run architecture:check
```
