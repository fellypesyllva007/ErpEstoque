import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../widgets/erp_scaffold.dart';

class CadastrosPage extends StatefulWidget {
  const CadastrosPage({super.key});
  @override
  State<CadastrosPage> createState() => _CadastrosPageState();
}

class _CadastrosPageState extends State<CadastrosPage> {
  final endpoints = const {
    'Empresas/Filiais': '/cadastros/empresas',
    'Unidades': '/cadastros/unidades',
    'Condições de pagamento': '/cadastros/condicoes-pagamento',
    'Formas de pagamento': '/cadastros/formas-pagamento',
    'Centros de custo': '/cadastros/centros-custo',
    'Plano de contas': '/cadastros/plano-contas',
  };
  String selecionado = 'Empresas/Filiais';
  List<dynamic> itens = [];
  bool carregando = true;

  @override
  void initState() { super.initState(); carregar(); }

  Future<void> carregar() async {
    setState(() => carregando = true);
    final data = await ApiService.get(endpoints[selecionado]!) as List<dynamic>;
    setState(() { itens = data; carregando = false; });
  }

  @override
  Widget build(BuildContext context) {
    return ErpScaffold(
      titulo: 'Cadastros KoreERP',
      body: Column(children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: DropdownButtonFormField<String>(
            value: selecionado,
            decoration: const InputDecoration(labelText: 'Cadastro', border: OutlineInputBorder()),
            items: endpoints.keys.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
            onChanged: (v) { if (v != null) { selecionado = v; carregar(); } },
          ),
        ),
        Expanded(child: carregando ? const Center(child: CircularProgressIndicator()) : RefreshIndicator(
          onRefresh: carregar,
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: itens.length,
            itemBuilder: (_, i) {
              final item = itens[i] as Map<String, dynamic>;
              final titulo = item['nome'] ?? item['razaoSocial'] ?? item['descricao'] ?? item['codigo'] ?? item['sigla'] ?? item['cnpj'] ?? 'Registro';
              return Card(child: ListTile(
                title: Text('$titulo'),
                subtitle: Text(item.entries.where((e) => ['cnpj','codigo','tipo','ativo'].contains(e.key)).map((e) => '${e.key}: ${e.value}').join(' • ')),
                trailing: item['ativo'] == false ? const Icon(Icons.block, color: Colors.red) : const Icon(Icons.check_circle, color: Colors.green),
              ));
            },
          ),
        )),
      ]),
    );
  }
}
