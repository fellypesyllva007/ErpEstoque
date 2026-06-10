import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../widgets/barcode_scanner_field.dart';

class VendaFormPage extends StatefulWidget {
  const VendaFormPage({super.key});
  @override
  State<VendaFormPage> createState() => _VendaFormPageState();
}

class _VendaFormPageState extends State<VendaFormPage> {
  List<dynamic> _produtos = [];
  List<dynamic> _clientes = [];
  final List<Map<String, dynamic>> _itens = [];
  String? _clienteId;
  String _formaPagamento = 'DINHEIRO';
  final _descontoCtrl = TextEditingController(text: '0');
  final _obsCtrl = TextEditingController();
  bool _salvando = false;

  static const _formasPag = ['DINHEIRO', 'PIX', 'CARTAO_DEBITO', 'CARTAO_CREDITO', 'TRANSFERENCIA'];

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  Future<void> _carregar() async {
    final p = await ApiService.get('/produtos') as List;
    final c = await ApiService.get('/clientes') as List;
    setState(() { _produtos = p; _clientes = c; });
  }

  double get _subtotal => _itens.fold(0, (s, i) => s + i['quantidade'] * i['precoUnitario'] - (i['desconto'] ?? 0));
  double get _total => _subtotal - (double.tryParse(_descontoCtrl.text) ?? 0);

  void _adicionarItem() {
    String? prodId;
    final qtdCtrl = TextEditingController(text: '1');
    final precoCtrl = TextEditingController();
    final descItemCtrl = TextEditingController(text: '0');

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(builder: (_, ss) => AlertDialog(
        title: const Text('Adicionar Produto'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          DropdownButtonFormField<String>(
            value: prodId,
            decoration: const InputDecoration(labelText: 'Produto *', border: OutlineInputBorder()),
            items: _produtos.map<DropdownMenuItem<String>>((p) =>
              DropdownMenuItem(value: p['id'], child: Text('${p['codigoInterno']} — ${p['nome']} (est: ${p['estoqueAtual']})'))).toList(),
            onChanged: (v) { ss(() => prodId = v); if (v != null) { final p = _produtos.firstWhere((p) => p['id'] == v); precoCtrl.text = p['precoVenda'].toString(); }},
          ),
          const SizedBox(height: 8),
          TextField(controller: qtdCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Quantidade', border: OutlineInputBorder())),
          const SizedBox(height: 8),
          TextField(controller: precoCtrl, keyboardType: const TextInputType.numberWithOptions(decimal: true), decoration: const InputDecoration(labelText: 'Preço Unitário (R\$)', border: OutlineInputBorder())),
          const SizedBox(height: 8),
          TextField(controller: descItemCtrl, keyboardType: const TextInputType.numberWithOptions(decimal: true), decoration: const InputDecoration(labelText: 'Desconto Item (R\$)', border: OutlineInputBorder())),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
          FilledButton(onPressed: () {
            if (prodId != null) {
              setState(() => _itens.add({
                'produtoId': prodId,
                'quantidade': int.tryParse(qtdCtrl.text) ?? 1,
                'precoUnitario': double.tryParse(precoCtrl.text) ?? 0,
                'desconto': double.tryParse(descItemCtrl.text) ?? 0,
              }));
            }
            Navigator.pop(ctx);
          }, child: const Text('Adicionar')),
        ],
      )),
    );
  }

