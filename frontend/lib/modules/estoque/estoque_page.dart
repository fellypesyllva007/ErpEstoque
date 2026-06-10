import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../widgets/erp_scaffold.dart';
import '../produtos/produtos_service.dart';
import '../produtos/produto_model.dart';

class EstoquePage extends StatefulWidget {
  const EstoquePage({super.key});
  @override
  State<EstoquePage> createState() => _EstoquePageState();
}

class _EstoquePageState extends State<EstoquePage> {
  List<dynamic> _movimentacoes = [];
  bool _carregando = true;

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  Future<void> _carregar() async {
    setState(() => _carregando = true);
    try {
      final data = await ApiService.get('/estoque/movimentacoes') as List;
      setState(() { _movimentacoes = data; _carregando = false; });
    } catch (_) {
      setState(() => _carregando = false);
    }
  }

  Future<void> _novaMovimentacao() async {
    final produtos = await ProdutosService().listar();
    Produto? produtoSelecionado;
    String tipo = 'ENTRADA';
    final qtdCtrl = TextEditingController();
    final obsCtrl = TextEditingController();

    await showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Movimentação de Estoque'),
        content: StatefulBuilder(builder: (_, ss) => Column(
          mainAxisSize: MainAxisSize.min,
          children: [
              DropdownButtonFormField<Produto>(
                value: produtoSelecionado,
                decoration: const InputDecoration(labelText: 'Produto', border: OutlineInputBorder()),
                items: produtos.map((p) => DropdownMenuItem<Produto>(value: p, child: Text('${p.codigoInterno} - ${p.nome}'))).toList(),
                onChanged: (v) => ss(() => produtoSelecionado = v),
              ),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: tipo,
              decoration: const InputDecoration(labelText: 'Tipo', border: OutlineInputBorder()),
              items: ['ENTRADA', 'SAIDA', 'AJUSTE'].map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
              onChanged: (v) => ss(() => tipo = v!),
            ),
            const SizedBox(height: 8),
            TextField(controller: qtdCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Quantidade', border: OutlineInputBorder())),
            const SizedBox(height: 8),
            TextField(controller: obsCtrl, decoration: const InputDecoration(labelText: 'Observação', border: OutlineInputBorder())),
          ],
        )),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
          FilledButton(onPressed: () async {
            try {
              await ApiService.post('/estoque/movimentacoes', {
                'produtoId': produtoSelecionado!.id,
                'tipo': tipo,
                'quantidade': int.parse(qtdCtrl.text),
                if (obsCtrl.text.isNotEmpty) 'observacao': obsCtrl.text,
              });
              if (ctx.mounted) Navigator.pop(ctx);
              _carregar();
            } catch (e) {
              if (ctx.mounted) ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text(e.toString())));
            }
          }, child: const Text('Registrar')),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ErpScaffold(
      titulo: 'Movimentações de Estoque',
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _novaMovimentacao,
        icon: const Icon(Icons.add),
        label: const Text('Movimentação'),
      ),
      body: _carregando
          ? const Center(child: CircularProgressIndicator())
          : _movimentacoes.isEmpty
              ? const Center(child: Text('Nenhuma movimentação registrada'))
              : RefreshIndicator(
                  onRefresh: _carregar,
                  child: ListView.builder(
                    itemCount: _movimentacoes.length,
                    itemBuilder: (_, i) {
                      final m = _movimentacoes[i];
                      final tipo = m['tipo'] as String;
                      final isEntrada = tipo == 'ENTRADA';
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: isEntrada ? Colors.green.shade100 : Colors.red.shade100,
                            child: Icon(
                              isEntrada ? Icons.arrow_downward : Icons.arrow_upward,
                              color: isEntrada ? Colors.green : Colors.red,
                            ),
                          ),
                          title: Text(m['produto']?['nome'] ?? 'Produto'),
                          subtitle: Text('${m['observacao'] ?? tipo} · ${m['criadoEm']?.substring(0, 10) ?? ''}'),
                          trailing: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(tipo, style: TextStyle(color: isEntrada ? Colors.green : Colors.red, fontWeight: FontWeight.bold, fontSize: 12)),
                              Text('Qtd: ${m['quantidade']}  →  ${m['estoquePosterior']}'),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
