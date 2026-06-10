import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../widgets/barcode_scanner_field.dart';

class BuscaCodigoPage extends StatefulWidget {
  const BuscaCodigoPage({super.key});
  @override
  State<BuscaCodigoPage> createState() => _BuscaCodigoPageState();
}

class _BuscaCodigoPageState extends State<BuscaCodigoPage> {
  Map<String, dynamic>? _produto;
  bool _buscando = false;
  String? _erro;

  Future<void> _buscar(String codigo) async {
    setState(() { _buscando = true; _erro = null; _produto = null; });
    try {
      // Busca por código interno — GET /produtos?codigo=XXX
      final lista = await ApiService.get('/produtos') as List;
      final encontrado = lista.cast<Map<String, dynamic>>().where(
        (p) => (p['codigoInterno'] as String).toLowerCase() == codigo.toLowerCase() ||
               (p['codigoFornecedor'] ?? '').toLowerCase() == codigo.toLowerCase(),
      ).toList();

      if (encontrado.isEmpty) {
        setState(() { _erro = 'Produto não encontrado: $codigo'; _buscando = false; });
      } else {
        setState(() { _produto = encontrado.first; _buscando = false; });
      }
    } catch (e) {
      setState(() { _erro = e.toString(); _buscando = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Busca por Código de Barras')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            BarcodeScannerField(
              label: 'Código do produto',
              onScanned: _buscar,
              autofocus: true,
            ),
            const SizedBox(height: 8),
            const Text(
              'Conecte um leitor USB e leia o código de barras, ou digite o código e pressione Enter.',
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
            const SizedBox(height: 20),
            if (_buscando) const Center(child: CircularProgressIndicator()),
            if (_erro != null)
              Card(
                color: Colors.red.shade50,
                child: ListTile(
                  leading: const Icon(Icons.error, color: Colors.red),
                  title: Text(_erro!),
                ),
              ),
            if (_produto != null) _buildProdutoCard(_produto!),
          ],
        ),
      ),
    );
  }

  Widget _buildProdutoCard(Map<String, dynamic> p) {
    final estoque = p['estoqueAtual'] as int? ?? 0;
    final minimo = p['estoqueMinimo'] as int? ?? 0;
    final estoqueOk = estoque > minimo;
    final preco = double.tryParse(p['precoVenda'].toString()) ?? 0;
    final custo = double.tryParse(p['custo'].toString()) ?? 0;
    final margem = custo > 0 ? ((preco - custo) / custo * 100) : 0;

    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Expanded(
              child: Text(p['nome'], style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            ),
            Chip(
              label: Text(p['ativo'] == true ? 'Ativo' : 'Inativo'),
              backgroundColor: p['ativo'] == true ? Colors.green.shade100 : Colors.grey.shade200,
            ),
          ]),
          const Divider(),
          _linha('Código Interno', p['codigoInterno']),
          if (p['codigoFornecedor'] != null) _linha('Código Fornecedor', p['codigoFornecedor']),
          _linha('Categoria', p['categoria']?['nome'] ?? '-'),
          _linha('Marca', p['marca']?['nome'] ?? '-'),
          _linha('Fornecedor', p['fornecedor']?['nome'] ?? '-'),
          if (p['localizacaoFisica'] != null) _linha('Localização', p['localizacaoFisica']),
          const Divider(),
          Row(children: [
            Expanded(child: _statBox('Estoque', '$estoque un', estoqueOk ? Colors.green : Colors.red)),
            const SizedBox(width: 12),
            Expanded(child: _statBox('Mínimo', '$minimo un', Colors.grey)),
            const SizedBox(width: 12),
            Expanded(child: _statBox('Custo', 'R\$ ${custo.toStringAsFixed(2)}', Colors.blue)),
            const SizedBox(width: 12),
            Expanded(child: _statBox('Preço Venda', 'R\$ ${preco.toStringAsFixed(2)}', Colors.green.shade700)),
            const SizedBox(width: 12),
            Expanded(child: _statBox('Margem', '${margem.toStringAsFixed(1)}%', Colors.purple)),
          ]),
        ]),
      ),
    );
  }

  Widget _linha(String label, String valor) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 3),
    child: Row(children: [
      SizedBox(width: 140, child: Text(label, style: const TextStyle(color: Colors.grey))),
      Expanded(child: Text(valor, style: const TextStyle(fontWeight: FontWeight.w500))),
    ]),
  );

  Widget _statBox(String label, String valor, Color cor) => Container(
    padding: const EdgeInsets.all(10),
    decoration: BoxDecoration(
      color: cor.withOpacity(0.08),
      borderRadius: BorderRadius.circular(8),
      border: Border.all(color: cor.withOpacity(0.3)),
    ),
    child: Column(children: [
      Text(valor, style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: cor)),
      Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
    ]),
  );
}
