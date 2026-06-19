import 'package:flutter/material.dart';
import '../../core/api_service.dart';

class SaasPage extends StatefulWidget {
  const SaasPage({super.key});
  @override
  State<SaasPage> createState() => _SaasPageState();
}

class _SaasPageState extends State<SaasPage> with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  List<dynamic> _planos = [];
  Map<String, dynamic>? _admin;
  bool _carregando = true;
  String? _planoSelecionado;
  final _formKey = GlobalKey<FormState>();
  final _empresa = TextEditingController();
  final _cnpj = TextEditingController();
  final _nome = TextEditingController();
  final _email = TextEditingController();
  final _usuario = TextEditingController();
  final _senha = TextEditingController();
  final _planoCodigo = TextEditingController();
  final _planoNome = TextEditingController();
  final _planoDescricao = TextEditingController();
  final _planoValor = TextEditingController(text: '69.90');
  final _planoUsuarios = TextEditingController(text: '3');
  final _planoFiliais = TextEditingController(text: '1');
  bool _planoAtivo = true;
  String? _planoEditandoId;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _carregar();
  }

  Future<void> _carregar() async {
    setState(() => _carregando = true);
    try {
      final planos = await ApiService.get('/saas/planos') as List<dynamic>;
      Map<String, dynamic>? admin;
      try { admin = await ApiService.get('/saas/admin') as Map<String, dynamic>; } catch (_) {}
      setState(() { _planos = planos; _admin = admin; _planoSelecionado ??= planos.isNotEmpty ? planos.first['id'] as String : null; });
    } finally {
      if (mounted) setState(() => _carregando = false);
    }
  }

  Future<void> _contratar() async {
    if (!_formKey.currentState!.validate() || _planoSelecionado == null) return;
    try {
      await ApiService.post('/saas/cadastro', {
        'planoId': _planoSelecionado,
        'empresaNome': _empresa.text,
        'cnpj': _cnpj.text,
        'responsavelNome': _nome.text,
        'email': _email.text,
        'usuario': _usuario.text,
        'senha': _senha.text,
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Cadastro e assinatura criados com sucesso. Faça login com o usuário informado.')));
      _formKey.currentState!.reset();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  Future<void> _alterarAssinatura(String id, String status) async {
    await ApiService.put('/saas/admin/assinaturas/$id', {'status': status});
    await _carregar();
  }

  void _editarPlano(Map<String, dynamic> p) {
    setState(() {
      _planoEditandoId = p['id'] as String?;
      _planoCodigo.text = '${p['codigo'] ?? ''}';
      _planoNome.text = '${p['nome'] ?? ''}';
      _planoDescricao.text = '${p['descricao'] ?? ''}';
      _planoValor.text = '${p['valorMensal'] ?? '69.90'}';
      _planoUsuarios.text = '${p['limiteUsuarios'] ?? 3}';
      _planoFiliais.text = '${p['limiteFiliais'] ?? 1}';
      _planoAtivo = p['ativo'] != false;
    });
  }

  Future<void> _salvarPlano() async {
    final payload = {
      'codigo': _planoCodigo.text,
      'nome': _planoNome.text,
      'descricao': _planoDescricao.text,
      'valorMensal': double.tryParse(_planoValor.text.replaceAll(',', '.')) ?? 0,
      'limiteUsuarios': int.tryParse(_planoUsuarios.text) ?? 0,
      'limiteFiliais': int.tryParse(_planoFiliais.text) ?? 0,
      'ativo': _planoAtivo,
    };
    if (_planoEditandoId == null) {
      await ApiService.post('/saas/admin/planos', payload);
    } else {
      await ApiService.put('/saas/admin/planos/$_planoEditandoId', payload);
    }
    _planoEditandoId = null;
    _planoCodigo.clear(); _planoNome.clear(); _planoDescricao.clear();
    _planoValor.text = '69.90'; _planoUsuarios.text = '3'; _planoFiliais.text = '1'; _planoAtivo = true;
    await _carregar();
  }

  Widget _planosView() => ListView(
    padding: const EdgeInsets.all(20),
    children: [
      const Text('Contrate seu plano', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
      const SizedBox(height: 8),
      const Text('Escolha um plano a partir de R\$ 69,90 e crie sua empresa sem intervenção da administração.'),
      const SizedBox(height: 16),
      Wrap(spacing: 12, runSpacing: 12, children: _planos.map((p) => SizedBox(width: 260, child: Card(child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(p['nome'], style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          Text(p['descricao'] ?? ''),
          const SizedBox(height: 12),
          Text('R\$ ${p['valorMensal']}/mês', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.green)),
          Text('${p['limiteUsuarios']} usuários • ${p['limiteFiliais']} filial(is)'),
          const SizedBox(height: 12),
          FilledButton(onPressed: () => setState(() => _planoSelecionado = p['id']), child: Text(_planoSelecionado == p['id'] ? 'Selecionado' : 'Selecionar')),
        ]),
      )))).toList()),
      const SizedBox(height: 20),
      Form(key: _formKey, child: Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(children: [
        TextFormField(controller: _empresa, decoration: const InputDecoration(labelText: 'Nome da empresa'), validator: (v) => v == null || v.isEmpty ? 'Informe a empresa' : null),
        const SizedBox(height: 12),
        TextFormField(controller: _cnpj, decoration: const InputDecoration(labelText: 'CNPJ'), validator: (v) => v == null || v.isEmpty ? 'Informe o CNPJ' : null),
        const SizedBox(height: 12),
        TextFormField(controller: _nome, decoration: const InputDecoration(labelText: 'Responsável'), validator: (v) => v == null || v.isEmpty ? 'Informe o responsável' : null),
        const SizedBox(height: 12),
        TextFormField(controller: _email, decoration: const InputDecoration(labelText: 'E-mail'), validator: (v) => v == null || !v.contains('@') ? 'Informe um e-mail válido' : null),
        const SizedBox(height: 12),
        TextFormField(controller: _usuario, decoration: const InputDecoration(labelText: 'Usuário de acesso'), validator: (v) => v == null || v.isEmpty ? 'Informe o usuário' : null),
        const SizedBox(height: 12),
        TextFormField(controller: _senha, obscureText: true, decoration: const InputDecoration(labelText: 'Senha'), validator: (v) => v == null || v.length < 6 ? 'Mínimo de 6 caracteres' : null),
        const SizedBox(height: 16),
        SizedBox(width: double.infinity, child: FilledButton.icon(onPressed: _contratar, icon: const Icon(Icons.check), label: const Text('Cadastrar e contratar'))),
      ])))),
    ],
  );

  Widget _adminView() {
    if (_admin == null) return const Center(child: Text('Faça login como administrador para acessar a administração SaaS.'));
    final assinaturas = (_admin!['assinaturas'] as List<dynamic>);
    return ListView(padding: const EdgeInsets.all(20), children: [
      Wrap(spacing: 12, runSpacing: 12, children: [
        _kpi('Clientes', '${_admin!['totalClientes']}', Icons.business),
        _kpi('Assinaturas ativas', '${_admin!['assinaturasAtivas']}', Icons.verified),
        _kpi('MRR', 'R\$ ${_admin!['receitaMensal']}', Icons.payments),
      ]),

      const SizedBox(height: 16),
      Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(_planoEditandoId == null ? 'Criar plano' : 'Editar plano', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        Wrap(spacing: 12, runSpacing: 12, children: [
          SizedBox(width: 140, child: TextField(controller: _planoCodigo, decoration: const InputDecoration(labelText: 'Código'))),
          SizedBox(width: 220, child: TextField(controller: _planoNome, decoration: const InputDecoration(labelText: 'Nome'))),
          SizedBox(width: 280, child: TextField(controller: _planoDescricao, decoration: const InputDecoration(labelText: 'Descrição'))),
          SizedBox(width: 120, child: TextField(controller: _planoValor, decoration: const InputDecoration(labelText: 'Valor'))),
          SizedBox(width: 120, child: TextField(controller: _planoUsuarios, decoration: const InputDecoration(labelText: 'Usuários'))),
          SizedBox(width: 120, child: TextField(controller: _planoFiliais, decoration: const InputDecoration(labelText: 'Filiais'))),
          Row(mainAxisSize: MainAxisSize.min, children: [Checkbox(value: _planoAtivo, onChanged: (v) => setState(() => _planoAtivo = v ?? true)), const Text('Ativo')]),
          FilledButton.icon(onPressed: _salvarPlano, icon: const Icon(Icons.save), label: const Text('Salvar plano')),
        ]),
      ]))),
      const SizedBox(height: 16),
      Card(child: SingleChildScrollView(scrollDirection: Axis.horizontal, child: DataTable(columns: const [
        DataColumn(label: Text('Código')), DataColumn(label: Text('Plano')), DataColumn(label: Text('Valor')), DataColumn(label: Text('Limites')), DataColumn(label: Text('Ativo')), DataColumn(label: Text('Ações')),
      ], rows: _planos.map((p) => DataRow(cells: [
        DataCell(Text('${p['codigo']}')), DataCell(Text('${p['nome']}')), DataCell(Text('R\$ ${p['valorMensal']}')),
        DataCell(Text('${p['limiteUsuarios']} usuários • ${p['limiteFiliais']} filial(is)')), DataCell(Text(p['ativo'] == false ? 'Não' : 'Sim')),
        DataCell(TextButton(onPressed: () => _editarPlano(p as Map<String, dynamic>), child: const Text('Editar'))),
      ])).toList()))),
      Card(child: SingleChildScrollView(scrollDirection: Axis.horizontal, child: DataTable(columns: const [
        DataColumn(label: Text('Empresa')), DataColumn(label: Text('Plano')), DataColumn(label: Text('Valor')), DataColumn(label: Text('Status')), DataColumn(label: Text('Ações')),
      ], rows: assinaturas.map((a) => DataRow(cells: [
        DataCell(Text(a['empresa']['nome'])), DataCell(Text(a['plano']['nome'])), DataCell(Text('R\$ ${a['valorMensal']}')), DataCell(Text(a['status'])),
        DataCell(Row(children: [
          TextButton(onPressed: () => _alterarAssinatura(a['id'], 'ATIVA'), child: const Text('Ativar')),
          TextButton(onPressed: () => _alterarAssinatura(a['id'], 'SUSPENSA'), child: const Text('Suspender')),
          TextButton(onPressed: () => _alterarAssinatura(a['id'], 'CANCELADA'), child: const Text('Cancelar')),
        ])),
      ])).toList()))),
    ]);
  }

  Widget _kpi(String titulo, String valor, IconData icon) => SizedBox(width: 220, child: Card(child: ListTile(leading: Icon(icon), title: Text(titulo), subtitle: Text(valor, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)))));

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('SaaS'), bottom: TabBar(controller: _tabController, tabs: const [Tab(text: 'Contratação'), Tab(text: 'Admin SaaS')]), actions: [IconButton(onPressed: _carregar, icon: const Icon(Icons.refresh))]),
    body: _carregando ? const Center(child: CircularProgressIndicator()) : TabBarView(controller: _tabController, children: [_planosView(), _adminView()]),
  );
}
