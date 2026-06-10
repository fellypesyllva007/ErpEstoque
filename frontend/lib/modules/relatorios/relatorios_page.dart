import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../widgets/erp_scaffold.dart';
import 'excel_export.dart';

class RelatoriosPage extends StatefulWidget {
  const RelatoriosPage({super.key});
  @override
  State<RelatoriosPage> createState() => _RelatoriosPageState();
}

class _RelatoriosPageState extends State<RelatoriosPage> with SingleTickerProviderStateMixin {
  late TabController _tabs;
  bool _carregando = false;
  List<dynamic> _dados = [];
  String _tabAtual = 'estoque';
  String _dataInicio = '';
  String _dataFim = '';
  List<dynamic> _sugestao = [];

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 5, vsync: this);
    _tabs.addListener(() {
      final nomes = ['estoque', 'movimentacoes', 'vendas', 'compras', 'sugestao'];
      setState(() { _tabAtual = nomes[_tabs.index]; _dados = []; });
    });
    _carregar();
  }

  Future<void> _carregar() async {
    setState(() => _carregando = true);
    try {
      dynamic data;
      switch (_tabAtual) {
        case 'estoque': data = await ApiService.get('/relatorios/estoque'); break;
        case 'movimentacoes': data = await ApiService.get('/relatorios/movimentacoes?dataInicio=$_dataInicio&dataFim=$_dataFim'); break;
        case 'vendas': data = await ApiService.get('/relatorios/vendas?dataInicio=$_dataInicio&dataFim=$_dataFim'); break;
        case 'compras': data = await ApiService.get('/relatorios/compras?dataInicio=$_dataInicio&dataFim=$_dataFim'); break;
        case 'sugestao':
          final s = await ApiService.get('/relatorios/sugestao-reposicao') as List;
          setState(() { _sugestao = s; _carregando = false; });
          return;
      }
      setState(() { _dados = data as List; _carregando = false; });
    } catch (_) { setState(() => _carregando = false); }
  }

  Future<void> _exportarExcel() async {
    try {
      if (_tabAtual == 'sugestao') {
        await ExcelExport.exportarSugestaoReposicao(_sugestao);
      } else if (_tabAtual == 'estoque') {
        await ExcelExport.exportarEstoque(_dados);
      } else if (_tabAtual == 'movimentacoes') {
        await ExcelExport.exportarMovimentacoes(_dados);
      } else if (_tabAtual == 'vendas') {
        await ExcelExport.exportarVendas(_dados);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Exportação não disponível para esta aba')));
        return;
      }
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('✅ Arquivo Excel gerado!')));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erro: $e')));
    }
  }

  Widget _filtroData() => Padding(
    padding: const EdgeInsets.all(8),
    child: Row(children: [
      Expanded(child: TextField(
        onChanged: (v) => setState(() => _dataInicio = v),
        decoration: const InputDecoration(labelText: 'Data início (AAAA-MM-DD)', border: OutlineInputBorder()),
      )),
      const SizedBox(width: 8),
      Expanded(child: TextField(
        onChanged: (v) => setState(() => _dataFim = v),
        decoration: const InputDecoration(labelText: 'Data fim (AAAA-MM-DD)', border: OutlineInputBorder()),
      )),
      const SizedBox(width: 8),
      FilledButton.icon(onPressed: _carregar, icon: const Icon(Icons.search), label: const Text('Filtrar')),
    ]),
  );

  @override
  Widget build(BuildContext context) {
    return ErpScaffold(
      titulo: 'Relatórios',
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _exportarExcel,
        icon: const Icon(Icons.table_chart),
        label: const Text('Exportar Excel'),
        backgroundColor: Colors.green,
      ),
      body: Column(
        children: [
          TabBar(
            controller: _tabs,
            isScrollable: true,
            tabs: const [
              Tab(text: 'Estoque'),
              Tab(text: 'Movimentações'),
              Tab(text: 'Vendas'),
              Tab(text: 'Compras'),
              Tab(text: 'Sugestão Reposição'),
            ],
          ),
          if (['movimentacoes', 'vendas', 'compras'].contains(_tabAtual)) _filtroData(),
          Expanded(
            child: _carregando
                ? const Center(child: CircularProgressIndicator())
                : _tabAtual == 'sugestao'
                    ? _buildSugestao()
                    : _buildTabela(),
          ),
        ],
      ),
    );
  }

  Widget _buildSugestao() {
    if (_sugestao.isEmpty) return const Center(child: Text('Sem sugestões — estoque adequado'));
    return ListView.builder(
      itemCount: _sugestao.length,
      itemBuilder: (_, i) {
        final p = _sugestao[i];
        final criticidade = p['criticidade'] as String;
        final cor = criticidade == 'CRITICO' ? Colors.red : criticidade == 'ALERTA' ? Colors.orange : Colors.green;
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          child: ListTile(
            leading: CircleAvatar(backgroundColor: cor.withOpacity(0.15), child: Icon(Icons.warning, color: cor)),
            title: Text('${p['nome']}', style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('Fornecedor: ${p['fornecedor'] ?? '-'} · Consumo/dia: ${p['consumoDiario']} · Cobertura: ${p['coberturaDias']} dias'),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Chip(label: Text(criticidade, style: const TextStyle(fontSize: 11)), backgroundColor: cor.withOpacity(0.15)),
                Text('Comprar: ${p['sugestaoCompra']} un', style: const TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildTabela() {
    if (_dados.isEmpty) return const Center(child: Text('Nenhum dado encontrado'));
    return SingleChildScrollView(
      scrollDirection: Axis.vertical,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.all(12),
        child: _buildDataTable(),
      ),
    );
  }

  DataTable _buildDataTable() {
    if (_tabAtual == 'estoque') {
      return DataTable(columns: const [
        DataColumn(label: Text('Código')), DataColumn(label: Text('Nome')), DataColumn(label: Text('Categoria')),
        DataColumn(label: Text('Marca')), DataColumn(label: Text('Estoque')), DataColumn(label: Text('Mínimo')), DataColumn(label: Text('Preço Venda')),
      ], rows: _dados.map((p) => DataRow(cells: [
        DataCell(Text(p['codigoInterno'])), DataCell(Text(p['nome'])), DataCell(Text(p['categoria']?['nome'] ?? '')),
        DataCell(Text(p['marca']?['nome'] ?? '')), DataCell(Text('${p['estoqueAtual']}')),
        DataCell(Text('${p['estoqueMinimo']}')), DataCell(Text('R\$ ${double.parse(p['precoVenda'].toString()).toStringAsFixed(2)}')),
      ])).toList());
    }
    if (_tabAtual == 'movimentacoes') {
      return DataTable(columns: const [
        DataColumn(label: Text('Data')), DataColumn(label: Text('Produto')), DataColumn(label: Text('Tipo')),
        DataColumn(label: Text('Qtd')), DataColumn(label: Text('Antes')), DataColumn(label: Text('Depois')), DataColumn(label: Text('Obs')),
      ], rows: _dados.map((m) => DataRow(cells: [
        DataCell(Text((m['criadoEm'] as String).substring(0,10))), DataCell(Text(m['produto']?['nome'] ?? '')),
        DataCell(Text(m['tipo'])), DataCell(Text('${m['quantidade']}')), DataCell(Text('${m['estoqueAnterior']}')),
        DataCell(Text('${m['estoquePosterior']}')), DataCell(Text(m['observacao'] ?? '')),
      ])).toList());
    }
    if (_tabAtual == 'vendas') {
      return DataTable(columns: const [
        DataColumn(label: Text('Número')), DataColumn(label: Text('Data')), DataColumn(label: Text('Cliente')),
        DataColumn(label: Text('Pagamento')), DataColumn(label: Text('Total')), DataColumn(label: Text('Status')),
      ], rows: _dados.map((v) => DataRow(cells: [
        DataCell(Text(v['numero'])), DataCell(Text((v['criadoEm'] as String).substring(0,10))),
        DataCell(Text(v['cliente']?['nome'] ?? 'Consumidor')), DataCell(Text(v['formaPagamento'] ?? '-')),
        DataCell(Text('R\$ ${double.parse(v['valorTotal'].toString()).toStringAsFixed(2)}')), DataCell(Text(v['status'])),
      ])).toList());
    }
    return DataTable(columns: const [DataColumn(label: Text('Dados'))], rows: []);
  }
}
