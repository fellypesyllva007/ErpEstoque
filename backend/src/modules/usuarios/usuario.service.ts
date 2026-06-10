import bcrypt from "bcrypt";
import { prisma } from "../../core/prisma/prisma.js";
import { CreateUsuarioDto, UpdateUsuarioDto, AlterarSenhaDto } from "./usuario.types.js";

export class UsuarioService {
  async listar() {
    return prisma.usuario.findMany({
      select: { id: true, nome: true, email: true, usuario: true, ativo: true, perfil: true, ultimoLogin: true, criadoEm: true },
      orderBy: { nome: "asc" },
    });
  }

  async buscarPorId(id: string) {
    return prisma.usuario.findUnique({
      where: { id },
      select: { id: true, nome: true, email: true, usuario: true, ativo: true, perfil: true, ultimoLogin: true, criadoEm: true },
    });
  }

  async criar(data: CreateUsuarioDto) {
    const senhaHash = await bcrypt.hash(data.senha, 12);
    return prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        usuario: data.usuario,
        senhaHash,
        perfilId: data.perfilId,
      },
      select: { id: true, nome: true, email: true, usuario: true, ativo: true, perfil: true },
    });
  }

  async atualizar(id: string, data: UpdateUsuarioDto) {
    return prisma.usuario.update({
      where: { id },
      data,
      select: { id: true, nome: true, email: true, usuario: true, ativo: true, perfil: true },
    });
  }

  async alterarSenha(id: string, data: AlterarSenhaDto) {
    const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id } });
    const senhaValida = await bcrypt.compare(data.senhaAtual, usuario.senhaHash);
    if (!senhaValida) throw new Error("Senha atual incorreta");
    const senhaHash = await bcrypt.hash(data.novaSenha, 12);
    return prisma.usuario.update({ where: { id }, data: { senhaHash } });
  }

  async listarPerfis() {
    return prisma.perfil.findMany({ orderBy: { nome: "asc" } });
  }
}
