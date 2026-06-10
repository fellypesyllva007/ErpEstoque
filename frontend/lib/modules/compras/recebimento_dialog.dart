import 'package:flutter/material.dart';
import '../../core/api_service.dart';

class RecebimentoDialog extends StatefulWidget {
  final Map<String, dynamic> pedido;
  const RecebimentoDialog({super.key, required this.pedido});

  @override
  State<RecebimentoDialog> createState() => _RecebimentoDialogState();
}

class _RecebimentoDialogState extends State<RecebimentoDialog> {
  final _obsCtrl = TextEditingController();
  final Map<String, TextEditingController> _qtdControllers = {};
  bool _salvando = false;

  @override
  void initState() {
    super.initState();
    for (final item in (widget.pedido['itens'] as List)) {
      final pendente = (item['quantidade'] as int) - (item['qtdRecebida'] as int);
      _qtdControllers[item['id']] = TextEditingController(text: pendente.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    final itens = widget.pedido['itens'] as List;

    return AlertDialog(
      title: Text('Recebimento — ${widget.pedido['numero']}'),
      content: SizedBox(
        width: 500,
        child: SingleChildScrollView(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            TextField(controller: _obsCtrl, decoration: const InputDecoration(labelText: 'Observações', border: OutlineInputBorder())),
            const SizedBox(height: 12),
            const Text('Quantidades recebidas:', style: TextStyle(fontWeight: FontWeight.bold)),
            ...itens.map((item) {
              final pendente = (item['quantidade'] as int) - (item['qtdRecebida'] as int);
              if (pendente <= 0) return const SizedBox.shrink();
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(children: [
                  Expanded(child: Text(item['produto']?['nome'] ?? '?')),
                  Text('Pendente: $pendente  '),
                  SizedBox(
                    width: 80,
                    child: TextField(
                      controller: _qtdControllers[item['id']],
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Qtd', border: OutlineInputBorder(), contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 8)),
                    ),
                  ),
                ]),
              );
            }),
          ]),
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancelar')),
        FilledButton(
          onPressed: _salvando ? null : () async {
            setState(() => _salvando = true);
            try {
              final itensReceb = [];
              for (final item in itens) {
                final ctrl = _qtdControllers[item['id']];
                final qtd = int.tryParse(ctrl?.text ?? '0') ?? 0;
                if (qtd > 0) itensReceb.add({'produtoId': item['produto']['id'] ?? item['produtoId'], 'quantidade': qtd});
              }
              if (itensReceb.isEmpty) throw Exception('Informe a quantidade de ao menos um produto');
              await ApiService.post('/compras/recebimento', {
                'pedidoId': widget.pedido['id'],
                'observacoes': _obsCtrl.text,
                'itens': itensReceb,
              });
              if (mounted) Navigator.pop(context);
            } catch (e) {
              if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
            } finally { setState(() => _salvando = false); }
          },
          child: _salvando ? const CircularProgressIndicator() : const Text('Confirmar Recebimento'),
        ),
      ],
    );
  }
}
