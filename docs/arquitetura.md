# Arquitetura do ERP Estoque

## Objetivo

O projeto é um ERP para assistência técnica de celulares, com controle de produtos, estoque, compras, vendas, ordens de serviço, clientes, fornecedores, usuários, permissões, auditoria, relatórios, notificações e licenciamento.

## Stack

- **Backend:** Node.js 20, Express 5, TypeScript em modo `strict`, Prisma ORM 7 e PostgreSQL.
- **Frontend:** Flutter multiplataforma, com suporte a Desktop, Web e Android conforme configuração de plataforma.
- **Banco:** PostgreSQL 16, normalmente provisionado via Docker Compose.
- **Deploy local:** Docker Compose para PostgreSQL e backend; frontend compilado/executado separadamente.

## Backend

### Decisão de arquitetura única

Para o servidor Oracle Cloud Free Ampere ARM64 com Ubuntu 22.04, a opção mantida no repositório é a arquitetura Node/Express + TypeScript + Prisma/PostgreSQL já consolidada no projeto. Ela usa rotas por módulo, controllers e services, mantendo uma única stack de backend para reduzir consumo, simplificar build/deploy e evitar endpoints duplicados.

A revisão atual confirma que **não existem duas arquiteturas ativas no repositório**: o backend versionado é somente Node/Express + Prisma/PostgreSQL. As arquiteturas .NET avaliadas — Minimal API + repositórios Npgsql e Controllers + EF Core/AppDbContext — ficam documentadas apenas como legado externo/descartado. Caso algum código, regra ou migration dessas versões antigas apareça em branch, backup ou repositório externo, o roteiro `docs/auditoria-arquiteturas-dotnet.md` deve ser usado para migrar o que for necessário para Node/Express.

O check `npm run architecture:check` em `backend` automatiza a verificação e falha se artefatos .NET/C# forem reintroduzidos.

O backend é organizado por módulos em `backend/src/modules`:

- `auth`: login, refresh token, logout e `/auth/me`.
- `dashboard`: indicadores e visão resumida.
- `produtos`: produtos, categorias, marcas, importação CSV e etiquetas.
- `estoque`: movimentações e resumo por produto.
- `compras`: pedidos, recebimento parcial/total, histórico e cancelamento.
- `vendas`: PDV, baixa automática, cancelamento e ranking.
- `os`: ordens de serviço, peças utilizadas e estorno de peças removidas.
- `clientes` e `fornecedores`: cadastros operacionais.
- `usuarios`: usuários, perfis e alteração de senha.
- `relatorios`: estoque, movimentações, compras, vendas, reposição e auditoria.
- `licenciamento`: identificação da instalação, validação de arquivo assinado e status.
- `notificacoes`: alertas operacionais.

A entrada da API fica em `backend/src/server.ts`. Ela configura CORS, JSON body parser, healthcheck, rotas de módulos e handler global de erro.

## Autenticação e autorização

A autenticação usa JWT de curta duração e refresh token opaco persistido no banco. No refresh, o token antigo é revogado e um novo refresh token é emitido, reduzindo o risco de reuso prolongado.

A autorização é baseada em RBAC. As permissões são montadas no formato:

```text
modulo.tela.permissao
```

Exemplo:

```text
produtos.produtos_tela.editar
```

As rotas protegidas usam `authMiddleware` e, quando necessário, `permissionMiddleware`.

## Regras críticas de negócio

As regras centrais compartilhadas ficam em `backend/src/core/business-rules.ts`, facilitando testes unitários sem banco:

- cálculo de total de venda;
- validação de estoque disponível;
- baixa e estorno de estoque;
- status de recebimento de compra;
- sugestão de reposição;
- montagem de código RBAC.

## Licenciamento

Na inicialização, o backend garante um registro de configuração da instalação com `instalacaoId` e fingerprint de hardware. A ativação valida arquivo assinado por chave pública, confere instalação/fingerprint, impede replay por `nonceLicenca` e grava hashes da ativação.