  Future<void> _finalizar() async {
    if (_itens.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Adicione ao menos um item')));
      return;
    }
    setState(() => _salvando = true);
    try {
      await ApiService.post('/vendas', {
        if (_clienteId != null) 'clienteId': _clienteId,
        'formaPagamento': _formaPagamento,
        'desconto': double.tryParse(_descontoCtrl.text) ?? 0,
        'observacoes': _obsCtrl.text,
        'itens': _itens,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('✅ Venda finalizada com sucesso!')));
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally { setState(() => _salvando = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Nova Venda'), actions: [
        Padding(
          padding: const EdgeInsets.only(right: 16),
          child: Center(child: Text('Total: R\$ ${_total.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18))),
        ),
      ]),
      body: Row(
        children: [
          // Coluna esquerda — produtos
          Expanded(
            flex: 3,
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(8),
                  child: TextField(
                    onChanged: (v) => setState(() {}),
                    decoration: const InputDecoration(hintText: 'Buscar produto...', prefixIcon: Icon(Icons.search), border: OutlineInputBorder()),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(8, 0, 8, 4),
                  child: BarcodeScannerField(
                    label: 'Ler código de barras (scanner USB)',
                    onScanned: (codigo) {
                      final idx = _produtos.indexWhere((p) =>
                          (p['codigoInterno'] as String).toLowerCase() == codigo.toLowerCase() ||
                          (p['codigoFornecedor'] ?? '').toLowerCase() == codigo.toLowerCase());
                      if (idx >= 0) {
                        final p = _produtos[idx];
                        setState(() => _itens.add({
                          'produtoId': p['id'], 'quantidade': 1,
                          'precoUnitario': double.parse(p['precoVenda'].toString()), 'desconto': 0.0,
                        }));
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Produto não encontrado: $codigo')));
                      }
                    },
                  ),
                ),
                Expanded(
                  child: GridView.builder(
                    padding: const EdgeInsets.all(8),
                    gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(maxCrossAxisExtent: 200, childAspectRatio: 1.2, crossAxisSpacing: 8, mainAxisSpacing: 8),
                    itemCount: _produtos.length,
                    itemBuilder: (_, i) {
                      final p = _produtos[i];
                      final semEstoque = (p['estoqueAtual'] ?? 0) == 0;
                      return Card(
                        color: semEstoque ? Colors.grey.shade100 : null,
                        child: InkWell(
                          onTap: semEstoque ? null : () {
                            setState(() => _itens.add({'produtoId': p['id'], 'quantidade': 1, 'precoUnitario': double.parse(p['precoVenda'].toString()), 'desconto': 0.0}));
                          },
                          borderRadius: BorderRadius.circular(8),
                          child: Padding(
                            padding: const EdgeInsets.all(8),
                            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                              Icon(Icons.inventory_2, size: 32, color: semEstoque ? Colors.grey : Colors.blue),
                              const SizedBox(height: 4),
                              Text(p['nome'], textAlign: TextAlign.center, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold), maxLines: 2, overflow: TextOverflow.ellipsis),
                              Text('R\$ ${double.parse(p['precoVenda'].toString()).toStringAsFixed(2)}', style: const TextStyle(fontSize: 13, color: Colors.green)),
                              Text('Est: ${p['estoqueAtual']}', style: TextStyle(fontSize: 11, color: semEstoque ? Colors.red : Colors.grey)),
                            ]),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
          const VerticalDivider(width: 1),
          // Coluna direita — carrinho
          SizedBox(
            width: 380,
            child: Column(
              children: [
                Expanded(
                  child: _itens.isEmpty
                      ? const Center(child: Text('Nenhum item adicionado'))
                      : ListView.builder(
                          itemCount: _itens.length,
                          itemBuilder: (_, i) {
                            final item = _itens[i];
                            final p = _produtos.firstWhere((p) => p['id'] == item['produtoId'], orElse: () => {'nome': '?'});
                            return ListTile(
                              dense: true,
                              title: Text(p['nome']),
                              subtitle: Text('${item['quantidade']} × R\$ ${item['precoUnitario'].toStringAsFixed(2)}'),
                              trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                                Text('R\$ ${(item['quantidade'] * item['precoUnitario'] - item['desconto']).toStringAsFixed(2)}'),
                                IconButton(icon: const Icon(Icons.remove_circle, size: 18), onPressed: () => setState(() => _itens.removeAt(i))),
                              ]),
                            );
                          },
                        ),
                ),
                const Divider(),
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(children: [
                    DropdownButtonFormField<String>(
                      value: _clienteId,
                      decoration: const InputDecoration(labelText: 'Cliente', border: OutlineInputBorder()),
                      items: [
                        const DropdownMenuItem(value: null, child: Text('Consumidor final')),
                        ..._clientes.map<DropdownMenuItem<String>>((c) => DropdownMenuItem(value: c['id'], child: Text(c['nome']))),
                      ],
                      onChanged: (v) => setState(() => _clienteId = v),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      value: _formaPagamento,
                      decoration: const InputDecoration(labelText: 'Forma de Pagamento', border: OutlineInputBorder()),
                      items: _formasPag.map<DropdownMenuItem<String>>((f) => DropdownMenuItem(value: f, child: Text(f.replaceAll('_', ' ')))).toList(),
                      onChanged: (v) => setState(() => _formaPagamento = v!),
                    ),
                    const SizedBox(height: 8),
                    TextField(controller: _descontoCtrl, onChanged: (_) => setState(() {}), keyboardType: const TextInputType.numberWithOptions(decimal: true), decoration: const InputDecoration(labelText: 'Desconto Geral (R\$)', border: OutlineInputBorder())),
                    const SizedBox(height: 12),
                    Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                      const Text('Subtotal:', style: TextStyle(fontSize: 14)),
                      Text('R\$ ${_subtotal.toStringAsFixed(2)}'),
                    ]),
                    Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                      const Text('Desconto:', style: TextStyle(fontSize: 14)),
                      Text('- R\$ ${(double.tryParse(_descontoCtrl.text) ?? 0).toStringAsFixed(2)}', style: const TextStyle(color: Colors.orange)),
                    ]),
                    const Divider(),
                    Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                      const Text('TOTAL:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      Text('R\$ ${_total.toStringAsFixed(2)}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.green)),
                    ]),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: FilledButton.icon(
                        onPressed: _salvando ? null : _finalizar,
                        icon: const Icon(Icons.check),
                        label: _salvando ? const CircularProgressIndicator() : const Text('FINALIZAR VENDA', style: TextStyle(fontSize: 16)),
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextButton.icon(icon: const Icon(Icons.add), label: const Text('Adicionar por código'), onPressed: _adicionarItem),
                  ]),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
