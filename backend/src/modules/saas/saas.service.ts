import bcrypt from "bcrypt";
import { prisma } from "../../core/prisma/prisma.js";

const VALOR_MINIMO = 69.9;
const DIAS_CICLO = 30;

function somenteNumeros(valor?: string) {
  return (valor ?? "").replace(/\D/g, "");
}

function proximaCobranca() {
  const data = new Date();
  data.setDate(data.getDate() + DIAS_CICLO);
  return data;
}

export class SaasService {
  async listarPlanos(incluirInativos = false) {
    return prisma.saasPlano.findMany({
      where: incluirInativos ? undefined : { ativo: true },
      orderBy: { valorMensal: "asc" },
    });
  }

  async autoCadastro(data: {
    planoId: string;
    empresaNome: string;
    cnpj: string;
    responsavelNome: string;
    email: string;
    usuario: string;
    senha: string;
  }) {
    const plano = await prisma.saasPlano.findUnique({ where: { id: data.planoId } });
    if (!plano || !plano.ativo) throw new Error("Plano indisponível");
    if (Number(plano.valorMensal) < VALOR_MINIMO) throw new Error("O plano contratado deve ter valor mínimo de R$ 69,90");
    if (!data.senha || data.senha.length < 6) throw new Error("A senha deve ter pelo menos 6 caracteres");

    const cnpj = somenteNumeros(data.cnpj);
    const email = data.email.trim().toLowerCase();
    const usuarioLogin = data.usuario.trim().toLowerCase();
    const senhaHash = await bcrypt.hash(data.senha, 10);

    return prisma.$transaction(async (tx) => {
      const perfil = await tx.perfil.upsert({
        where: { nome: "Administrador" },
        update: {},
        create: { nome: "Administrador", descricao: "Administrador da empresa SaaS" },
      });

      const empresa = await tx.empresa.create({ data: { nome: data.empresaNome.trim(), cnpj } });
      const filial = await tx.filial.create({ data: { empresaId: empresa.id, nome: "Matriz", cnpj } });
      const usuario = await tx.usuario.create({
        data: {
          nome: data.responsavelNome.trim(),
          email,
          usuario: usuarioLogin,
          senhaHash,
          perfilId: perfil.id,
          empresaId: empresa.id,
          filialId: filial.id,
        },
      });
      await tx.usuarioFilial.create({ data: { usuarioId: usuario.id, empresaId: empresa.id, filialId: filial.id } });
      const assinatura = await tx.saasAssinatura.create({
        data: {
          empresaId: empresa.id,
          planoId: plano.id,
          valorMensal: plano.valorMensal,
          proximaCobrancaEm: proximaCobranca(),
        },
        include: { plano: true, empresa: true },
      });
      await tx.auditoriaGeral.create({ data: { usuarioId: usuario.id, empresaId: empresa.id, filialId: filial.id, tabela: "saas_assinaturas", registro: assinatura.id, acao: "AUTO_CADASTRO" } });

      return { empresa, filial, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, usuario: usuario.usuario }, assinatura };
    });
  }

  async dashboard() {
    const [totalClientes, assinaturasAtivas, planos, assinaturas] = await Promise.all([
      prisma.empresa.count(),
      prisma.saasAssinatura.count({ where: { status: "ATIVA" } }),
      prisma.saasPlano.findMany({ orderBy: { valorMensal: "asc" } }),
      prisma.saasAssinatura.findMany({ include: { empresa: true, plano: true }, orderBy: { criadoEm: "desc" } }),
    ]);
    const receitaMensal = assinaturas.filter((a) => a.status === "ATIVA").reduce((t, a) => t + Number(a.valorMensal), 0);
    return { totalClientes, assinaturasAtivas, receitaMensal, planos, assinaturas };
  }

  async salvarPlano(data: { id?: string; codigo: string; nome: string; descricao?: string; valorMensal: number; limiteUsuarios: number; limiteFiliais: number; ativo: boolean }) {
    if (Number(data.valorMensal) < VALOR_MINIMO) throw new Error("O valor mínimo do plano é R$ 69,90");
    const payload = { codigo: data.codigo.trim().toUpperCase(), nome: data.nome.trim(), descricao: data.descricao, valorMensal: data.valorMensal, limiteUsuarios: data.limiteUsuarios, limiteFiliais: data.limiteFiliais, ativo: data.ativo };
    return data.id ? prisma.saasPlano.update({ where: { id: data.id }, data: payload }) : prisma.saasPlano.create({ data: payload });
  }

  async atualizarAssinatura(id: string, status: string) {
    return prisma.saasAssinatura.update({ where: { id }, data: { status, canceladaEm: status === "CANCELADA" ? new Date() : null }, include: { empresa: true, plano: true } });
  }
}
