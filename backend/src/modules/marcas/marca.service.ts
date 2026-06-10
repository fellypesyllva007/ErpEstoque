import { prisma } from "../../core/prisma/prisma.js";
import { CreateMarcaDto, UpdateMarcaDto } from "./marca.types.js";

export class MarcaService {
  async listar() {
    return prisma.marca.findMany({ orderBy: { nome: "asc" } });
  }

  async buscarPorId(id: string) {
    return prisma.marca.findUnique({ where: { id } });
  }

  async criar(data: CreateMarcaDto) {
    return prisma.marca.create({ data });
  }

  async atualizar(id: string, data: UpdateMarcaDto) {
    return prisma.marca.update({ where: { id }, data });
  }

  async excluir(id: string) {
    return prisma.marca.delete({ where: { id } });
  }
}
