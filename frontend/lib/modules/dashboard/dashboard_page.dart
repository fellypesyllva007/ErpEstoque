import 'package:flutter/material.dart';
import '../../widgets/erp_scaffold.dart';
import 'dashboard_controller.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});
  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  final _controller = DashboardController();
  Map<String, dynamic>? _indicadores;
  Map<String, dynamic>? _vendas;
  Map<String, dynamic>? _executivo;
  List<dynamic> _alertas = [];
  List<dynamic> _movRecentes = [];
  bool _carregando = true;

  @override
  void initState() { super.initState(); _carregar(); }

  Future<void> _carregar() async {
    setState(() => _carregando = true);
    try {
      final results = await Future.wait([
        _controller.carregarIndicadores(),
        _controller.alertasEstoque(),
        _controller.movimentacoesRecentes(),
        _controller.indicadoresVendas(),
        _controller.dashboardExecutivo(),
      ]);
      setState(() {
        _indicadores = results[0] as Map<String, dynamic>;
        _alertas = results[1] as List;
        _movRecentes = results[2] as List;
        _vendas = results[3] as Map<String, dynamic>;
        _executivo = results[4] as Map<String, dynamic>;
        _carregando = false;
      });
    } catch (_) { setState(() => _carregando = false); }
  }

  Widget _card(String titulo, String valor, IconData icone, Color cor, {String? sub}) {
    return Card(
      child: SizedBox(
        width: 210,
        height: 120,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(children: [
            Icon(icone, size: 38, color: cor),
            const SizedBox(width: 12),
            Expanded(child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(titulo, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                const SizedBox(height: 4),
                Text(valor, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: cor)),
                if (sub != null) Text(sub, style: const TextStyle(fontSize: 11, color: Colors.grey)),
              ],
            )),
          ]),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final ind = _indicadores;
    final vnd = _vendas;
    final exec = _executivo;
    return ErpScaffold(
      titulo: 'Dashboard',
      body: _carregando
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _carregar,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Cockpit Executivo', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Wrap(spacing: 12, runSpacing: 12, children: [
                    _card('Receita', 'R\$ ${((exec?['receita'] ?? 0) as num).toStringAsFixed(2)}', Icons.trending_up, Colors.green),
                    _card('Margem', 'R\$ ${((exec?['margemGerencial'] ?? 0) as num).toStringAsFixed(2)}', Icons.insights, Colors.blue),
                    _card('A Receber', 'R\$ ${((exec?['aReceber'] ?? 0) as num).toStringAsFixed(2)}', Icons.call_received, Colors.teal),
                    _card('A Pagar', 'R\$ ${((exec?['aPagar'] ?? 0) as num).toStringAsFixed(2)}', Icons.call_made, Colors.red),
                    _card('Saldo Projetado', 'R\$ ${((exec?['saldoProjetado'] ?? 0) as num).toStringAsFixed(2)}', Icons.account_balance, Colors.purple),
                  ]),
                  const SizedBox(height: 20),
                  const Text('Estoque', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Wrap(spacing: 12, runSpacing: 12, children: [
                    _card('Produtos Ativos', '${ind?['totalProdutos'] ?? 0}', Icons.inventory_2, Colors.blue),
                    _card('Estoque Baixo', '${ind?['estoqueBaixo'] ?? 0}', Icons.warning_amber, Colors.orange),
                    _card('Estoque Zerado', '${ind?['estoqueZerado'] ?? 0}', Icons.remove_shopping_cart, Colors.red),
                    _card('Mov. Hoje', '${ind?['movimentacoesHoje'] ?? 0}', Icons.swap_horiz, Colors.teal),
                  ]),
                  const SizedBox(height: 20),
                  const Text('Vendas de Hoje', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Wrap(spacing: 12, runSpacing: 12, children: [
                    _card('Vendas Hoje', '${vnd?['vendasHoje'] ?? 0}', Icons.point_of_sale, Colors.green),
                    _card('Faturamento', 'R\$ ${(vnd?['faturamentoHoje'] ?? 0.0).toStringAsFixed(2)}', Icons.attach_money, Colors.green.shade700),
                  ]),
                  const SizedBox(height: 20),
                  const Text('Cadastros', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Wrap(spacing: 12, runSpacing: 12, children: [
                    _card('Fornecedores', '${ind?['totalFornecedores'] ?? 0}', Icons.local_shipping, Colors.indigo),
                    _card('Usuários', '${ind?['totalUsuarios'] ?? 0}', Icons.people, Colors.purple),
                  ]),
                  if (_alertas.isNotEmpty) ...[
                    const SizedBox(height: 24),
                    const Text('⚠️ Alertas de Estoque', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Card(child: ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _alertas.length,
                      separatorBuilder: (_, __) => const Divider(height: 1),
                      itemBuilder: (_, i) {
                        final p = _alertas[i];
                        return ListTile(
                          leading: const Icon(Icons.warning, color: Colors.orange),
                          title: Text(p['nome']),
                          subtitle: Text('${p['categoria']?['nome'] ?? ''} · Cód: ${p['codigoInterno']}'),
                          trailing: Text(
                            'Estoque: ${p['estoqueAtual']} / Mín: ${p['estoqueMinimo']}',
                            style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
                          ),
                        );
                      },
                    )),
                  ],
                  if (_movRecentes.isNotEmpty) ...[
                    const SizedBox(height: 24),
                    const Text('🔄 Últimas Movimentações', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Card(child: ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _movRecentes.length,
                      separatorBuilder: (_, __) => const Divider(height: 1),
                      itemBuilder: (_, i) {
                        final m = _movRecentes[i];
                        final isEntrada = m['tipo'] == 'ENTRADA';
                        return ListTile(
                          dense: true,
                          leading: Icon(isEntrada ? Icons.arrow_downward : Icons.arrow_upward,
                              color: isEntrada ? Colors.green : Colors.red, size: 20),
                          title: Text(m['produto']?['nome'] ?? ''),
                          subtitle: Text(m['observacao'] ?? m['tipo']),
                          trailing: Text('${isEntrada ? '+' : '-'}${m['quantidade']}',
                              style: TextStyle(color: isEntrada ? Colors.green : Colors.red, fontWeight: FontWeight.bold)),
                        );
                      },
                    )),
                  ],
                ]),
              ),
            ),
    );
  }
}
