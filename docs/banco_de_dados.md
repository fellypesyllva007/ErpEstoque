# Banco de dados

## Visão geral

O banco do ERP usa PostgreSQL e Prisma ORM. O schema principal está em `backend/prisma/schema.prisma` e as migrations oficiais ficam em `backend/prisma/migrations`.

A aplicação espera `DATABASE_URL` no ambiente. Em desenvolvimento local, o padrão documentado usa PostgreSQL exposto na porta `5433` do host.

## Principais entidades

### Acesso e RBAC

- `perfis`: perfis como Administrador, Gerente, Atendente, Técnico e Estoquista.
- `usuarios`: credenciais, status ativo, perfil e dados de login.
- `refresh_tokens`: refresh tokens opacos, expiração e revogação.
- `modulos`, `telas`, `permissoes`, `perfil_permissoes`: matriz de autorização por perfil.

### Catálogo e estoque

- `categorias_produto`: categorias de produtos.
- `marcas`: marcas dos produtos.
- `fornecedores`: fornecedores ativos/inativos.
- `produtos`: cadastro do item, custo, preço, estoque atual/mínimo e localização.
- `modelos_aparelho` e `produto_modelos`: compatibilidade entre peças e aparelhos.
- `movimentacoes_estoque`: histórico de entradas, saídas, ajustes, baixas e estornos.

### Operações

- `clientes`: cadastro de clientes.
- `ordens_servico`: abertura e acompanhamento de OS.
- `itens_os`: peças utilizadas em ordens de serviço.
- `pedidos_compra`: pedidos de compra e status.
- `itens_pedido_compra`: itens solicitados/recebidos.
- `recebimentos_compra` e `itens_recebimento`: recebimentos parciais/totais.
- `vendas` e `itens_venda`: vendas concluídas/canceladas e baixa de estoque.

### Auditoria e licenciamento

- `auditoria_produtos`: auditoria específica de produtos.
- `auditoria_geral`: ações críticas em compras, vendas, OS e outros módulos.
- `configuracoes_sistema`: instalação, fingerprint, status/plano de licença, expiração, nonce e hashes de ativação.

## Migrations

Para aplicar migrations em ambiente provisionado:

```bash
cd backend
npx prisma migrate deploy
```

A tabela `configuracoes_sistema` possui migration oficial em `backend/prisma/migrations/20260612000100_add_configuracoes_sistema`. Ela é necessária porque o bootstrap acessa essa tabela antes de iniciar o servidor HTTP.

A pasta `backend/prisma/manual_migrations` deve ser tratada como histórico operacional legado. Novas mudanças de schema devem ser registradas em migrations oficiais do Prisma.

## Prisma Client

O Prisma Client é gerado em `backend/src/generated/prisma` conforme o generator do schema. Esse diretório é artefato gerado e fica fora do versionamento.

O build do backend executa `prisma generate` antes do `tsc`, garantindo que os tipos e o client estejam disponíveis para compilação.

## Seed

O seed (`backend/prisma/seed.ts`) cria:

- perfis padrão;
- módulos, telas e permissões;
- permissões por perfil;
- marcas e categorias padrão;
- usuário administrador inicial.

O login inicial é `admin` / `admin123`. Em produção, essa senha deve ser alterada imediatamente após a primeira autenticação.

## Backup e restore

Os scripts ficam em `backend/scripts`:

```bash
./backend/scripts/backup.sh
./backend/scripts/restore.sh /var/backups/erp/erp_backup_YYYYMMDD_HHMMSS.sql.gz
```

Recomendações:

1. agendar backup diário;
2. validar restore periodicamente em banco separado;
3. proteger o diretório de backups;
4. manter retenção coerente com a operação do cliente.
