import { prisma } from "../../core/prisma/prisma.js";
import { CreateClienteDto, UpdateClienteDto } from "./cliente.types.js";

export class ClienteService {
  async listar() {
    return prisma.cliente.findMany({ orderBy: { nome: "asc" } });
  }

  async buscarPorId(id: string) {
    return prisma.cliente.findUnique({ where: { id } });
  }

  async criar(data: CreateClienteDto) {
    return prisma.cliente.create({ data });
  }

  async atualizar(id: string, data: UpdateClienteDto) {
    return prisma.cliente.update({ where: { id }, data });
  }

  async excluir(id: string) {
    return prisma.cliente.update({ where: { id }, data: { ativo: false } });
  }
}
