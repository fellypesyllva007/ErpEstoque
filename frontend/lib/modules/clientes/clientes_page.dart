import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../widgets/erp_scaffold.dart';
import '../../widgets/confirmar_exclusao_dialog.dart';

class ClientesPage extends StatefulWidget {
  const ClientesPage({super.key});
  @override
  State<ClientesPage> createState() => _ClientesPageState();
}

class _ClientesPageState extends State<ClientesPage> {
  List<dynamic> _lista = [];
  bool _carregando = true;

  @override
  void initState() { super.initState(); _carregar(); }

  Future<void> _carregar() async {
    setState(() => _carregando = true);
    try {
      final data = await ApiService.get('/clientes') as List;
      setState(() { _lista = data; _carregando = false; });
    } catch (_) { setState(() => _carregando = false); }
  }

  Future<void> _abrirForm([Map<String, dynamic>? item]) async {
    final nomeCtrl = TextEditingController(text: item?['nome'] ?? '');
    final cpfCtrl = TextEditingController(text: item?['cpf'] ?? '');
    final telCtrl = TextEditingController(text: item?['telefone'] ?? '');
    final emailCtrl = TextEditingController(text: item?['email'] ?? '');
    final endCtrl = TextEditingController(text: item?['endereco'] ?? '');

    await showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(item == null ? 'Novo Cliente' : 'Editar Cliente'),
        content: SingleChildScrollView(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            _campo('Nome *', nomeCtrl),
            _campo('CPF', cpfCtrl),
            _campo('Telefone', telCtrl),
            _campo('E-mail', emailCtrl),
            _campo('Endereço', endCtrl),
          ]),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
          FilledButton(onPressed: () async {
            try {
              final body = {
                'nome': nomeCtrl.text,
                if (cpfCtrl.text.isNotEmpty) 'cpf': cpfCtrl.text,
                if (telCtrl.text.isNotEmpty) 'telefone': telCtrl.text,
                if (emailCtrl.text.isNotEmpty) 'email': emailCtrl.text,
                if (endCtrl.text.isNotEmpty) 'endereco': endCtrl.text,
              };
              if (item == null) {
                await ApiService.post('/clientes', body);
              } else {
                await ApiService.put('/clientes/${item['id']}', body);
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
      titulo: 'Clientes',
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _abrirForm(),
        icon: const Icon(Icons.add),
        label: const Text('Novo Cliente'),
      ),
      body: _carregando
          ? const Center(child: CircularProgressIndicator())
          : _lista.isEmpty
              ? const Center(child: Text('Nenhum cliente cadastrado'))
              : RefreshIndicator(
                  onRefresh: _carregar,
                  child: ListView.builder(
                    itemCount: _lista.length,
                    itemBuilder: (_, i) {
                      final c = _lista[i];
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        child: ListTile(
                          leading: const CircleAvatar(child: Icon(Icons.person)),
                          title: Text(c['nome'], style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text([c['cpf'], c['telefone'], c['email']].where((e) => e != null && e != '').join(' · ')),
                          onTap: () => _abrirForm(c),
                          onLongPress: () async {
                            final ok = await confirmarExclusao(context, c['nome']);
                            if (ok == true) {
                              await ApiService.delete('/clientes/${c['id']}');
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
