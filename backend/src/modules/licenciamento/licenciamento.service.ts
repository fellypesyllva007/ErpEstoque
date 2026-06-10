import crypto from "crypto";
import { prisma } from "../../core/prisma/prisma.js";

import { HardwareFingerprintService } from "./hardware-fingerprint.service.js";
import { ActivationService } from "./activation.service.js";
import { ActivationFile } from "./licenciamento.types.js";

export class LicenciamentoService {
  private fingerprintService =
    new HardwareFingerprintService();

  private activationService =
    new ActivationService();

  async inicializar(): Promise<void> {
    let config =
      await prisma.configuracaoSistema.findFirst();

    if (config) {
      return;
    }

    const instalacaoId = crypto.randomUUID();

    const hardwareFingerprint =
      this.fingerprintService.gerarFingerprint();

    config =
      await prisma.configuracaoSistema.create({
        data: {
          instalacaoId,
          hardwareFingerprint,
          versaoSistema: "1.0.0",
          licencaStatus: "PENDENTE",
        },
      });

    console.log(
      "[LICENCIAMENTO] Instalação criada:",
      config.instalacaoId
    );
  }

  async validarLicenca(
    activation: ActivationFile
  ): Promise<boolean> {
    return this.activationService.validarArquivo(
      activation
    );
  }

  async ativarLicenca(
    activation: ActivationFile
  ): Promise<boolean> {
    const assinaturaValida =
      this.activationService.validarArquivo(
        activation
      );

    if (!assinaturaValida) {
      return false;
    }

    const config =
      await prisma.configuracaoSistema.findFirst();

    if (!config) {
      return false;
    }

    if (
      activation.payload.instalacaoId !==
      config.instalacaoId
    ) {
      return false;
    }

    if (
      activation.payload.hardwareFingerprint !==
      config.hardwareFingerprint
    ) {
      return false;
    }

    const nonceAtual =
      config.nonceLicenca ?? 0;

    if (
      activation.payload.nonceLicenca <=
      nonceAtual
    ) {
      return false;
    }

    const agora = new Date();

    const expiraEm = new Date(
      activation.payload.expiraEm
    );

    if (expiraEm < agora) {
      return false;
    }

    const activationHash = crypto
      .createHash("sha256")
      .update(
        JSON.stringify(
          activation.payload
        )
      )
      .digest("hex");

    const licencaArquivoHash = crypto
      .createHash("sha256")
      .update(
        JSON.stringify(
          activation
        )
      )
      .digest("hex");

    await prisma.configuracaoSistema.update({
      where: {
        id: config.id,
      },
      data: {
        cnpj:
          activation.payload.cnpj,

        licencaPlano:
          activation.payload.licencaPlano,

        licencaStatus:
          activation.payload.licencaStatus,

        licencaEmitidaEm:
          new Date(
            activation.payload.emitidaEm
          ),

        licencaExpiraEm:
          expiraEm,

        nonceLicenca:
          activation.payload.nonceLicenca,

        activationHash,

        licencaArquivoHash,

        licencaArquivoRecebidoEm:
          agora,

        ultimaValidacaoLicenca:
          agora,

        proximaValidacaoLicenca:
          expiraEm,
      },
    });

    return true;
  }
  async isLicencaValida(): Promise<boolean> {
    const config =
      await prisma.configuracaoSistema.findFirst();

    if (!config) {
      return false;
    }

    if (
      config.licencaStatus !== "ATIVA"
    ) {
      return false;
    }

    if (!config.licencaExpiraEm) {
      return false;
    }

    return (
      config.licencaExpiraEm >
      new Date()
    );
  }

}
