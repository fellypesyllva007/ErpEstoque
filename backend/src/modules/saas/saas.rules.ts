export const ASSINATURA_ATIVA = "ATIVA";

export type AssinaturaAcesso = {
  status: string;
  proximaCobrancaEm: Date | string;
};

export function proximaCobrancaVencida(proximaCobrancaEm: Date | string, agora = new Date()) {
  return new Date(proximaCobrancaEm).getTime() < agora.getTime();
}

export function avaliarAcessoAssinatura(assinatura: AssinaturaAcesso | null | undefined, agora = new Date()) {
  if (!assinatura) {
    return {
      permitido: false,
      statusHttp: 402,
      codigo: "ASSINATURA_INEXISTENTE",
      message: "Empresa sem assinatura SaaS ativa",
      detalhes: "Contrate ou associe uma assinatura para continuar usando os módulos operacionais.",
    };
  }

  if (assinatura.status !== ASSINATURA_ATIVA) {
    return {
      permitido: false,
      statusHttp: 402,
      codigo: "ASSINATURA_STATUS_INVALIDO",
      message: "Assinatura sem acesso ao ERP",
      detalhes: `A assinatura da empresa está ${assinatura.status}. Regularize a assinatura para continuar usando os módulos operacionais.`,
      statusAssinatura: assinatura.status,
    };
  }

  if (proximaCobrancaVencida(assinatura.proximaCobrancaEm, agora)) {
    return {
      permitido: false,
      statusHttp: 402,
      codigo: "ASSINATURA_VENCIDA",
      message: "Assinatura vencida",
      detalhes: "A próxima cobrança da assinatura está vencida. Regularize o pagamento para continuar usando os módulos operacionais.",
      statusAssinatura: assinatura.status,
      proximaCobrancaEm: assinatura.proximaCobrancaEm,
    };
  }

  return { permitido: true, statusHttp: 200, codigo: "ASSINATURA_OK" };
}

export function assertAssinaturaOperacional(assinatura: AssinaturaAcesso | null | undefined, agora = new Date()) {
  const acesso = avaliarAcessoAssinatura(assinatura, agora);
  if (!acesso.permitido) throw new Error(acesso.detalhes);
  return assinatura as AssinaturaAcesso;
}
