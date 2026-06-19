import bcrypt from "bcrypt";
import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../core/prisma/prisma.js";

const VALOR_MINIMO = 69.9;
const DIAS_CICLO = 30;
const STATUS_ASSINATURA = ["ATIVA", "SUSPENSA", "CANCELADA", "INADIMPLENTE", "TESTE"];

function somenteNumeros(valor?: string) { return (valor ?? "").replace(/\D/g, ""); }
function proximaCobranca() { const data = new Date(); data.setDate(data.getDate() + DIAS_CICLO); return data; }
function assertTexto(valor: string | undefined, campo: string) { if (!valor?.trim()) throw new Error(`${campo} é obrigatório`); return valor.trim(); }
function validarEmail(email: string) { const v = assertTexto(email, "E-mail").toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw new Error("Informe um e-mail válido"); return v; }
function validarCnpj(cnpj: string) {
  const n = somenteNumeros(cnpj);
  if (n.length !== 14 || /^(\d)\1+$/.test(n)) throw new Error("Informe um CNPJ válido");
  const calc = (base: string, pesos: number[]) => {
    const soma = base.split("").reduce((t, d, i) => t + Number(d) * pesos[i], 0);
    const resto = soma % 11; return resto < 2 ? 0 : 11 - resto;
  };
  if (calc(n.slice(0, 12), [5,4,3,2,9,8,7,6,5,4,3,2]) !== Number(n[12]) || calc(n.slice(0, 13), [6,5,4,3,2,9,8,7,6,5,4,3,2]) !== Number(n[13])) throw new Error("Informe um CNPJ válido");
  return n;
}
function prismaAmigavel(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    const alvo = Array.isArray(error.meta?.target) ? error.meta?.target.join(", ") : String(error.meta?.target ?? "registro");
    if (alvo.includes("cnpj")) throw new Error("CNPJ já cadastrado");
    if (alvo.includes("email")) throw new Error("E-mail já cadastrado");
    if (alvo.includes("usuario")) throw new Error("Usuário já cadastrado");
    if (alvo.includes("codigo")) throw new Error("Código já cadastrado");
    throw new Error("Registro duplicado");
  }
  throw error;
}

export class SaasService {
  async listarPlanos(incluirInativos = false) { return prisma.saasPlano.findMany({ where: incluirInativos ? undefined : { ativo: true }, orderBy: { valorMensal: "asc" } }); }

  private async garantirPermissoesAdministrador(perfilId: string, tx: any = prisma) {
    const todasPerms = await tx.permissao.findMany({ where: { tela: { modulo: { codigo: { not: "saas" } } } } });
    for (const perm of todasPerms) await tx.perfilPermissao.upsert({ where: { perfilId_permissaoId: { perfilId, permissaoId: perm.id } }, update: {}, create: { perfilId, permissaoId: perm.id } });
  }

