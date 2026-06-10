class Produto {
  final String id;
  final String codigoInterno;
  final String? codigoFornecedor;
  final String nome;
  final Map<String, dynamic>? categoria;
  final Map<String, dynamic>? marca;
  final Map<String, dynamic>? fornecedor;
  final double custo;
  final double precoVenda;
  final int estoqueAtual;
  final int estoqueMinimo;
  final String? localizacaoFisica;
  final bool ativo;

  Produto({
    required this.id,
    required this.codigoInterno,
    this.codigoFornecedor,
    required this.nome,
    this.categoria,
    this.marca,
    this.fornecedor,
    required this.custo,
    required this.precoVenda,
    required this.estoqueAtual,
    required this.estoqueMinimo,
    this.localizacaoFisica,
    required this.ativo,
  });

  factory Produto.fromJson(Map<String, dynamic> json) {
    return Produto(
      id: json['id'],
      codigoInterno: json['codigoInterno'],
      codigoFornecedor: json['codigoFornecedor'],
      nome: json['nome'],
      categoria: json['categoria'],
      marca: json['marca'],
      fornecedor: json['fornecedor'],
      custo: double.parse(json['custo'].toString()),
      precoVenda: double.parse(json['precoVenda'].toString()),
      estoqueAtual: json['estoqueAtual'] ?? 0,
      estoqueMinimo: json['estoqueMinimo'] ?? 0,
      localizacaoFisica: json['localizacaoFisica'],
      ativo: json['ativo'] ?? true,
    );
  }
}
