import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../widgets/erp_scaffold.dart';
import '../../widgets/confirmar_exclusao_dialog.dart';

class FornecedoresPage extends StatefulWidget {
  const FornecedoresPage({super.key});
  @override
  State<FornecedoresPage> createState() => _FornecedoresPageState();
}

class _FornecedoresPageState extends State<FornecedoresPage> {
  List<dynamic> _lista = [];
  bool _carregando = true;

  @override
  void initState() { super.initState(); _carregar(); }

  Future<void> _carregar() async {
    setState(() => _carregando = true);
    try {
      final data = await ApiService.get('/fornecedores') as List;
      setState(() { _lista = data; _carregando = false; });
    } catch (_) { setState(() => _carregando = false); }
  }

  Future<void> _abrirForm([Map<String, dynamic>? item]) async {
    final nomeCtrl = TextEditingController(text: item?['nome'] ?? '');
    final cnpjCtrl = TextEditingController(text: item?['cnpj'] ?? '');
    final telCtrl = TextEditingController(text: item?['telefone'] ?? '');
    final emailCtrl = TextEditingController(text: item?['email'] ?? '');
    final contatoCtrl = TextEditingController(text: item?['contato'] ?? '');

    await showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(item == null ? 'Novo Fornecedor' : 'Editar Fornecedor'),
        content: SingleChildScrollView(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            _campo('Nome *', nomeCtrl),
            _campo('CNPJ', cnpjCtrl),
            _campo('Telefone', telCtrl),
            _campo('E-mail', emailCtrl),
            _campo('Contato', contatoCtrl),
          ]),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
          FilledButton(onPressed: () async {
            try {
              final body = {
                'nome': nomeCtrl.text,
                if (cnpjCtrl.text.isNotEmpty) 'cnpj': cnpjCtrl.text,
                if (telCtrl.text.isNotEmpty) 'telefone': telCtrl.text,
                if (emailCtrl.text.isNotEmpty) 'email': emailCtrl.text,
                if (contatoCtrl.text.isNotEmpty) 'contato': contatoCtrl.text,
              };
              if (item == null) {
                await ApiService.post('/fornecedores', body);
              } else {
                await ApiService.put('/fornecedores/${item['id']}', body);
              }
              if (ctx.mounted) Navigator.pop(ctx);
              _carregar();
            } catch (e) {
              if (ctx.mounted) ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text(e.toString())));
            }
          }, child: const Text('Salvar')),
        ],
      ),
    );
  }

  Widget _campo(String label, TextEditingController ctrl) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: TextField(controller: ctrl, decoration: InputDecoration(labelText: label, border: const OutlineInputBorder())),
  );

  @override
  Widget build(BuildContext context) {
    return ErpScaffold(
      titulo: 'Fornecedores',
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _abrirForm(),
        icon: const Icon(Icons.add),
        label: const Text('Novo Fornecedor'),
      ),
      body: _carregando
          ? const Center(child: CircularProgressIndicator())
          : _lista.isEmpty
              ? const Center(child: Text('Nenhum fornecedor cadastrado'))
              : RefreshIndicator(
                  onRefresh: _carregar,
                  child: ListView.builder(
                    itemCount: _lista.length,
                    itemBuilder: (_, i) {
                      final f = _lista[i];
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        child: ListTile(
                          leading: const CircleAvatar(child: Icon(Icons.local_shipping)),
                          title: Text(f['nome'], style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text([f['cnpj'], f['telefone'], f['email']].where((e) => e != null && e != '').join(' · ')),
                          trailing: f['ativo'] == false
                              ? const Chip(label: Text('Inativo'))
                              : null,
                          onTap: () => _abrirForm(f),
                          onLongPress: () async {
                            final ok = await confirmarExclusao(context, f['nome']);
                            if (ok == true) {
                              await ApiService.delete('/fornecedores/${f['id']}');
                              _carregar();
                            }
                          },
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
