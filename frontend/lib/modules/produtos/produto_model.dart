class Produto {
  final String id;
  final String codigoInterno;
  final String codigoFornecedor;
  final String nome;
  final String categoria;
  final String marca;
  final String fornecedor;
  final double custo;
  final double precoVenda;
  final int estoqueAtual;
  final int estoqueMinimo;
  final String localizacao;
  final bool ativo;

  Produto({
    required this.id,
    required this.codigoInterno,
    required this.codigoFornecedor,
    required this.nome,
    required this.categoria,
    required this.marca,
    required this.fornecedor,
    required this.custo,
    required this.precoVenda,
    required this.estoqueAtual,
    required this.estoqueMinimo,
    required this.localizacao,
    required this.ativo,
  });
}
