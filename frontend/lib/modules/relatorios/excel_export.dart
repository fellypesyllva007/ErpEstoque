import 'dart:convert';
import '../../platform/file_storage/file_storage.dart';

/// Exportador CSV compatível com Excel em todas as plataformas.
/// - Windows/Linux/Android: salva arquivo em disco.
/// - Web: dispara download via Blob.
class ExcelExport {
  static Future<String?> exportarEstoque(List<dynamic> dados) async {
    final linhas = [
      'Código,Nome,Categoria,Marca,Fornecedor,Estoque Atual,Estoque Mínimo,Custo,Preço Venda,Localização',
      ...dados.map((p) => [
        p['codigoInterno'], _esc(p['nome']),
        _esc(p['categoria']?['nome'] ?? ''), _esc(p['marca']?['nome'] ?? ''),
        _esc(p['fornecedor']?['nome'] ?? ''), p['estoqueAtual'], p['estoqueMinimo'],
        double.parse(p['custo'].toString()).toStringAsFixed(2),
        double.parse(p['precoVenda'].toString()).toStringAsFixed(2),
        _esc(p['localizacaoFisica'] ?? ''),
      ].join(',')),
    ];
    return _salvar('estoque_${_hoje()}.csv', linhas.join('\n'));
  }

  static Future<String?> exportarMovimentacoes(List<dynamic> dados) async {
    final linhas = [
      'Data,Produto,Código,Tipo,Quantidade,Estoque Anterior,Estoque Posterior,Observação',
      ...dados.map((m) => [
        (m['criadoEm'] as String).substring(0, 10),
        _esc(m['produto']?['nome'] ?? ''), m['produto']?['codigoInterno'] ?? '',
        m['tipo'], m['quantidade'], m['estoqueAnterior'], m['estoquePosterior'],
        _esc(m['observacao'] ?? ''),
      ].join(',')),
    ];
    return _salvar('movimentacoes_${_hoje()}.csv', linhas.join('\n'));
  }

  static Future<String?> exportarVendas(List<dynamic> dados) async {
    final linhas = [
      'Número,Data,Cliente,Forma Pagamento,Desconto,Total,Status',
      ...dados.map((v) => [
        v['numero'], (v['criadoEm'] as String).substring(0, 10),
        _esc(v['cliente']?['nome'] ?? 'Consumidor'), v['formaPagamento'] ?? '',
        double.parse(v['desconto'].toString()).toStringAsFixed(2),
        double.parse(v['valorTotal'].toString()).toStringAsFixed(2), v['status'],
      ].join(',')),
    ];
    return _salvar('vendas_${_hoje()}.csv', linhas.join('\n'));
  }

  static Future<String?> exportarSugestaoReposicao(List<dynamic> dados) async {
    final linhas = [
      'Código,Nome,Fornecedor,Estoque Atual,Estoque Mínimo,Saída/Mês,Consumo Diário,Cobertura (dias),Sugestão Compra,Criticidade',
      ...dados.map((p) => [
        p['codigoInterno'], _esc(p['nome']), _esc(p['fornecedor'] ?? ''),
        p['estoqueAtual'], p['estoqueMinimo'], p['saidaMes'],
        p['consumoDiario'], p['coberturaDias'], p['sugestaoCompra'], p['criticidade'],
      ].join(',')),
    ];
    return _salvar('sugestao_reposicao_${_hoje()}.csv', linhas.join('\n'));
  }

  static String _esc(String s) => '"${s.replaceAll('"', '""')}"';
  static String _hoje() => DateTime.now().toIso8601String().substring(0, 10);

  static Future<String?> _salvar(String nome, String conteudo) async {
    // BOM UTF-8 para Excel reconhecer acentos
    final bytes = [0xEF, 0xBB, 0xBF, ...utf8.encode(conteudo)];
    return FileStorage.salvar(nome, bytes);
  }
}
