class FiscalApiResponse {
  final String status;
  final String? service;
  final String? message;
  final Map<String, dynamic> raw;

  const FiscalApiResponse({
    required this.status,
    required this.raw,
    this.service,
    this.message,
  });

  factory FiscalApiResponse.fromJson(Map<String, dynamic> json) {
    return FiscalApiResponse(
      status: json['status']?.toString() ?? 'unknown',
      service: json['service']?.toString(),
      message: json['message']?.toString(),
      raw: json,
    );
  }

  bool get ok => status.toLowerCase() == 'ok';
}

class EmitenteFiscal {
  final String id;
  final String nome;
  final String? cnpj;
  final String? uf;
  final Map<String, dynamic> raw;

  const EmitenteFiscal({
    required this.id,
    required this.nome,
    required this.raw,
    this.cnpj,
    this.uf,
  });

  factory EmitenteFiscal.fromJson(Map<String, dynamic> json) {
    return EmitenteFiscal(
      id: (json['id'] ?? json['emitter_id'] ?? json['codigo'] ?? '').toString(),
      nome: (json['nome'] ?? json['razao_social'] ?? json['razaoSocial'] ?? 'Emitente').toString(),
      cnpj: (json['cnpj'] ?? json['cnpj_cpf'] ?? json['documento'])?.toString(),
      uf: (json['uf'] ?? json['estado'])?.toString(),
      raw: json,
    );
  }
}

class GerarChaveNfeRequest {
  final int codigoUf;
  final int codigoNumerico;
  final int modelo;
  final int serie;
  final int numero;
  final int tipoEmissao;
  final String emissao;
  final String cnpjCpf;

  const GerarChaveNfeRequest({
    required this.codigoUf,
    required this.codigoNumerico,
    required this.modelo,
    required this.serie,
    required this.numero,
    required this.tipoEmissao,
    required this.emissao,
    required this.cnpjCpf,
  });

  Map<String, dynamic> toJson() => {
        'codigo_uf': codigoUf,
        'codigo_numerico': codigoNumerico,
        'modelo': modelo,
        'serie': serie,
        'numero': numero,
        'tipo_emissao': tipoEmissao,
        'emissao': emissao,
        'cnpj_cpf': cnpjCpf,
      };
}

class ResultadoChaveNfe {
  final String chave;
  final Map<String, dynamic> raw;

  const ResultadoChaveNfe({
    required this.chave,
    required this.raw,
  });

  factory ResultadoChaveNfe.fromJson(Map<String, dynamic> json) {
    final resultado = json['resultado'];
    final data = resultado is Map<String, dynamic> ? resultado : json;
    return ResultadoChaveNfe(
      chave: (data['chave'] ?? '').toString(),
      raw: json,
    );
  }
}
