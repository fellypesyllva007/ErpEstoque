# KoreERP

O KoreERP é a evolução multiempresa do ErpEstoque, com backend Node/Express/Prisma/PostgreSQL e frontend Flutter.

## Contexto empresarial obrigatório

Todas as rotas operacionais protegidas exigem autenticação JWT e contexto `empresaId`/`filialId`. O backend valida se o usuário possui vínculo ativo em `usuarios_filiais` antes de executar a operação e os serviços críticos aplicam filtros por empresa e filial.

A regra operacional é:

1. O login resolve o contexto informado ou o primeiro vínculo ativo do usuário.
2. O JWT emitido carrega `empresaId` e `filialId`.
3. O frontend persiste esse contexto e também envia `X-Empresa-Id`/`X-Filial-Id`.
4. `requireTenant` bloqueia usuário sem vínculo ativo.
5. Services de produtos, categorias, marcas, clientes, fornecedores, estoque, compras, vendas, OS, financeiro, fiscal, notificações, dashboard, relatórios e usuários consultam/criam dados com `tenantWhere`/`tenantCreate`.

## Segurança e auditoria

- Refresh tokens continuam opacos e rotacionados.
- Login e logout são auditados em `auditoria_geral`.
- Usuários criados pelo painel e o usuário `admin` do seed entram com `senhaTemporaria = true`, permitindo exigir troca de senha no primeiro acesso pelo frontend.
- Perfis são filtrados por empresa e usuários são vinculados à empresa/filial corrente no cadastro.

## Módulos implementados nesta evolução

- Empresas e filiais demo no seed.
- Vínculo usuário-empresa-filial.
- JWT com `empresaId` e `filialId`.
- Cadastros base: unidades, condições de pagamento, formas de pagamento, centros de custo e plano de contas.
- Financeiro gerencial: contas a receber, contas a pagar, caixa, fluxo de caixa e DRE.
- Integração financeira inicial: vendas geram contas a receber; compras geram contas a pagar; baixas geram caixa.
- Isolamento multiempresa nos módulos operacionais existentes.
- Novas telas Flutter para Cadastros e Financeiro.

## Instalação rápida

```bash
cd backend
npm install
npx prisma migrate dev
npm run seed
npm run build
npm test

cd ../frontend
flutter pub get
flutter analyze
flutter build web
```

Credenciais demo: `admin` / `admin123`.
