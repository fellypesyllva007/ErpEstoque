import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../platform/printer/printer_service.dart';
import 'produto_model.dart';
import 'produtos_controller.dart';

class EtiquetasPage extends StatefulWidget {
  const EtiquetasPage({super.key});
  @override
  State<EtiquetasPage> createState() => _EtiquetasPageState();
}

class _EtiquetasPageState extends State<EtiquetasPage> {
  final _controller = ProdutosController();
  List<Produto> _produtos = [];
  List<Produto> _filtrados = [];
  final Set<String> _selecionados = {};
  bool _carregando = true;
  final _buscaCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  Future<void> _carregar() async {
    setState(() => _carregando = true);
    try {
      final lista = await _controller.listar();
      setState(() {
        _produtos = lista;
        _filtrados = lista;
        _carregando = false;
      });
    } catch (_) {
      setState(() => _carregando = false);
    }
  }

  void _filtrar(String texto) {
    final t = texto.toLowerCase();
    setState(() {
      _filtrados = _produtos
          .where((p) =>
              p.nome.toLowerCase().contains(t) ||
              p.codigoInterno.toLowerCase().contains(t))
          .toList();
    });
  }

  Future<void> _imprimir() async {
    if (_selecionados.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Selecione ao menos um produto')),
      );
      return;
    }
    try {
      final token = await ApiService.getToken();
      // PrinterService resolve a estratégia por plataforma:
      // IO  → abre no navegador padrão
      // Web → window.open (nova aba)
      await PrinterService.imprimirEtiquetas(
        _selecionados.toList(),
        ApiService.baseUrl,
        token,
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Erro: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Impressão de Etiquetas'),
        actions: [
          if (_selecionados.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: FilledButton.icon(
                onPressed: _imprimir,
                icon: const Icon(Icons.print),
                label: Text('Imprimir ${_selecionados.length}'),
              ),
            ),
        ],
      ),
      body: Column(children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: Row(children: [
            Expanded(
              child: TextField(
                controller: _buscaCtrl,
                onChanged: _filtrar,
                decoration: const InputDecoration(
                  hintText: 'Buscar produto...',
                  prefixIcon: Icon(Icons.search),
                  border: OutlineInputBorder(),
                ),
              ),
            ),
            const SizedBox(width: 8),
            TextButton(
              onPressed: () => setState(() {
                if (_selecionados.length == _filtrados.length) {
                  _selecionados.clear();
                } else {
                  _selecionados.addAll(_filtrados.map((p) => p.id));
                }
              }),
              child: Text(
                _selecionados.length == _filtrados.length
                    ? 'Desmarcar todos'
                    : 'Selecionar todos',
              ),
            ),
          ]),
        ),
        if (_selecionados.isNotEmpty)
          Container(
            color: Colors.blue.shade50,
            padding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(children: [
              const Icon(Icons.check_box, color: Colors.blue, size: 18),
              const SizedBox(width: 8),
              Text('${_selecionados.length} selecionado(s)'),
              const Spacer(),
              TextButton(
                onPressed: () => setState(() => _selecionados.clear()),
                child: const Text('Limpar'),
              ),
            ]),
          ),
        Expanded(
          child: _carregando
              ? const Center(child: CircularProgressIndicator())
              : ListView.builder(
                  itemCount: _filtrados.length,
                  itemBuilder: (_, i) {
                    final p = _filtrados[i];
                    return CheckboxListTile(
                      value: _selecionados.contains(p.id),
                      onChanged: (v) => setState(() {
                        v == true
                            ? _selecionados.add(p.id)
                            : _selecionados.remove(p.id);
                      }),
                      title: Text(p.nome,
                          style:
                              const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text(
                          '${p.codigoInterno} · R\$ ${p.precoVenda.toStringAsFixed(2)}'),
                      secondary: CircleAvatar(
                        backgroundColor: Colors.grey.shade100,
                        child: const Icon(Icons.label),
                      ),
                    );
                  },
                ),
        ),
      ]),
    );
  }
}