  async autoCadastro(data: { planoId: string; empresaNome: string; cnpj: string; responsavelNome: string; email: string; usuario: string; senha: string; }) {
    const plano = await prisma.saasPlano.findUnique({ where: { id: data.planoId } });
    if (!plano || !plano.ativo) throw new Error("Plano indisponível");
    if (Number(plano.valorMensal) < VALOR_MINIMO) throw new Error("O plano contratado deve ter valor mínimo de R$ 69,90");
    if (!data.senha || data.senha.length < 6) throw new Error("A senha deve ter pelo menos 6 caracteres");
    const empresaNome = assertTexto(data.empresaNome, "Nome da empresa");
    const responsavelNome = assertTexto(data.responsavelNome, "Nome do responsável");
    const cnpj = validarCnpj(data.cnpj);
    const email = validarEmail(data.email);
    const usuarioLogin = assertTexto(data.usuario, "Usuário").toLowerCase();
    const senhaHash = await bcrypt.hash(data.senha, 10);
    try { return await prisma.$transaction(async (tx) => {
      const empresa = await tx.empresa.create({ data: { nome: empresaNome, cnpj } });
      const filial = await tx.filial.create({ data: { empresaId: empresa.id, nome: "Matriz", cnpj } });
      const perfil = await tx.perfil.create({ data: { nome: `Administrador - ${empresaNome}`, descricao: "Administrador da empresa SaaS", empresaId: empresa.id, filialId: filial.id } });
      await this.garantirPermissoesAdministrador(perfil.id, tx);
      const usuario = await tx.usuario.create({ data: { nome: responsavelNome, email, usuario: usuarioLogin, senhaHash, perfilId: perfil.id, empresaId: empresa.id, filialId: filial.id } });
      await tx.usuarioFilial.create({ data: { usuarioId: usuario.id, empresaId: empresa.id, filialId: filial.id } });
      const assinatura = await tx.saasAssinatura.create({ data: { empresaId: empresa.id, planoId: plano.id, valorMensal: plano.valorMensal, proximaCobrancaEm: proximaCobranca() }, include: { plano: true, empresa: true } });
      await tx.auditoriaGeral.create({ data: { usuarioId: usuario.id, empresaId: empresa.id, filialId: filial.id, tabela: "saas_assinaturas", registro: assinatura.id, acao: "AUTO_CADASTRO" } });
      return { empresa, filial, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, usuario: usuario.usuario }, assinatura };
    }); } catch (e) { prismaAmigavel(e); }
  }

  async dashboard() {
    const [totalClientes, assinaturasAtivas, planos, assinaturas] = await Promise.all([prisma.empresa.count(), prisma.saasAssinatura.count({ where: { status: "ATIVA" } }), prisma.saasPlano.findMany({ orderBy: { valorMensal: "asc" } }), prisma.saasAssinatura.findMany({ include: { empresa: true, plano: true }, orderBy: { criadoEm: "desc" } })]);
    const receitaMensal = assinaturas.filter((a) => a.status === "ATIVA").reduce((t, a) => t + Number(a.valorMensal), 0);
    return { totalClientes, assinaturasAtivas, receitaMensal, planos, assinaturas };
  }

  async salvarPlano(data: { id?: string; codigo: string; nome: string; descricao?: string; valorMensal: number; limiteUsuarios: number; limiteFiliais: number; ativo: boolean }) {
    if (Number(data.valorMensal) < VALOR_MINIMO) throw new Error("O valor mínimo do plano é R$ 69,90");
    if (Number(data.limiteUsuarios) < 1 || Number(data.limiteFiliais) < 1) throw new Error("Limites do plano devem ser maiores que zero");
    if (data.id) {
      const excedidas = await prisma.saasAssinatura.findMany({ where: { planoId: data.id, status: "ATIVA" }, include: { empresa: { include: { filiais: true } } } });
      for (const a of excedidas) {
        const usuarios = await prisma.usuario.count({ where: { empresaId: a.empresaId, ativo: true } });
        if (usuarios > data.limiteUsuarios || a.empresa.filiais.filter((f) => f.ativo).length > data.limiteFiliais) throw new Error("Downgrade bloqueado: existem clientes ativos acima dos novos limites do plano");
      }
    }
    const payload = { codigo: assertTexto(data.codigo, "Código").toUpperCase(), nome: assertTexto(data.nome, "Nome"), descricao: data.descricao?.trim(), valorMensal: data.valorMensal, limiteUsuarios: data.limiteUsuarios, limiteFiliais: data.limiteFiliais, ativo: data.ativo };
    try { return data.id ? await prisma.saasPlano.update({ where: { id: data.id }, data: payload }) : await prisma.saasPlano.create({ data: payload }); } catch (e) { prismaAmigavel(e); }
  }

  async atualizarAssinatura(id: string, status: string) {
    if (!STATUS_ASSINATURA.includes(status)) throw new Error("Status de assinatura inválido");
    return prisma.saasAssinatura.update({ where: { id }, data: { status, canceladaEm: status === "CANCELADA" ? new Date() : null }, include: { empresa: true, plano: true } });
  }
}
