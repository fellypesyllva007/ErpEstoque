import { prisma } from "../../core/prisma/prisma.js";

import {
  CreateCategoriaDto,
  UpdateCategoriaDto,
} from "./categoria.types.js";

export class CategoriaService {
  async listar() {
    return prisma.categoriaProduto.findMany({
      orderBy: {
        nome: "asc",
      },
    });
  }

  async buscarPorId(id: string) {
    return prisma.categoriaProduto.findUnique({
      where: { id },
    });
  }

  async criar(data: CreateCategoriaDto) {
    return prisma.categoriaProduto.create({
      data: {
        nome: data.nome,
        descricao: data.descricao,
      },
    });
  }

  async atualizar(
    id: string,
    data: UpdateCategoriaDto
  ) {
    return prisma.categoriaProduto.update({
      where: { id },
      data,
    });
  }
}
