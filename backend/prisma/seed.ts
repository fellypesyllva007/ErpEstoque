import bcrypt from "bcrypt";
import { prisma } from "../src/core/prisma/prisma.js";

async function main() {
  console.log("🌱 Iniciando seed v2...");

  const empresa = await prisma.empresa.upsert({
    where: { cnpj: "00000000000191" },
    update: { nome: "KoreERP Demonstração" },
    create: { nome: "KoreERP Demonstração", cnpj: "00000000000191" },
  });
  const filial = await prisma.filial.upsert({
    where: { cnpj: "00000000000272" },
    update: { nome: "Matriz", empresaId: empresa.id },
    create: { nome: "Matriz", cnpj: "00000000000272", empresaId: empresa.id },
  });
  console.log("✅ Empresa e filial demo criadas");

  // Perfis
  const perfisNomes = ["Administrador", "Administrador SaaS", "Gerente", "Atendente", "Técnico", "Estoquista"];
  for (const nome of perfisNomes) {
    await prisma.perfil.upsert({ where: { nome }, update: { empresaId: empresa.id, filialId: filial.id }, create: { nome, empresaId: empresa.id, filialId: filial.id } });
  }
  console.log("✅ Perfis criados");

  // Módulos e telas
  const modulos = [
    { codigo: "dashboard", nome: "Dashboard",
      telas: [{ codigo: "inicio", nome: "Início", perms: ["visualizar"] }] },
    { codigo: "produtos", nome: "Produtos",
      telas: [
        { codigo: "produtos_tela", nome: "Produtos", perms: ["visualizar","criar","editar","excluir","importar_excel","exportar_excel"] },
        { codigo: "categorias", nome: "Categorias", perms: ["visualizar","criar","editar","excluir"] },
        { codigo: "marcas", nome: "Marcas", perms: ["visualizar","criar","editar","excluir"] },
      ]},
    { codigo: "estoque", nome: "Estoque",
      telas: [{ codigo: "movimentacoes", nome: "Movimentações", perms: ["visualizar","criar"] }] },
    { codigo: "compras", nome: "Compras",
      telas: [{ codigo: "pedidos", nome: "Pedidos", perms: ["visualizar","criar","receber","cancelar"] }] },
    { codigo: "vendas", nome: "Vendas",
      telas: [
        { codigo: "lista", nome: "Lista de Vendas", perms: ["visualizar","criar","cancelar"] },
        { codigo: "relatorios", nome: "Relatórios de Vendas", perms: ["visualizar"] },
      ]},
    { codigo: "os", nome: "Ordens de Serviço",
      telas: [{ codigo: "lista", nome: "Lista", perms: ["visualizar","criar","editar"] }] },
    { codigo: "clientes", nome: "Clientes",
      telas: [{ codigo: "lista", nome: "Lista", perms: ["visualizar","criar","editar","excluir"] }] },
    { codigo: "fornecedores", nome: "Fornecedores",
      telas: [{ codigo: "lista", nome: "Lista", perms: ["visualizar","criar","editar","excluir"] }] },
    { codigo: "relatorios", nome: "Relatórios",
      telas: [
        { codigo: "estoque", nome: "Estoque", perms: ["visualizar"] },
        { codigo: "vendas", nome: "Vendas", perms: ["visualizar"] },
        { codigo: "compras", nome: "Compras", perms: ["visualizar"] },
        { codigo: "auditoria", nome: "Auditoria", perms: ["visualizar"] },
      ]},
    { codigo: "usuarios", nome: "Usuários",
      telas: [{ codigo: "lista", nome: "Lista", perms: ["visualizar","criar","editar"] }] },
    { codigo: "cadastros", nome: "Cadastros",
      telas: [{ codigo: "base", nome: "Cadastros base", perms: ["visualizar","criar","editar","excluir"] }] },
    { codigo: "financeiro", nome: "Financeiro",
      telas: [{ codigo: "painel", nome: "Painel Financeiro", perms: ["visualizar","criar","baixar","estornar"] }] },
    { codigo: "saas", nome: "Administração SaaS",
      telas: [{ codigo: "admin", nome: "Admin SaaS", perms: ["gerenciar"] }] },
  ];

  for (const mod of modulos) {
    const modRec = await prisma.modulo.upsert({
      where: { codigo: mod.codigo }, update: { nome: mod.nome }, create: { codigo: mod.codigo, nome: mod.nome },
    });
    for (const tela of mod.telas) {
      const telaRec = await prisma.tela.upsert({
        where: { moduloId_codigo: { moduloId: modRec.id, codigo: tela.codigo } },
        update: { nome: tela.nome },
        create: { moduloId: modRec.id, codigo: tela.codigo, nome: tela.nome },
      });
      for (const p of tela.perms) {
        await prisma.permissao.upsert({
          where: { telaId_codigo: { telaId: telaRec.id, codigo: p } },
          update: {}, create: { telaId: telaRec.id, codigo: p, nome: p },
        });
      }
    }
  }
  console.log("✅ Módulos, telas e permissões criados");

  // Perfil Administrador recebe todas as permissões
  const perfilAdmin = await prisma.perfil.findUniqueOrThrow({ where: { nome: "Administrador" } });
  const todasPerms = await prisma.permissao.findMany();
  for (const perm of todasPerms) {
    await prisma.perfilPermissao.upsert({
      where: { perfilId_permissaoId: { perfilId: perfilAdmin.id, permissaoId: perm.id } },
      update: {}, create: { perfilId: perfilAdmin.id, permissaoId: perm.id },
    });
  }
  console.log("✅ Permissões atribuídas ao Administrador");

  const perfilAdminSaas = await prisma.perfil.findUniqueOrThrow({ where: { nome: "Administrador SaaS" } });
  const permsSaas = await prisma.permissao.findMany({ where: { tela: { modulo: { codigo: "saas" } } } });
  for (const perm of permsSaas) {
    await prisma.perfilPermissao.upsert({
      where: { perfilId_permissaoId: { perfilId: perfilAdminSaas.id, permissaoId: perm.id } },
      update: {}, create: { perfilId: perfilAdminSaas.id, permissaoId: perm.id },
    });
  }
  console.log("✅ Permissões SaaS atribuídas ao Administrador SaaS");

  // Perfil Gerente — tudo exceto usuários e auditoria
  const perfilGerente = await prisma.perfil.findUniqueOrThrow({ where: { nome: "Gerente" } });
  const permsGerente = await prisma.permissao.findMany({
    where: { tela: { modulo: { codigo: { notIn: ["usuarios"] } }, codigo: { not: "auditoria" } } },
  });
  for (const perm of permsGerente) {
    await prisma.perfilPermissao.upsert({
      where: { perfilId_permissaoId: { perfilId: perfilGerente.id, permissaoId: perm.id } },
      update: {}, create: { perfilId: perfilGerente.id, permissaoId: perm.id },
    });
  }

  // Perfil Atendente — vendas, OS, clientes (visualizar+criar)
  const perfilAtend = await prisma.perfil.findUniqueOrThrow({ where: { nome: "Atendente" } });
  const permsAtend = await prisma.permissao.findMany({
    where: {
      codigo: { in: ["visualizar", "criar"] },
      tela: { modulo: { codigo: { in: ["dashboard", "vendas", "os", "clientes"] } } },
    },
  });
  for (const perm of permsAtend) {
    await prisma.perfilPermissao.upsert({
      where: { perfilId_permissaoId: { perfilId: perfilAtend.id, permissaoId: perm.id } },
      update: {}, create: { perfilId: perfilAtend.id, permissaoId: perm.id },
    });
  }

  // Perfil Estoquista — estoque, produtos, compras
  const perfilEstq = await prisma.perfil.findUniqueOrThrow({ where: { nome: "Estoquista" } });
  const permsEstq = await prisma.permissao.findMany({
    where: {
      tela: { modulo: { codigo: { in: ["dashboard", "estoque", "produtos", "compras", "fornecedores"] } } },
    },
  });
  for (const perm of permsEstq) {
    await prisma.perfilPermissao.upsert({
      where: { perfilId_permissaoId: { perfilId: perfilEstq.id, permissaoId: perm.id } },
      update: {}, create: { perfilId: perfilEstq.id, permissaoId: perm.id },
    });
  }

  console.log("✅ Permissões por perfil configuradas");

  // Marcas padrão
  const marcas = ["Apple", "Samsung", "Motorola", "Xiaomi", "LG", "Huawei", "OnePlus", "Asus", "Sony"];
  for (const nome of marcas) {
    await prisma.marca.upsert({ where: { nome }, update: {}, create: { nome } });
  }

  // Categorias padrão
  const categorias = ["Bateria", "Tela", "Conector de Carga", "Câmera", "Alto-falante", "Microfone", "Carcaça", "Placa", "Cabo Flex", "Película"];
  for (const nome of categorias) {
    try { await prisma.categoriaProduto.create({ data: { nome } }); } catch (_) {}
  }

  console.log("✅ Marcas e categorias padrão criadas");

  // Usuário admin padrão
  const senhaHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.usuario.upsert({
    where: { usuario: "admin" },
    update: { empresaId: empresa.id, filialId: filial.id },
    create: { nome: "Administrador", email: "admin@erp.com", usuario: "admin", senhaHash, perfilId: perfilAdmin.id, empresaId: empresa.id, filialId: filial.id, senhaTemporaria: true },
  });
  await prisma.usuarioFilial.upsert({
    where: { usuarioId_empresaId_filialId: { usuarioId: admin.id, empresaId: empresa.id, filialId: filial.id } },
    update: { ativo: true },
    create: { usuarioId: admin.id, empresaId: empresa.id, filialId: filial.id },
  });

  for (const item of [
    prisma.unidadeMedida.upsert({ where: { empresaId_sigla: { empresaId: empresa.id, sigla: "UN" } }, update: {}, create: { empresaId: empresa.id, filialId: filial.id, sigla: "UN", descricao: "Unidade" } }),
    prisma.formaPagamento.upsert({ where: { empresaId_nome: { empresaId: empresa.id, nome: "Dinheiro" } }, update: {}, create: { empresaId: empresa.id, filialId: filial.id, nome: "Dinheiro", tipo: "DINHEIRO" } }),
    prisma.condicaoPagamento.upsert({ where: { empresaId_nome: { empresaId: empresa.id, nome: "À vista" } }, update: {}, create: { empresaId: empresa.id, filialId: filial.id, nome: "À vista", parcelas: 1, intervaloDias: 0 } }),
    prisma.centroCusto.upsert({ where: { empresaId_codigo: { empresaId: empresa.id, codigo: "ADM" } }, update: {}, create: { empresaId: empresa.id, filialId: filial.id, codigo: "ADM", nome: "Administrativo" } }),
    prisma.contaContabil.upsert({ where: { empresaId_codigo: { empresaId: empresa.id, codigo: "1.1.01" } }, update: {}, create: { empresaId: empresa.id, filialId: filial.id, codigo: "1.1.01", nome: "Caixa", tipo: "ATIVO" } }),
  ]) await item;
  console.log("✅ Usuário admin criado  →  usuario: admin  |  senha: admin123");
  console.log("🎉 Seed concluído!");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
