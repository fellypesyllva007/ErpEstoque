import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../widgets/erp_scaffold.dart';

class OSPage extends StatefulWidget {
  const OSPage({super.key});
  @override
  State<OSPage> createState() => _OSPageState();
}

class _OSPageState extends State<OSPage> {
  List<dynamic> _lista = [];
  bool _carregando = true;
  String? _filtroStatus;

  static const _statusCores = {
    'ABERTA': Colors.blue,
    'EM_ANDAMENTO': Colors.orange,
    'AGUARDANDO_PECA': Colors.purple,
    'CONCLUIDA': Colors.green,
    'CANCELADA': Colors.red,
  };

  @override
  void initState() { super.initState(); _carregar(); }

  Future<void> _carregar() async {
    setState(() => _carregando = true);
    try {
      final url = _filtroStatus != null ? '/os?status=$_filtroStatus' : '/os';
      final data = await ApiService.get(url) as List;
      setState(() { _lista = data; _carregando = false; });
    } catch (_) { setState(() => _carregando = false); }
  }

  Future<void> _abrirDetalhes(Map<String, dynamic> os) async {
    String novoStatus = os['status'];
    final laudoCtrl = TextEditingController(text: os['laudoTecnico'] ?? '');
    final solucaoCtrl = TextEditingController(text: os['solucaoAplicada'] ?? '');
    final maoObraCtrl = TextEditingController(text: os['valorMaoObra']?.toString() ?? '');
    final garantiaCtrl = TextEditingController(text: os['garantiaDias']?.toString() ?? '90');

    await showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(builder: (_, ss) => AlertDialog(
        title: Text('OS ${os['numero']}'),
        content: SizedBox(
          width: 600,
          child: SingleChildScrollView(
            child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
              Card(color: Colors.blue.shade50, child: Padding(
                padding: const EdgeInsets.all(8),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('👤 Cliente: ${os['cliente']?['nome'] ?? ''}', style: const TextStyle(fontWeight: FontWeight.bold)),
                  Text('📱 Aparelho: ${os['aparelho']} ${os['modelo']}'),
                  if ((os['imei'] ?? '').isNotEmpty) Text('IMEI: ${os['imei']}'),
                  Text('❗ Problema: ${os['descricaoProblema']}'),
                ]),
              )),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: novoStatus,
                decoration: const InputDecoration(labelText: 'Status', border: OutlineInputBorder()),
                items: _statusCores.keys.map((s) => DropdownMenuItem(value: s, child: Text(s.replaceAll('_', ' ')))).toList(),
                onChanged: (v) => ss(() => novoStatus = v!),
              ),
              const SizedBox(height: 8),
              TextField(controller: laudoCtrl, maxLines: 3, decoration: const InputDecoration(labelText: 'Laudo Técnico', border: OutlineInputBorder())),
              const SizedBox(height: 8),
              TextField(controller: solucaoCtrl, maxLines: 2, decoration: const InputDecoration(labelText: 'Solução Aplicada', border: OutlineInputBorder())),
              const SizedBox(height: 8),
              Row(children: [
                Expanded(child: TextField(controller: maoObraCtrl, keyboardType: const TextInputType.numberWithOptions(decimal: true), decoration: const InputDecoration(labelText: 'Valor Mão de Obra (R\$)', border: OutlineInputBorder()))),
                const SizedBox(width: 8),
                Expanded(child: TextField(controller: garantiaCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Garantia (dias)', border: OutlineInputBorder()))),
              ]),
            ]),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Fechar')),
          FilledButton(onPressed: () async {
            try {
              await ApiService.put('/os/${os['id']}', {
                'status': novoStatus,
                if (laudoCtrl.text.isNotEmpty) 'laudoTecnico': laudoCtrl.text,
                if (solucaoCtrl.text.isNotEmpty) 'solucaoAplicada': solucaoCtrl.text,
                if (maoObraCtrl.text.isNotEmpty) 'valorMaoObra': double.tryParse(maoObraCtrl.text),
                if (garantiaCtrl.text.isNotEmpty) 'garantiaDias': int.tryParse(garantiaCtrl.text),
              });
              if (ctx.mounted) Navigator.pop(ctx);
              _carregar();
            } catch (e) {
              if (ctx.mounted) ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text(e.toString())));
            }
          }, child: const Text('Salvar')),
        ],
      )),
    );
  }

  Future<void> _novaOS() async {
    List<dynamic> clientes = [];
    try { clientes = await ApiService.get('/clientes') as List; } catch (_) {}

    if (!mounted) return;

    String? clienteId;
    final aparelhoCtrl = TextEditingController();
    final modeloCtrl = TextEditingController();
    final imeiCtrl = TextEditingController();
    final problemaCtrl = TextEditingController();
    final obsCtrl = TextEditingController();

    await showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(builder: (_, ss) => AlertDialog(
        title: const Text('Nova Ordem de Serviço'),
        content: SizedBox(
          width: 500,
          child: SingleChildScrollView(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              DropdownButtonFormField<String>(
                value: clienteId,
                decoration: const InputDecoration(labelText: 'Cliente *', border: OutlineInputBorder()),
                items: clientes.map<DropdownMenuItem<String>>((c) =>
                  DropdownMenuItem(value: c['id'], child: Text('${c['nome']} (${c['telefone'] ?? '-'})'))).toList(),
                onChanged: (v) => ss(() => clienteId = v),
              ),
              const SizedBox(height: 8),
              _campo('Aparelho (ex: iPhone) *', aparelhoCtrl),
              _campo('Modelo (ex: 14 Pro) *', modeloCtrl),
              _campo('IMEI', imeiCtrl),
              TextField(controller: problemaCtrl, maxLines: 3, decoration: const InputDecoration(labelText: 'Descrição do Problema *', border: OutlineInputBorder())),
              const SizedBox(height: 8),
              _campo('Observações', obsCtrl),
            ]),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
          FilledButton(onPressed: () async {
            if (clienteId == null || aparelhoCtrl.text.isEmpty || problemaCtrl.text.isEmpty) {
              ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('Preencha os campos obrigatórios')));
              return;
            }
            try {
              await ApiService.post('/os', {
                'clienteId': clienteId,
                'aparelho': aparelhoCtrl.text,
                'modelo': modeloCtrl.text,
                if (imeiCtrl.text.isNotEmpty) 'imei': imeiCtrl.text,
                'descricaoProblema': problemaCtrl.text,
                if (obsCtrl.text.isNotEmpty) 'observacoes': obsCtrl.text,
              });
              if (ctx.mounted) Navigator.pop(ctx);
              _carregar();
            } catch (e) {
              if (ctx.mounted) ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text(e.toString())));
            }
          }, child: const Text('Criar OS')),
        ],
      )),
    );
  }

  Widget _campo(String label, TextEditingController ctrl) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: TextField(controller: ctrl, decoration: InputDecoration(labelText: label, border: const OutlineInputBorder())),
  );

  @override
  Widget build(BuildContext context) {
    return ErpScaffold(
      titulo: 'Ordens de Serviço',
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _novaOS, icon: const Icon(Icons.add), label: const Text('Nova OS'),
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
                child: FilterChip(label: Text(s.replaceAll('_', ' ')), selected: _filtroStatus == s, onSelected: (_) { setState(() => _filtroStatus = s); _carregar(); }),
              )),
            ]),
          ),
          Expanded(
            child: _carregando
                ? const Center(child: CircularProgressIndicator())
                : _lista.isEmpty
                    ? const Center(child: Text('Nenhuma OS encontrada'))
                    : RefreshIndicator(
                        onRefresh: _carregar,
                        child: ListView.builder(
                          itemCount: _lista.length,
                          itemBuilder: (_, i) {
                            final os = _lista[i];
                            final status = os['status'] as String;
                            final cor = _statusCores[status] ?? Colors.grey;
                            return Card(
                              margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                              child: ListTile(
                                leading: CircleAvatar(backgroundColor: cor.withOpacity(0.2), child: Icon(Icons.build, color: cor)),
                                title: Text('${os['numero']} — ${os['aparelho']} ${os['modelo']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                                subtitle: Text('${os['cliente']?['nome'] ?? ''}\n${os['descricaoProblema']}', maxLines: 2, overflow: TextOverflow.ellipsis),
                                isThreeLine: true,
                                trailing: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Chip(label: Text(status.replaceAll('_', ' '), style: const TextStyle(fontSize: 10)), backgroundColor: cor.withOpacity(0.15)),
                                    if (os['valorMaoObra'] != null) Text('M.O: R\$ ${double.parse(os['valorMaoObra'].toString()).toStringAsFixed(2)}', style: const TextStyle(fontSize: 11)),
                                  ],
                                ),
                                onTap: () => _abrirDetalhes(os),
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
