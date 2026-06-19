import 'package:flutter/material.dart';
import '../core/api_service.dart';
import '../widgets/erp_scaffold.dart';

class EnterprisePage extends StatefulWidget {
  const EnterprisePage({super.key});
  @override
  State<EnterprisePage> createState() => _EnterprisePageState();
}

class _EnterprisePageState extends State<EnterprisePage> {
  Map<String, dynamic>? _executivo;
  List<dynamic> _pipeline = [];
  List<dynamic> _leads = [];
  List<dynamic> _solicitacoes = [];
  List<dynamic> _orcamentos = [];
  List<dynamic> _tributos = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _carregar(); }

  Future<void> _carregar() async {
    setState(() => _loading = true);
    try {
      final data = await Future.wait([
        ApiService.get('/dashboard/executivo'),
        ApiService.get('/enterprise/crm/pipeline'),
        ApiService.get('/enterprise/crm/leads'),
        ApiService.get('/enterprise/compras/solicitacoes'),
        ApiService.get('/enterprise/vendas/orcamentos'),
        ApiService.get('/enterprise/fiscal/configuracoes-tributarias'),
      ]);
      setState(() {
        _executivo = data[0] as Map<String, dynamic>;
        _pipeline = data[1] as List<dynamic>; _leads = data[2] as List<dynamic>;
        _solicitacoes = data[3] as List<dynamic>; _orcamentos = data[4] as List<dynamic>; _tributos = data[5] as List<dynamic>;
      });
    } finally { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return ErpScaffold(
      titulo: 'Cockpit SAP-like 60%',
      actions: [IconButton(onPressed: _carregar, icon: const Icon(Icons.refresh))],
      body: _loading ? const Center(child: CircularProgressIndicator()) : ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Wrap(spacing: 12, runSpacing: 12, children: [
            _kpi('Receita', _money(_executivo?['receita']), Icons.trending_up, Colors.green),
            _kpi('Margem gerencial', _money(_executivo?['margemGerencial']), Icons.insights, Colors.blue),
            _kpi('A receber', _money(_executivo?['aReceber']), Icons.account_balance_wallet, Colors.orange),
            _kpi('A pagar', _money(_executivo?['aPagar']), Icons.payments, Colors.red),
            _kpi('Ticket médio', _money(_executivo?['ticketMedio']), Icons.receipt, Colors.purple),
          ]),
          const SizedBox(height: 20),
          _section('CRM e pipeline', Icons.support_agent, [_list('Pipeline por etapa', _pipeline, (e) => '${e['etapa']} • ${e['quantidade']} • ${_money(e['valor'])}'), _list('Leads recentes', _leads, (e) => '${e['nome']} • ${e['status']}')]),
          _section('Compras enterprise', Icons.assignment_turned_in, [_list('Solicitações com aprovação', _solicitacoes, (e) => '${e['descricao']} • ${e['status']} • ${_money(e['valorEstimado'])}')]),
          _section('Vendas corporativas', Icons.request_quote, [_list('Orçamentos e pedidos', _orcamentos, (e) => '${e['id']} • ${e['status']} • ${_money(e['valorTotal'])}')]),
          _section('Fiscal corporativo', Icons.fact_check, [_list('Regras tributárias', _tributos, (e) => '${e['operacao']} • ${e['uf'] ?? '*'} • CFOP ${e['cfop']}')]),
        ],
      ),
    );
  }

  String _money(dynamic v) => 'R\$ ${((num.tryParse('$v') ?? 0).toDouble()).toStringAsFixed(2)}';
  Widget _kpi(String title, String value, IconData icon, Color color) => SizedBox(width: 210, child: Card(child: Padding(padding: const EdgeInsets.all(16), child: Row(children: [Icon(icon, color: color), const SizedBox(width: 12), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(color: Colors.grey)), Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold))]))]))));
  Widget _section(String title, IconData icon, List<Widget> children) => Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Row(children: [Icon(icon), const SizedBox(width: 8), Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold))]), const Divider(), ...children])));
  Widget _list(String title, List<dynamic> items, String Function(dynamic) label) => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(fontWeight: FontWeight.bold)), if (items.isEmpty) const Padding(padding: EdgeInsets.all(8), child: Text('Sem registros')), ...items.take(5).map((e) => ListTile(dense: true, title: Text(label(e))))]);
}
