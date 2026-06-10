import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../platform/file_storage/file_storage.dart';
import '../../platform/launcher/launcher_service.dart';

class ImportacaoExcelPage extends StatefulWidget {
  const ImportacaoExcelPage({super.key});
  @override
  State<ImportacaoExcelPage> createState() => _ImportacaoExcelPageState();
}

class _ImportacaoExcelPageState extends State<ImportacaoExcelPage> {
  bool _processando = false;
  Map<String, dynamic>? _resultado;
  String? _arquivoNome;

  Future<void> _baixarTemplate() async {
    try {
      // Busca o CSV do backend
      final token = await ApiService.getToken();
      final url = '${ApiService.baseUrl}/produtos/importacao/template'
          '${token != null ? '?token=$token' : ''}';

      // No web: abre diretamente para download.
      // No IO: faz GET e salva via FileStorage.
      await LauncherService.abrirUrl(url);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Template baixado!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Erro: $e')));
      }
    }
  }

  Future<void> _selecionarArquivo() async {
    final resultado = await FileStorage.pickTextFile(extensoes: ['csv']);
    if (resultado == null) return;

    setState(() {
      _arquivoNome = resultado.nome;
      _resultado = null;
    });
    await _importar(resultado.conteudo);
  }

  Future<void> _importar(String conteudo) async {
    setState(() => _processando = true);
    try {
      final linhas = conteudo.split('\n');
      if (linhas.length < 2) throw Exception('Arquivo vazio ou sem dados');

      final cabecalho = linhas[0]
          .replaceAll('\r', '')
          .replaceAll('\uFEFF', '') // remove BOM
          .split(',');
      final dados = <Map<String, dynamic>>[];

      for (int i = 1; i < linhas.length; i++) {
        final linha = linhas[i].replaceAll('\r', '').trim();
        if (linha.isEmpty) continue;
        final cols = linha.split(',');
        final mapa = <String, dynamic>{};
        for (int j = 0; j < cabecalho.length && j < cols.length; j++) {
          final chave = cabecalho[j].trim();
          final valor = cols[j].trim().replaceAll('"', '');
          if (['custo', 'precoVenda'].contains(chave)) {
            mapa[chave] = double.tryParse(valor) ?? 0;
          } else if (['estoqueAtual', 'estoqueMinimo'].contains(chave)) {
            mapa[chave] = int.tryParse(valor) ?? 0;
          } else {
            mapa[chave] = valor;
          }
        }
        if ((mapa['codigoInterno'] as String?)?.isNotEmpty == true) {
          dados.add(mapa);
        }
      }

      final res =
          await ApiService.post('/produtos/importacao', {'linhas': dados});
      setState(() => _resultado = res);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Erro: $e')));
      }
    } finally {
      setState(() => _processando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Importação de Produtos — CSV')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('📋 Como usar',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    const Text('1. Baixe o template CSV'),
                    const Text('2. Preencha no Excel ou LibreOffice (salve como .csv)'),
                    const Text('3. Clique em "Selecionar Arquivo" para importar'),
                    const SizedBox(height: 12),
                    Wrap(spacing: 12, runSpacing: 8, children: [
                      OutlinedButton.icon(
                        onPressed: _baixarTemplate,
                        icon: const Icon(Icons.download),
                        label: const Text('Baixar Template CSV'),
                      ),
                      FilledButton.icon(
                        onPressed: _processando ? null : _selecionarArquivo,
                        icon: const Icon(Icons.upload_file),
                        label: Text(_processando
                            ? 'Processando...'
                            : 'Selecionar Arquivo CSV'),
                      ),
                    ]),
                  ],
                ),
              ),
            ),
            if (_arquivoNome != null) ...[
              const SizedBox(height: 12),
              Text('Arquivo: $_arquivoNome',
                  style: const TextStyle(color: Colors.grey)),
            ],
            if (_processando)
              const Padding(
                  padding: EdgeInsets.all(24),
                  child: Center(child: CircularProgressIndicator())),
            if (_resultado != null) ...[
              const SizedBox(height: 20),
              const Text('Resultado',
                  style: TextStyle(
                      fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Row(children: [
                _stat('Criados', '${_resultado!['criados']}', Colors.green),
                const SizedBox(width: 12),
                _stat('Atualizados', '${_resultado!['atualizados']}',
                    Colors.blue),
                const SizedBox(width: 12),
                _stat('Erros',
                    '${(_resultado!['erros'] as List).length}', Colors.red),
              ]),
              if ((_resultado!['erros'] as List).isNotEmpty) ...[
                const SizedBox(height: 12),
                const Text('⚠️ Erros:',
                    style: TextStyle(
                        fontWeight: FontWeight.bold, color: Colors.red)),
                Card(
                  color: Colors.red.shade50,
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: (_resultado!['erros'] as List).length,
                    itemBuilder: (_, i) => ListTile(
                      dense: true,
                      title: Text((_resultado!['erros'] as List)[i]),
                    ),
                  ),
                ),
              ],
            ],
          ],
        ),
      ),
    );
  }

  Widget _stat(String label, String valor, Color cor) => Card(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          child: Column(children: [
            Text(valor,
                style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: cor)),
            Text(label, style: const TextStyle(fontSize: 13)),
          ]),
        ),
      );
}
