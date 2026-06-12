import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../widgets/erp_scaffold.dart';
import 'venda_form_page.dart';
import '../fiscal/fiscal_service.dart';

class VendasPage extends StatefulWidget {
  const VendasPage({super.key});
  @override
  State<VendasPage> createState() => _VendasPageState();
}

class _VendasPageState extends State<VendasPage> {
  List<dynamic> _lista = [];
  bool _carregando = true;
  String? _filtroStatus;
  final _fiscalService = const FiscalService();

  static const _statusCores = {
    'CONCLUIDA': Colors.green,
    'CANCELADA': Colors.red,
    'ABERTA': Colors.blue,
  };

  @override
  void initState() { super.initState(); _carregar(); }

  Future<void> _carregar() async {
    setState(() => _carregando = true);
    try {
      final url = _filtroStatus != null ? '/vendas?status=$_filtroStatus' : '/vendas';
      final data = await ApiService.get(url) as List;
      setState(() { _lista = data; _carregando = false; });
    } catch (_) { setState(() => _carregando = false); }
  }

  @override
  Widget build(BuildContext context) {
    return ErpScaffold(
      titulo: 'Vendas',
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          await Navigator.push(context, MaterialPageRoute(builder: (_) => const VendaFormPage()));
          _carregar();
        },
        icon: const Icon(Icons.point_of_sale),
        label: const Text('Nova Venda'),
      ),
      body: Column(
        children: [
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.all(8),
            child: Row(children: [
              FilterChip(label: const Text('Todas'), selected: _filtroStatus == null, onSelected: (_) { setState(() => _filtroStatus = null); _carregar(); }),
              const SizedBox(width: 8),
              ..._statusCores.keys.map((s) => Padding(
                padding: const EdgeInsets.only(right: 8),
                child: FilterChip(label: Text(s), selected: _filtroStatus == s, onSelected: (_) { setState(() => _filtroStatus = s); _carregar(); }),
              )),
            ]),
          ),
          Expanded(
            child: _carregando
                ? const Center(child: CircularProgressIndicator())
                : _lista.isEmpty
                    ? const Center(child: Text('Nenhuma venda encontrada'))
                    : RefreshIndicator(
                        onRefresh: _carregar,
                        child: ListView.builder(
                          itemCount: _lista.length,
                          itemBuilder: (_, i) {
                            final v = _lista[i];
                            final status = v['status'] as String;
                            final cor = _statusCores[status] ?? Colors.grey;
                            final total = double.tryParse(v['valorTotal'].toString()) ?? 0;
                            return Card(
                              margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                              child: ListTile(
                                leading: CircleAvatar(backgroundColor: cor.withOpacity(0.15), child: Icon(Icons.receipt, color: cor)),
                                title: Text('${v['numero']} — ${v['cliente']?['nome'] ?? 'Sem cliente'}', style: const TextStyle(fontWeight: FontWeight.bold)),
                                subtitle: Text('${(v['itens'] as List).length} itens · ${v['formaPagamento'] ?? '-'} · ${(v['criadoEm'] as String).substring(0,10)} · Fiscal: ${_statusFiscal(v)}'),
                                trailing: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Chip(label: Text(status, style: const TextStyle(fontSize: 11)), backgroundColor: cor.withOpacity(0.15)),
                                    Text('R\$ ${total.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                                  ],
                                ),
                                onTap: () => _mostrarDetalhe(context, v),
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

  void _mostrarDetalhe(BuildContext context, Map<String, dynamic> v) {
    final itens = v['itens'] as List;
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('Venda ${v['numero']}'),
        content: SizedBox(
          width: 500,
          child: SingleChildScrollView(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
              Text('Cliente: ${v['cliente']?['nome'] ?? 'Consumidor'}'),
              Text('Pagamento: ${v['formaPagamento'] ?? '-'}'),
              Text('Status: ${v['status']}'),
              Text('Fiscal: ${_statusFiscal(v)}'),
              const Divider(),
              ...itens.map((i) => ListTile(
                dense: true,
                title: Text(i['produto']?['nome'] ?? '?'),
                trailing: Text('${i['quantidade']} × R\$ ${double.parse(i['precoUnitario'].toString()).toStringAsFixed(2)}'),
              )),
              const Divider(),
              Text('Total: R\$ ${double.parse(v['valorTotal'].toString()).toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            ]),
          ),
        ),
        actions: [

          if (v['status'] == 'CONCLUIDA' && !_temDocumentoFiscal(v)) TextButton.icon(
            icon: const Icon(Icons.receipt_long),
            onPressed: () async {
              Navigator.pop(context);
              await _emitirDocumentoFiscal(v['id'].toString(), '55');
            },
            label: const Text('Emitir NF-e'),
          ),
          if (v['status'] == 'CONCLUIDA' && !_temDocumentoFiscal(v)) TextButton.icon(
            icon: const Icon(Icons.point_of_sale),
            onPressed: () async {
              Navigator.pop(context);
              await _emitirDocumentoFiscal(v['id'].toString(), '65');
            },
            label: const Text('Emitir NFC-e'),
          ),
          if (_temDocumentoFiscal(v)) TextButton.icon(
            icon: const Icon(Icons.search),
            onPressed: () {
              Navigator.pop(context);
              _mostrarDocumentoFiscal(context, v);
            },
            label: const Text('Consultar Fiscal'),
          ),
          if (v['status'] == 'CONCLUIDA') TextButton(
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            onPressed: () async {
              Navigator.pop(context);
              try {
                await ApiService.post('/vendas/${v['id']}/cancelar', {});
                _carregar();
              } catch (e) {
                if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
              }
            },
            child: const Text('Cancelar Venda'),
          ),
          FilledButton(onPressed: () => Navigator.pop(context), child: const Text('Fechar')),
        ],
      ),
    );
  }

  bool _temDocumentoFiscal(Map<String, dynamic> venda) {
    final docs = venda['documentosFiscais'];
    return docs is List && docs.isNotEmpty;
  }

  String _statusFiscal(Map<String, dynamic> venda) {
    final docs = venda['documentosFiscais'];
    if (docs is! List || docs.isEmpty) return 'sem documento';
    final doc = docs.first as Map<String, dynamic>;
    return '${doc['modelo'] ?? '55'} ${doc['statusInterno'] ?? 'RASCUNHO'}';
  }

  Future<void> _emitirDocumentoFiscal(String vendaId, String modelo) async {
    try {
      await _fiscalService.criarDaVenda(vendaId, modelo: modelo);
      await _carregar();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('${modelo == '65' ? 'NFC-e' : 'NF-e'} criada em RASCUNHO')));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  void _mostrarDocumentoFiscal(BuildContext context, Map<String, dynamic> venda) {
    final docs = (venda['documentosFiscais'] as List).cast<Map<String, dynamic>>();
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Documentos fiscais da venda'),
        content: SizedBox(
          width: 520,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: docs.map((doc) => ListTile(
              leading: const Icon(Icons.receipt_long),
              title: Text('Modelo ${doc['modelo']} Nº ${doc['numero'] ?? '-'} / Série ${doc['serie'] ?? '-'}'),
              subtitle: Text('ERP: ${doc['statusInterno']} · SEFAZ: ${doc['statusSefaz'] ?? '-'}\nChave: ${doc['chave'] ?? '-'}'),
              isThreeLine: true,
            )).toList(),
          ),
        ),
        actions: [
          TextButton.icon(onPressed: null, icon: const Icon(Icons.file_download), label: const Text('Baixar XML')),
          TextButton.icon(onPressed: null, icon: const Icon(Icons.print), label: const Text('DANFE')),
          FilledButton(onPressed: () => Navigator.pop(context), child: const Text('Fechar')),
        ],
      ),
    );
  }

}
