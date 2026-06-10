import 'package:flutter/material.dart';
import 'produto_model.dart';
import 'produtos_controller.dart';

class ProdutoFormPage extends StatefulWidget {
  final Produto? produto;
  const ProdutoFormPage({super.key, this.produto});

  @override
  State<ProdutoFormPage> createState() => _ProdutoFormPageState();
}

class _ProdutoFormPageState extends State<ProdutoFormPage> {
  final _controller = ProdutosController();
  final _nomeCtrl = TextEditingController();
  final _codigoCtrl = TextEditingController();
  final _codFornCtrl = TextEditingController();
  final _custoCtrl = TextEditingController();
  final _precoCtrl = TextEditingController();
  final _estMinCtrl = TextEditingController();
  final _locCtrl = TextEditingController();

  List<dynamic> _categorias = [];
  List<dynamic> _marcas = [];
  List<dynamic> _fornecedores = [];
  String? _categoriaId;
  String? _marcaId;
  String? _fornecedorId;
  bool _salvando = false;

  bool get _editando => widget.produto != null;

  @override
  void initState() {
    super.initState();
    _carregarSelects();
    if (_editando) {
      final p = widget.produto!;
      _nomeCtrl.text = p.nome;
      _codigoCtrl.text = p.codigoInterno;
      _codFornCtrl.text = p.codigoFornecedor ?? '';
      _custoCtrl.text = p.custo.toStringAsFixed(2);
      _precoCtrl.text = p.precoVenda.toStringAsFixed(2);
      _estMinCtrl.text = p.estoqueMinimo.toString();
      _locCtrl.text = p.localizacaoFisica ?? '';
      _categoriaId = p.categoria?['id'];
      _marcaId = p.marca?['id'];
      _fornecedorId = p.fornecedor?['id'];
    }
  }

  Future<void> _carregarSelects() async {
    try {
      final cats = await _controller.listarCategorias();
      final marcas = await _controller.listarMarcas();
      final forn = await _controller.listarFornecedores();

      print('CATEGORIAS: $cats');
      print('MARCAS: $marcas');
      print('FORNECEDORES: $forn');

      setState(() {
        _categorias = cats;
        _marcas = marcas;
        _fornecedores = forn;
      });
    } catch (e, s) {
      print('ERRO _carregarSelects: $e');
      print(s);
    }
  }

  Future<void> _salvar() async {
    if (_nomeCtrl.text.isEmpty || _categoriaId == null || _marcaId == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Preencha os campos obrigatórios')));
      return;
    }
    setState(() => _salvando = true);
    try {
      final body = {
        'nome': _nomeCtrl.text,
        'codigoInterno': _codigoCtrl.text,
        if (_codFornCtrl.text.isNotEmpty) 'codigoFornecedor': _codFornCtrl.text,
        'categoriaId': _categoriaId,
        'marcaId': _marcaId,
        if (_fornecedorId != null) 'fornecedorId': _fornecedorId,
        'custo': double.tryParse(_custoCtrl.text) ?? 0,
        'precoVenda': double.tryParse(_precoCtrl.text) ?? 0,
        'estoqueMinimo': int.tryParse(_estMinCtrl.text) ?? 0,
        if (_locCtrl.text.isNotEmpty) 'localizacaoFisica': _locCtrl.text,
      };

      if (_editando) {
        await _controller.atualizar(widget.produto!.id, body);
      } else {
        await _controller.criar(body);
      }

      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      setState(() => _salvando = false);
    }
  }

  Widget _campo(String label, TextEditingController ctrl, {TextInputType tipo = TextInputType.text}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: ctrl,
        keyboardType: tipo,
        decoration: InputDecoration(labelText: label, border: const OutlineInputBorder()),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_editando ? 'Editar Produto' : 'Novo Produto')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _campo('Nome *', _nomeCtrl),
            _campo('Código Interno *', _codigoCtrl),
            _campo('Código Fornecedor', _codFornCtrl),
            DropdownButtonFormField<String>(
              value: _categoriaId,
              decoration: const InputDecoration(labelText: 'Categoria *', border: OutlineInputBorder()),
              items: _categorias.map<DropdownMenuItem<String>>((c) =>
                DropdownMenuItem(value: c['id'], child: Text(c['nome']))).toList(),
              onChanged: (v) => setState(() => _categoriaId = v),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _marcaId,
              decoration: const InputDecoration(labelText: 'Marca *', border: OutlineInputBorder()),
              items: _marcas.map<DropdownMenuItem<String>>((m) =>
                DropdownMenuItem(value: m['id'], child: Text(m['nome']))).toList(),
              onChanged: (v) => setState(() => _marcaId = v),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _fornecedorId,
              decoration: const InputDecoration(labelText: 'Fornecedor', border: OutlineInputBorder()),
              items: [
                const DropdownMenuItem(value: null, child: Text('Nenhum')),
                ..._fornecedores.map<DropdownMenuItem<String>>((f) =>
                  DropdownMenuItem(value: f['id'], child: Text(f['nome']))),
              ],
              onChanged: (v) => setState(() => _fornecedorId = v),
            ),
            const SizedBox(height: 12),
            _campo('Custo (R\$)', _custoCtrl, tipo: const TextInputType.numberWithOptions(decimal: true)),
            _campo('Preço de Venda (R\$)', _precoCtrl, tipo: const TextInputType.numberWithOptions(decimal: true)),
            _campo('Estoque Mínimo', _estMinCtrl, tipo: TextInputType.number),
            _campo('Localização Física', _locCtrl),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: FilledButton(
                onPressed: _salvando ? null : _salvar,
                child: _salvando ? const CircularProgressIndicator() : Text(_editando ? 'Salvar' : 'Criar Produto'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