As rotas públicas de licenciamento são limitadas por rate limit em memória para reduzir abuso em rede local. Se o sistema for exposto fora da rede interna, recomenda-se proxy reverso com TLS, allowlist de IPs e logs de acesso.

## CORS e segurança de borda

O CORS não usa mais `origin: "*"` por padrão. As origens permitidas vêm de `CORS_ORIGINS`, separadas por vírgula. Em desenvolvimento, o `.env.example` inclui origens localhost comuns.

Para produção:

1. defina `JWT_SECRET` forte e único;
2. defina `CORS_ORIGINS` apenas com domínios/IPs usados pelo frontend Web;
3. altere a senha do usuário `admin` no primeiro acesso;
4. execute migrations antes de iniciar a aplicação;
5. mantenha backup e restore testados.

## Docker

O backend usa build multi-stage:

1. instala dependências completas para build;
2. copia Prisma/schema/src e executa `npm run build`;
3. instala apenas dependências de produção na imagem final;
4. copia `dist`, Prisma schema/config e Prisma Client gerado.

## Testes

Os testes mínimos de backend rodam com Node Test Runner via `tsx`:

```bash
cd backend
npm test
```

A suíte cobre regras críticas sem depender de banco: login/token, refresh token, RBAC, venda, estorno, compra, OS e reposição.

## Evolução SAP-like e Fiscal ACBrLib/NfeWeb

O caminho definido para o KoreERP/ERP evoluir para uma plataforma SAP-like é manter o backend ERP como núcleo operacional e integrar o motor fiscal ACBrLibNFe por meio do gateway NfeWeb. O repositório NfeWeb documenta um laboratório em Oracle Cloud Ampere ARM Ubuntu 22.04 para compilar e validar `libacbrnfe_arm64.so`, com endpoints HTTP para diagnóstico da ACBrLib e operações NF-e como geração de chave, carregamento de INI, assinatura, validação de regras e status SEFAZ.

### Decisão arquitetural

Flutter Web não consegue carregar uma biblioteca `.so` local via FFI. Android e Desktop até podem usar FFI, mas isso exigiria empacotar builds diferentes da ACBrLib por arquitetura e sistema operacional. Por isso, a arquitetura inicial multiplataforma é:

```text
Flutter Web/Desktop/Android
        ↓ HTTP
KoreERP Backend / ou direto em rede confiável
        ↓ HTTP
NfeWeb API no Oracle ARM
        ↓ ctypes
ACBrLibNFe libacbrnfe_arm64.so
        ↓
SEFAZ / XML / Certificado A1
```

Essa arquitetura evita duplicar a ACBrLib dentro de cada cliente Flutter e mantém certificado, OpenSSL, logs e XML em um ambiente servidor controlado.

### Camada Flutter fiscal

O Flutter possui configuração separada para a API fiscal:

- `API_URL`: backend principal do ERP.
- `NFEWEB_API_URL`: gateway fiscal NfeWeb/ACBrLib.
- Web também aceita `localStorage['ERP_NFEWEB_API_URL']` para trocar o gateway sem recompilar.

O módulo `Fiscal NF-e` é a primeira camada de integração e deve evoluir de console operacional para fluxo completo:

1. diagnóstico de NfeWeb, ACBrLib e base fiscal;
2. seleção de emitente fiscal;
3. geração de chave NF-e;
4. status SEFAZ;
5. geração de XML a partir de vendas/OS;
6. assinatura, validação e transmissão;
7. armazenamento de XML autorizado e DANFE;
8. vínculo com financeiro/contabilidade.

### Próximos módulos SAP-like prioritários

1. Multiempresa/multifilial.
2. Pessoa única para clientes, fornecedores, transportadoras e emitentes.
3. Cadastro fiscal de produto: NCM, CEST, CFOP, CST/CSOSN, origem, unidade tributável e regras por UF.
4. Documento fiscal e eventos fiscais.
5. Contas a pagar/receber e caixa/bancos.
6. Centro de custo, plano de contas e lançamentos contábeis automáticos.
7. Workflow de aprovação para compras, pagamentos, cancelamentos e ajustes de estoque.
