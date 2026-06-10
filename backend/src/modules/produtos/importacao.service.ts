import { prisma } from "../../core/prisma/prisma.js";
import { registrarAuditoria } from "../../core/auditoria.js";

export interface LinhaImportacao {
  codigoInterno: string;
  nome: string;
  categoriaNome: string;
  marcaNome: string;
  custo: number;
  precoVenda: number;
  estoqueAtual?: number;
  estoqueMinimo?: number;
  localizacaoFisica?: string;
}

export class ImportacaoService {
  async importarProdutos(linhas: LinhaImportacao[], usuarioId: string) {
    const resultado = { criados: 0, atualizados: 0, erros: [] as string[] };

    for (const linha of linhas) {
      try {
        // Buscar ou criar categoria
        let categoria = await prisma.categoriaProduto.findFirst({ where: { nome: { equals: linha.categoriaNome, mode: "insensitive" } } });
        if (!categoria) {
          categoria = await prisma.categoriaProduto.create({ data: { nome: linha.categoriaNome } });
        }

        // Buscar ou criar marca
        let marca = await prisma.marca.findFirst({ where: { nome: { equals: linha.marcaNome, mode: "insensitive" } } });
        if (!marca) {
          marca = await prisma.marca.create({ data: { nome: linha.marcaNome } });
        }

        const existente = await prisma.produto.findUnique({ where: { codigoInterno: linha.codigoInterno } });

        if (existente) {
          await prisma.produto.update({
            where: { codigoInterno: linha.codigoInterno },
            data: {
              nome: linha.nome,
              categoriaId: categoria.id,
              marcaId: marca.id,
              custo: linha.custo,
              precoVenda: linha.precoVenda,
              estoqueMinimo: linha.estoqueMinimo ?? existente.estoqueMinimo,
              localizacaoFisica: linha.localizacaoFisica,
            },
          });
          resultado.atualizados++;
        } else {
          const novo = await prisma.produto.create({
            data: {
              codigoInterno: linha.codigoInterno,
              nome: linha.nome,
              categoriaId: categoria.id,
              marcaId: marca.id,
              custo: linha.custo,
              precoVenda: linha.precoVenda,
              estoqueAtual: linha.estoqueAtual ?? 0,
              estoqueMinimo: linha.estoqueMinimo ?? 0,
              localizacaoFisica: linha.localizacaoFisica,
            },
          });
          await registrarAuditoria({ usuarioId, tabela: "produtos", registro: novo.id, acao: "IMPORTAR" });
          resultado.criados++;
        }
      } catch (e) {
        resultado.erros.push(`Linha ${linha.codigoInterno}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    return resultado;
  }

  templateColunas() {
    return [
      "codigoInterno", "nome", "categoriaNome", "marcaNome",
      "custo", "precoVenda", "estoqueAtual", "estoqueMinimo", "localizacaoFisica",
    ];
  }
}
