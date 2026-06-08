import { prisma } from "../src/core/prisma/prisma.js";

async function main() {
  console.log("🌱 Iniciando seed...");

  const perfis = [
    "Administrador",
    "Gerente",
    "Atendente",
    "Técnico",
    "Estoquista",
  ];

  for (const nome of perfis) {
    await prisma.perfil.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
  }

  console.log("✅ Perfis criados");

  const modulos = [
    { codigo: "dashboard", nome: "Dashboard" },
    { codigo: "produtos", nome: "Produtos" },
    { codigo: "estoque", nome: "Estoque" },
    { codigo: "compras", nome: "Compras" },
    { codigo: "vendas", nome: "Vendas" },
    { codigo: "os", nome: "Ordens de Serviço" },
    { codigo: "clientes", nome: "Clientes" },
    { codigo: "fornecedores", nome: "Fornecedores" },
    { codigo: "relatorios", nome: "Relatórios" },
    { codigo: "usuarios", nome: "Usuários" },
    { codigo: "configuracoes", nome: "Configurações" },
    { codigo: "notificacoes", nome: "Notificações" },
  ];

  for (const modulo of modulos) {
    await prisma.modulo.upsert({
      where: { codigo: modulo.codigo },
      update: { nome: modulo.nome },
      create: modulo,
    });
  }

  console.log("✅ Módulos criados");

  const moduloProdutos = await prisma.modulo.findUniqueOrThrow({
    where: { codigo: "produtos" },
  });

  const telasProdutos = [
    { codigo: "menu", nome: "Menu" },
    { codigo: "produtos_tela", nome: "Produtos" },
    { codigo: "categorias", nome: "Categorias" },
  ];

  for (const tela of telasProdutos) {
    await prisma.tela.upsert({
      where: {
        moduloId_codigo: {
          moduloId: moduloProdutos.id,
          codigo: tela.codigo,
        },
      },
      update: {
        nome: tela.nome,
      },
      create: {
        moduloId: moduloProdutos.id,
        codigo: tela.codigo,
        nome: tela.nome,
      },
    });
  }

  console.log("✅ Telas de Produtos criadas");

  const permissoesPorTela = {
    menu: [
      "visualizar",
    ],
    produtos_tela: [
      "visualizar",
      "criar",
      "editar",
      "excluir",
      "importar_excel",
      "exportar_excel",
      "alterar_custo",
    ],
    categorias: [
      "visualizar",
      "criar",
      "editar",
      "excluir",
    ],
  };

  const telas = await prisma.tela.findMany({
    where: {
      moduloId: moduloProdutos.id,
    },
  });

  for (const tela of telas) {
    const permissoes =
      permissoesPorTela[
        tela.codigo as keyof typeof permissoesPorTela
      ] ?? [];

    for (const codigo of permissoes) {
      await prisma.permissao.upsert({
        where: {
          telaId_codigo: {
            telaId: tela.id,
            codigo,
          },
        },
        update: {},
        create: {
          telaId: tela.id,
          codigo,
          nome: codigo,
        },
      });
    }
  }

  console.log("✅ Permissões de Produtos criadas");

  const perfilAdministrador =
    await prisma.perfil.findUniqueOrThrow({
      where: {
        nome: "Administrador",
      },
    });

  const todasPermissoes =
    await prisma.permissao.findMany();

  for (const permissao of todasPermissoes) {
    await prisma.perfilPermissao.upsert({
      where: {
        perfilId_permissaoId: {
          perfilId: perfilAdministrador.id,
          permissaoId: permissao.id,
        },
      },
      update: {},
      create: {
        perfilId: perfilAdministrador.id,
        permissaoId: permissao.id,
      },
    });
  }

  console.log(
    "✅ Permissões atribuídas ao Administrador"
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
