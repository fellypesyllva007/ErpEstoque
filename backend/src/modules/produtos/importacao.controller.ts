import { Response } from "express";
import { ImportacaoService } from "./importacao.service.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

export class ImportacaoController {
  private s = new ImportacaoService();

  async importar(req: AuthRequest, res: Response) {
    try {
      const { linhas } = req.body as { linhas: any[] };
      if (!Array.isArray(linhas) || linhas.length === 0) {
        return res.status(400).json({ message: "Nenhuma linha enviada" });
      }
      const resultado = await this.s.importarProdutos(linhas, req.user!.sub);
      return res.json(resultado);
    } catch (e) {
      return res.status(400).json({ message: e instanceof Error ? e.message : "Erro na importação" });
    }
  }

  template(_req: AuthRequest, res: Response) {
    const colunas = new ImportacaoService().templateColunas();
    const exemplo = [
      "IPHONE14-BAT,Bateria iPhone 14,Bateria,Apple,85.00,149.90,10,3,Prateleira A1",
      "SAM-A54-TELA,Tela Samsung A54,Tela,Samsung,120.00,220.00,5,2,Prateleira B3",
    ];
    const csv = [colunas.join(","), ...exemplo].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=template_importacao.csv");
    return res.send("\uFEFF" + csv);
  }
}
