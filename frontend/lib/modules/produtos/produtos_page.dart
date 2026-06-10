import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../widgets/erp_scaffold.dart';
import '../../widgets/confirmar_exclusao_dialog.dart';
import 'produto_model.dart';
import 'produtos_controller.dart';
import 'produto_form_page.dart';
import 'importacao_excel_page.dart';
import 'etiquetas_page.dart';
import 'busca_codigo_page.dart';
import '../relatorios/excel_export.dart';

class ProdutosPage extends StatefulWidget {
  const ProdutosPage({super.key});
  @override
  State<ProdutosPage> createState() => _ProdutosPageState();
}

class _ProdutosPageState extends State<ProdutosPage> {
  final _controller = ProdutosController();
  List<Produto> _produtos = [];
  List<Produto> _filtrados = [];
  bool _carregando = true;
  final _buscaCtrl = TextEditingController();
  String? _filtroCategoria;
  List<dynamic> _categorias = [];

  @override
  void initState() { super.initState(); _carregar(); }

  Future<void> _carregar() async {
    setState(() => _carregando = true);
    try {
      final lista = await _controller.listar();
      final cats = await _controller.listarCategorias();
      setState(() {
        _produtos = lista;
        _categorias = cats;
        _aplicarFiltro();
        _carregando = false;
      });
    } catch (e) {
      setState(() => _carregando = false);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  void _aplicarFiltro() {
    final t = _buscaCtrl.text.toLowerCase();
    setState(() {
      _filtrados = _produtos.where((p) {
        final matchBusca = t.isEmpty ||
            p.nome.toLowerCase().contains(t) ||
            p.codigoInterno.toLowerCase().contains(t) ||
            (p.categoria?['nome'] ?? '').toLowerCase().contains(t);
        final matchCategoria = _filtroCategoria == null || p.categoria?['id'] == _filtroCategoria;
        return matchBusca && matchCategoria;
      }).toList();
    });
  }

  Future<void> _excluir(Produto p) async {
    final ok = await confirmarExclusao(context, p.nome);
    if (ok != true) return;
    try {
      await _controller.excluir(p.id);
      _carregar();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  Future<void> _exportarExcel() async {
    try {
      final data = await ApiService.get('/relatorios/estoque') as List;
      await ExcelExport.exportarEstoque(data);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('✅ Arquivo CSV gerado em Documentos!')));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erro: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return ErpScaffold(
      titulo: 'Produtos',
      body: Column(
        children: [
          // Toolbar
Padding(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(
                  controller: _buscaCtrl,
                  onChanged: (_) => _aplicarFiltro(),
                  decoration: const InputDecoration(
                    hintText: 'Buscar por nome, código ou categoria...',
                    prefixIcon: Icon(Icons.search),
                    border: OutlineInputBorder(),
                    isDense: true,
                  ),
                ),
                const SizedBox(height: 8),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
DropdownButton<String?>(
                        value: _filtroCategoria,
                        hint: const Text('Todas'),
                        items: [
                          const DropdownMenuItem(
                            value: null,
                            child: Text('Todas'),
                          ),
                          ..._categorias.map<DropdownMenuItem<String>>(
                            (c) => DropdownMenuItem(
                              value: c['id'],
                              child: Text(c['nome']),
                            ),
                          ),
                        ],
                        onChanged: (v) {
                          setState(() => _filtroCategoria = v);
                          _aplicarFiltro();
                        },
                      ),
                      const SizedBox(width: 8),
                      IconButton(
                        icon: const Icon(Icons.upload_file),
                        tooltip: 'Importar CSV',
                        onPressed: () async {
                          await Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const ImportacaoExcelPage(),
                            ),
                          );
                          _carregar();
                        },
                      ),
                      IconButton(
                        icon: const Icon(Icons.download),
                        tooltip: 'Exportar CSV',
                        onPressed: _exportarExcel,
                      ),
                      IconButton(
                        icon: const Icon(Icons.label_outline),
                        tooltip: 'Imprimir Etiquetas',
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const EtiquetasPage(),
                            ),
                          );
                        },
                        ),
IconButton(
                        icon: const Icon(Icons.qr_code_scanner),
                        tooltip: 'Buscar por Código',
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const BuscaCodigoPage(),
                            ),
                          );
                        },
                      ),
                      const SizedBox(width: 8),
                      FilledButton.icon(
                        onPressed: () async {
                          await Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const ProdutoFormPage(),
                            ),
                          );
                          _carregar();
                        },
                        icon: const Icon(Icons.add),
                        label: const Text('Novo'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            child: Row(children: [
              Text('${_filtrados.length} produto(s)', style: const TextStyle(color: Colors.grey, fontSize: 12)),
              const Spacer(),
              Text('${_filtrados.where((p) => p.estoqueAtual <= p.estoqueMinimo).length} com estoque baixo',
                style: const TextStyle(color: Colors.orange, fontSize: 12)),
            ]),
          ),
          // Lista
          Expanded(
            child: _carregando
                ? const Center(child: CircularProgressIndicator())
                : _filtrados.isEmpty
                    ? const Center(child: Text('Nenhum produto encontrado'))
                    : RefreshIndicator(
                        onRefresh: _carregar,
                        child: ListView.builder(
                          itemCount: _filtrados.length,
                          itemBuilder: (_, i) {
                            final p = _filtrados[i];
                            final baixo = p.estoqueAtual <= p.estoqueMinimo;
                            final zerado = p.estoqueAtual == 0;
                            Color cor = zerado ? Colors.red : baixo ? Colors.orange : Colors.green;
                            return Card(
                              margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 3),
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: cor.withOpacity(0.15),
                                  child: Icon(Icons.inventory_2, color: cor),
                                ),
                                title: Row(children: [
                                  Expanded(child: Text(p.nome, style: const TextStyle(fontWeight: FontWeight.bold))),
                                  if (!p.ativo) const Chip(label: Text('Inativo'), visualDensity: VisualDensity.compact),
                                ]),
                                subtitle: Text(
                                  '${p.categoria?['nome'] ?? ''} · ${p.marca?['nome'] ?? ''} · Cód: ${p.codigoInterno}'
                                  '${p.localizacaoFisica != null ? ' · ${p.localizacaoFisica}' : ''}',
                                ),
                                trailing: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text('Est: ${p.estoqueAtual}/${p.estoqueMinimo}',
                                      style: TextStyle(color: cor, fontWeight: FontWeight.bold, fontSize: 13)),
                                    Text('R\$ ${p.precoVenda.toStringAsFixed(2)}',
                                      style: const TextStyle(fontSize: 12)),
                                  ],
                                ),
                                onTap: () async {
                                  await Navigator.push(context, MaterialPageRoute(builder: (_) => ProdutoFormPage(produto: p)));
                                  _carregar();
                                },
                                onLongPress: () => _excluir(p),
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
