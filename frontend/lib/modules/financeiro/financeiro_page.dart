import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../widgets/erp_scaffold.dart';

class FinanceiroPage extends StatefulWidget {
  const FinanceiroPage({super.key});
  @override
  State<FinanceiroPage> createState() => _FinanceiroPageState();
}

class _FinanceiroPageState extends State<FinanceiroPage> {
  Map<String, dynamic>? fluxo;
  Map<String, dynamic>? dre;
  List<dynamic> receber = [];
  List<dynamic> pagar = [];
  bool carregando = true;

  @override
  void initState() { super.initState(); carregar(); }

  Future<void> carregar() async {
    setState(() => carregando = true);
    final dados = await Future.wait([
      ApiService.get('/financeiro/fluxo-caixa'),
      ApiService.get('/financeiro/dre'),
      ApiService.get('/financeiro/receber'),
      ApiService.get('/financeiro/pagar'),
    ]);
    setState(() {
      fluxo = dados[0] as Map<String, dynamic>;
      dre = dados[1] as Map<String, dynamic>;
      receber = dados[2] as List<dynamic>;
      pagar = dados[3] as List<dynamic>;
      carregando = false;
    });
  }

  String moeda(dynamic v) => 'R\$ ${(num.tryParse('$v') ?? 0).toStringAsFixed(2)}';

  @override
  Widget build(BuildContext context) {
    return ErpScaffold(
      titulo: 'Financeiro KoreERP',
      body: carregando ? const Center(child: CircularProgressIndicator()) : RefreshIndicator(
        onRefresh: carregar,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Wrap(spacing: 12, runSpacing: 12, children: [
              _card('Saldo caixa', moeda(fluxo?['saldoCaixa']), Icons.account_balance_wallet, Colors.blue),
              _card('A receber', moeda(fluxo?['aReceber']), Icons.trending_up, Colors.green),
              _card('A pagar', moeda(fluxo?['aPagar']), Icons.trending_down, Colors.red),
              _card('Resultado DRE', moeda(dre?['resultado']), Icons.analytics, Colors.purple),
            ]),
            const SizedBox(height: 24),
            Text('Contas a receber', style: Theme.of(context).textTheme.titleMedium),
            _tabela(receber),
            const SizedBox(height: 24),
            Text('Contas a pagar', style: Theme.of(context).textTheme.titleMedium),
            _tabela(pagar),
          ],
        ),
      ),
    );
  }

  Widget _card(String titulo, String valor, IconData icon, Color cor) => SizedBox(
    width: 210,
    child: Card(child: Padding(padding: const EdgeInsets.all(16), child: Row(children: [
      CircleAvatar(backgroundColor: cor.withOpacity(.12), child: Icon(icon, color: cor)),
      const SizedBox(width: 12), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(titulo, style: const TextStyle(color: Colors.grey)),
        Text(valor, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
      ])),
    ]))),
  );

  Widget _tabela(List<dynamic> itens) => Card(child: SingleChildScrollView(
    scrollDirection: Axis.horizontal,
    child: DataTable(columns: const [
      DataColumn(label: Text('Descrição')), DataColumn(label: Text('Vencimento')), DataColumn(label: Text('Valor')), DataColumn(label: Text('Status')),
    ], rows: itens.map((e) => DataRow(cells: [
      DataCell(Text('${e['descricao'] ?? ''}')), DataCell(Text('${e['vencimento'] ?? ''}'.split('T').first)), DataCell(Text(moeda(e['valor']))), DataCell(Text('${e['status'] ?? ''}')),
    ])).toList()),
  ));
}
