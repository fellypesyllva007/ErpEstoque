import crypto from "crypto";

import { ERP_PUBLIC_KEY } from "./public-key.js";
import {
  ActivationFile,
  ActivationPayload,
} from "./licenciamento.types.js";

export class ActivationService {
  verificarAssinatura(
    payload: ActivationPayload,
    signatureBase64: string
  ): boolean {
    const payloadBytes = Buffer.from(
      JSON.stringify(payload),
      "utf8"
    );

    const signature = Buffer.from(
      signatureBase64,
      "base64"
    );

    return crypto.verify(
      null,
      payloadBytes,
      ERP_PUBLIC_KEY,
      signature
    );
  }

  validarArquivo(
    activation: ActivationFile
  ): boolean {
    if (activation.magic !== "ERPX") {
      return false;
    }

    if (activation.version !== 1) {
      return false;
    }

    return this.verificarAssinatura(
      activation.payload,
      activation.signature
    );
  }
}
