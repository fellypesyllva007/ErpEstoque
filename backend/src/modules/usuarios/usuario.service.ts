import bcrypt from "bcrypt";
import { prisma } from "../../core/prisma/prisma.js";
import { TenantContext, tenantCreate, tenantWhere } from "../../core/tenant.js";
import { CreateUsuarioDto, UpdateUsuarioDto, AlterarSenhaDto } from "./usuario.types.js";

export class UsuarioService {
  async listar(ctx: TenantContext) {
    return prisma.usuario.findMany({
      where: tenantWhere(ctx),
      select: { id: true, nome: true, email: true, usuario: true, ativo: true, perfil: true, ultimoLogin: true, criadoEm: true, empresaId: true, filialId: true },
      orderBy: { nome: "asc" },
    });
  }

  async buscarPorId(ctx: TenantContext, id: string) {
    return prisma.usuario.findFirst({
      where: { id, ...tenantWhere(ctx) },
      select: { id: true, nome: true, email: true, usuario: true, ativo: true, perfil: true, ultimoLogin: true, criadoEm: true, empresaId: true, filialId: true },
    });
  }

  async criar(ctx: TenantContext, data: CreateUsuarioDto) {
    const assinatura = await prisma.saasAssinatura.findFirst({ where: { empresaId: ctx.empresaId, status: "ATIVA" }, orderBy: { criadoEm: "desc" }, include: { plano: true } });
    if (assinatura) {
      const usuariosAtivos = await prisma.usuario.count({ where: { empresaId: ctx.empresaId, ativo: true } });
      if (usuariosAtivos >= assinatura.plano.limiteUsuarios) throw new Error(`Limite de usuários do plano atingido (${assinatura.plano.limiteUsuarios})`);
    }
    await prisma.perfil.findFirstOrThrow({ where: { id: data.perfilId, empresaId: ctx.empresaId } });
    const senhaHash = await bcrypt.hash(data.senha, 12);
    const usuario = await prisma.usuario.create({
      data: { nome: data.nome, email: data.email, usuario: data.usuario, senhaHash, perfilId: data.perfilId, senhaTemporaria: true, ...tenantCreate(ctx) },
      select: { id: true, nome: true, email: true, usuario: true, ativo: true, perfil: true },
    });
    await prisma.usuarioFilial.create({ data: { usuarioId: usuario.id, ...tenantCreate(ctx) } });
    return usuario;
  }

  async atualizar(ctx: TenantContext, id: string, data: UpdateUsuarioDto) {
    const atual = await this.buscarPorId(ctx, id);
    if (!atual) throw new Error("Usuário não encontrado");
    return prisma.usuario.update({ where: { id }, data, select: { id: true, nome: true, email: true, usuario: true, ativo: true, perfil: true } });
  }

  async alterarSenha(id: string, data: AlterarSenhaDto) {
    const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id } });
    const senhaValida = await bcrypt.compare(data.senhaAtual, usuario.senhaHash);
    if (!senhaValida) throw new Error("Senha atual incorreta");
    const senhaHash = await bcrypt.hash(data.novaSenha, 12);
    return prisma.usuario.update({ where: { id }, data: { senhaHash, senhaTemporaria: false } });
  }

  async listarPerfis(ctx: TenantContext) {
    return prisma.perfil.findMany({ where: { empresaId: ctx.empresaId }, orderBy: { nome: "asc" } });
  }
}
