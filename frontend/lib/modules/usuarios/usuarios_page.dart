import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../widgets/erp_scaffold.dart';
import '../../widgets/confirmar_exclusao_dialog.dart';

class UsuariosPage extends StatefulWidget {
  const UsuariosPage({super.key});
  @override
  State<UsuariosPage> createState() => _UsuariosPageState();
}

class _UsuariosPageState extends State<UsuariosPage> {
  List<dynamic> _usuarios = [];
  List<dynamic> _perfis = [];
  bool _carregando = true;

  @override
  void initState() { super.initState(); _carregar(); }

  Future<void> _carregar() async {
    setState(() => _carregando = true);
    try {
      final u = await ApiService.get('/usuarios') as List;
      final p = await ApiService.get('/usuarios/perfis') as List;
      setState(() { _usuarios = u; _perfis = p; _carregando = false; });
    } catch (_) { setState(() => _carregando = false); }
  }

  Future<void> _abrirForm([Map<String, dynamic>? item]) async {
    final nomeCtrl = TextEditingController(text: item?['nome'] ?? '');
    final emailCtrl = TextEditingController(text: item?['email'] ?? '');
    final usuarioCtrl = TextEditingController(text: item?['usuario'] ?? '');
    final senhaCtrl = TextEditingController();
    String? perfilId = item?['perfil']?['id'];

    await showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(item == null ? 'Novo Usuário' : 'Editar Usuário'),
        content: StatefulBuilder(builder: (_, ss) => SingleChildScrollView(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            _campo('Nome *', nomeCtrl),
            _campo('E-mail *', emailCtrl),
            if (item == null) _campo('Usuário *', usuarioCtrl),
            if (item == null) _campo('Senha *', senhaCtrl, obscure: true),
            DropdownButtonFormField<String>(
              value: perfilId,
              decoration: const InputDecoration(labelText: 'Perfil *', border: OutlineInputBorder()),
              items: _perfis.map<DropdownMenuItem<String>>((p) => DropdownMenuItem(value: p['id'], child: Text(p['nome']))).toList(),
              onChanged: (v) => ss(() => perfilId = v),
            ),
          ]),
        )),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
          FilledButton(onPressed: () async {
            try {
              if (item == null) {
                await ApiService.post('/usuarios', {
                  'nome': nomeCtrl.text,
                  'email': emailCtrl.text,
                  'usuario': usuarioCtrl.text,
                  'senha': senhaCtrl.text,
                  'perfilId': perfilId,
                });
              } else {
                await ApiService.put('/usuarios/${item['id']}', {
                  'nome': nomeCtrl.text,
                  'email': emailCtrl.text,
                  'perfilId': perfilId,
                });
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

  Widget _campo(String label, TextEditingController ctrl, {bool obscure = false}) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: TextField(controller: ctrl, obscureText: obscure, decoration: InputDecoration(labelText: label, border: const OutlineInputBorder())),
  );

  @override
  Widget build(BuildContext context) {
    return ErpScaffold(
      titulo: 'Usuários',
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _abrirForm(),
        icon: const Icon(Icons.add),
        label: const Text('Novo Usuário'),
      ),
      body: _carregando
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _carregar,
              child: ListView.builder(
                itemCount: _usuarios.length,
                itemBuilder: (_, i) {
                  final u = _usuarios[i];
                  return Card(
                    margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: u['ativo'] == false ? Colors.grey.shade200 : Colors.blue.shade100,
                        child: Icon(Icons.person, color: u['ativo'] == false ? Colors.grey : Colors.blue),
                      ),
                      title: Text(u['nome'], style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text('${u['usuario']} · ${u['perfil']?['nome'] ?? ''}'),
                      trailing: u['ativo'] == false ? const Chip(label: Text('Inativo')) : null,
                      onTap: () => _abrirForm(u),
                      onLongPress: () async {
                        final ok = await confirmarExclusao(context, u['nome']);
                        if (ok == true) {
                          await ApiService.put('/usuarios/${u['id']}', {'ativo': false});
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
