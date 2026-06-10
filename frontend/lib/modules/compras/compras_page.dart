import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../widgets/erp_scaffold.dart';
import '../../widgets/confirmar_exclusao_dialog.dart';
import 'recebimento_dialog.dart';

class ComprasPage extends StatefulWidget {
  const ComprasPage({super.key});
  @override
  State<ComprasPage> createState() => _ComprasPageState();
}

class _ComprasPageState extends State<ComprasPage> {
  List<dynamic> _lista = [];
  bool _carregando = true;
  String? _filtroStatus;

  static const _statusCores = {
    'RASCUNHO': Colors.grey,
    'ENVIADO': Colors.blue,
    'PARCIAL': Colors.orange,
    'RECEBIDO': Colors.green,
    'CANCELADO': Colors.red,
  };

  @override
  void initState() { super.initState(); _carregar(); }

  Future<void> _carregar() async {
    setState(() => _carregando = true);
    try {
      final url = _filtroStatus != null ? '/compras?status=$_filtroStatus' : '/compras';
      final data = await ApiService.get(url) as List;
      setState(() { _lista = data; _carregando = false; });
    } catch (_) { setState(() => _carregando = false); }
  }

  Future<void> _novoPedido() async {
    List<Map<String, dynamic>> fornecedores = [];
    List<Map<String, dynamic>> produtos = [];
    try {
      fornecedores = ((await ApiService.get('/fornecedores')) as List).cast();
      produtos = ((await ApiService.get('/produtos')) as List).cast();
    } catch (_) {}

    if (!mounted) return;

    String? fornecedorId;
    final List<Map<String, dynamic>> itens = [];
    final obsCtrl = TextEditingController();

    await showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (_, ss) => AlertDialog(
          title: const Text('Novo Pedido de Compra'),
          content: SizedBox(
            width: 600,
            child: SingleChildScrollView(
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                DropdownButtonFormField<String>(
                  value: fornecedorId,
                  decoration: const InputDecoration(labelText: 'Fornecedor *', border: OutlineInputBorder()),
                  items: fornecedores.map<DropdownMenuItem<String>>((f) =>
                    DropdownMenuItem(value: f['id'], child: Text(f['nome']))).toList(),
                  onChanged: (v) => ss(() => fornecedorId = v),
                ),
                const SizedBox(height: 8),
                TextField(controller: obsCtrl, decoration: const InputDecoration(labelText: 'Observações', border: OutlineInputBorder())),
                const SizedBox(height: 12),
                const Text('Itens', style: TextStyle(fontWeight: FontWeight.bold)),
                ...itens.asMap().entries.map((entry) {
                  final i = entry.key;
                  final item = entry.value;
                  return Card(
                    child: ListTile(
                      title: Text(produtos.firstWhere((p) => p['id'] == item['produtoId'], orElse: () => {'nome': '?'})['nome']),
                      subtitle: Text('Qtd: ${item['quantidade']} · R\$ ${item['custoUnitario']}'),
                      trailing: IconButton(icon: const Icon(Icons.delete), onPressed: () => ss(() => itens.removeAt(i))),
                    ),
                  );
                }),
                TextButton.icon(
                  icon: const Icon(Icons.add),
                  label: const Text('Adicionar Item'),
                  onPressed: () async {
                    String? prodId;
                    final qtdCtrl = TextEditingController();
                    final custoCtrl = TextEditingController();
                    await showDialog(
                      context: ctx,
                      builder: (ctx2) => StatefulBuilder(builder: (_, ss2) => AlertDialog(
                        title: const Text('Adicionar Produto'),
                        content: Column(mainAxisSize: MainAxisSize.min, children: [
                          DropdownButtonFormField<String>(
                            value: prodId,
                            decoration: const InputDecoration(labelText: 'Produto', border: OutlineInputBorder()),
                            items: produtos.map<DropdownMenuItem<String>>((p) =>
                              DropdownMenuItem(value: p['id'], child: Text('${p['codigoInterno']} — ${p['nome']}'))).toList(),
                            onChanged: (v) { ss2(() => prodId = v); if (v != null) { final p = produtos.firstWhere((p) => p['id'] == v); custoCtrl.text = p['custo'].toString(); }},
                          ),
                          const SizedBox(height: 8),
                          TextField(controller: qtdCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Quantidade', border: OutlineInputBorder())),
                          const SizedBox(height: 8),
                          TextField(controller: custoCtrl, keyboardType: const TextInputType.numberWithOptions(decimal: true), decoration: const InputDecoration(labelText: 'Custo Unitário (R\$)', border: OutlineInputBorder())),
                        ]),
                        actions: [
                          TextButton(onPressed: () => Navigator.pop(ctx2), child: const Text('Cancelar')),
                          FilledButton(onPressed: () {
                            if (prodId != null) ss(() => itens.add({'produtoId': prodId, 'quantidade': int.tryParse(qtdCtrl.text) ?? 1, 'custoUnitario': double.tryParse(custoCtrl.text) ?? 0}));
                            Navigator.pop(ctx2);
                          }, child: const Text('Adicionar')),
                        ],
                      )),
                    );
                  },
                ),
              ]),
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
            FilledButton(onPressed: () async {
              if (fornecedorId == null || itens.isEmpty) {
                ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('Preencha fornecedor e adicione ao menos um item')));
                return;
              }
              try {
                await ApiService.post('/compras', {'fornecedorId': fornecedorId, 'observacoes': obsCtrl.text, 'itens': itens});
                if (ctx.mounted) Navigator.pop(ctx);
                _carregar();
              } catch (e) {
                if (ctx.mounted) ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text(e.toString())));
              }
            }, child: const Text('Criar Pedido')),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ErpScaffold(
      titulo: 'Pedidos de Compra',
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _novoPedido,
        icon: const Icon(Icons.add),
        label: const Text('Novo Pedido'),
      ),
      body: Column(
        children: [
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                FilterChip(label: const Text('Todos'), selected: _filtroStatus == null, onSelected: (_) { setState(() => _filtroStatus = null); _carregar(); }),
                const SizedBox(width: 8),
                ..._statusCores.keys.map((s) => Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(label: Text(s), selected: _filtroStatus == s, onSelected: (_) { setState(() => _filtroStatus = s); _carregar(); }),
                )),
              ],
            ),
          ),
          Expanded(
            child: _carregando
                ? const Center(child: CircularProgressIndicator())
                : _lista.isEmpty
                    ? const Center(child: Text('Nenhum pedido encontrado'))
                    : RefreshIndicator(
                        onRefresh: _carregar,
                        child: ListView.builder(
                          itemCount: _lista.length,
                          itemBuilder: (_, i) {
                            final p = _lista[i];
                            final status = p['status'] as String;
                            final cor = _statusCores[status] ?? Colors.grey;
                            final podeReceber = ['ENVIADO', 'PARCIAL'].contains(status);
                            return Card(
                              margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                              child: ListTile(
                                leading: CircleAvatar(backgroundColor: cor.withOpacity(0.15), child: Icon(Icons.shopping_cart, color: cor)),
                                title: Text('${p['numero']} — ${p['fornecedor']?['nome'] ?? ''}', style: const TextStyle(fontWeight: FontWeight.bold)),
                                subtitle: Text('${(p['itens'] as List).length} itens · R\$ ${double.parse(p['valorTotal'].toString()).toStringAsFixed(2)}'),
                                trailing: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Chip(label: Text(status, style: const TextStyle(fontSize: 11)), backgroundColor: cor.withOpacity(0.15)),
                                    if (podeReceber) IconButton(
                                      icon: const Icon(Icons.local_shipping, color: Colors.green),
                                      tooltip: 'Registrar Recebimento',
                                      onPressed: () async {
                                        await showDialog(context: context, builder: (_) => RecebimentoDialog(pedido: p));
                                        _carregar();
                                      },
                                    ),
                                    if (status == 'RASCUNHO') IconButton(
                                      icon: const Icon(Icons.cancel, color: Colors.red),
                                      tooltip: 'Cancelar',
                                      onPressed: () async {
                                        final ok = await confirmarExclusao(context, p['numero']);
                                        if (ok == true) { await ApiService.post('/compras/${p['id']}/cancelar', {}); _carregar(); }
                                      },
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
