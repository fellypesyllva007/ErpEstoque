import { prisma } from "../../core/prisma/prisma.js";
import { CreateFornecedorDto, UpdateFornecedorDto } from "./fornecedor.types.js";

export class FornecedorService {
  async listar() {
    return prisma.fornecedor.findMany({ orderBy: { nome: "asc" } });
  }

  async buscarPorId(id: string) {
    return prisma.fornecedor.findUnique({ where: { id } });
  }

  async criar(data: CreateFornecedorDto) {
    return prisma.fornecedor.create({ data });
  }

  async atualizar(id: string, data: UpdateFornecedorDto) {
    return prisma.fornecedor.update({ where: { id }, data });
  }

  async excluir(id: string) {
    return prisma.fornecedor.update({ where: { id }, data: { ativo: false } });
  }
}
