import { Request, Response } from "express";
import { prisma } from "../../core/prisma/prisma.js";

import { LicenciamentoService } from "./licenciamento.service.js";
import { ActivationFile } from "./licenciamento.types.js";

export class LicenciamentoController {
  private service =
    new LicenciamentoService();

  async info(_req: Request, res: Response) {
    const config =
      await prisma.configuracaoSistema.findFirst();

    if (!config) {
      return res.status(404).json({
        message: "Configuração não encontrada",
      });
    }

    return res.json({
      instalacaoId: config.instalacaoId,
      hardwareFingerprint:
        config.hardwareFingerprint,
      versaoSistema:
        config.versaoSistema,
      licencaStatus:
        config.licencaStatus,
      licencaPlano:
        config.licencaPlano,
      cnpj:
        config.cnpj,
    });
  }

  async validar(req: Request, res: Response) {
    const activation =
      req.body as ActivationFile;

    const valido =
      await this.service.ativarLicenca(
        activation
      );

    return res.json({
      valido,
    });
  }
  async status(_req: Request, res: Response) {
    const valida =
      await this.service.isLicencaValida();

    return res.json({
      valida,
    });
  }

}
