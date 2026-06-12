import 'dart:convert';

import 'package:flutter/material.dart';

import '../../core/app_config.dart';
import '../../widgets/erp_scaffold.dart';
import 'fiscal_models.dart';
import 'nfeweb_service.dart';

class FiscalPage extends StatefulWidget {
  const FiscalPage({super.key});

  @override
  State<FiscalPage> createState() => _FiscalPageState();
}

class _FiscalPageState extends State<FiscalPage> {
  final _service = const NfeWebService();
  final _cnpjController = TextEditingController(text: '12345678000195');
  final _numeroController = TextEditingController(text: '123');
  final _serieController = TextEditingController(text: '1');
  final _codigoUfController = TextEditingController(text: '35');
  final _codigoNumericoController = TextEditingController(text: '12345678');
  final _emissaoController = TextEditingController(text: '20/05/2026');

  FiscalApiResponse? _health;
  FiscalApiResponse? _acbr;
  FiscalApiResponse? _db;
  List<EmitenteFiscal> _emitentes = const [];
  String? _emitenteSelecionado;
  String? _chave;
  String? _statusSefaz;
  String? _erro;
  bool _carregando = false;

  @override
  void initState() {
    super.initState();
    _carregarDiagnostico();
  }

  @override
  void dispose() {
    _cnpjController.dispose();
    _numeroController.dispose();
    _serieController.dispose();
    _codigoUfController.dispose();
    _codigoNumericoController.dispose();
    _emissaoController.dispose();
    super.dispose();
  }

  Future<void> _executar(Future<void> Function() acao) async {
    setState(() {
      _carregando = true;
      _erro = null;
    });
    try {
      await acao();
    } catch (e) {
      setState(() => _erro = e.toString());
    } finally {
      if (mounted) setState(() => _carregando = false);
    }
  }

  Future<void> _carregarDiagnostico() async {
    await _executar(() async {
      final results = await Future.wait([
        _service.health(),
        _service.acbrInfo(),
        _service.dbStatus(),
      ]);
      final emitentes = await _service.emitentes();
      setState(() {
        _health = results[0];
        _acbr = results[1];
        _db = results[2];
        _emitentes = emitentes;
        _emitenteSelecionado = emitentes.isEmpty ? null : emitentes.first.id;
      });
    });
  }

  Future<void> _gerarChave() async {
    await _executar(() async {
      final resultado = await _service.gerarChave(
        GerarChaveNfeRequest(
          codigoUf: int.tryParse(_codigoUfController.text) ?? 35,
          codigoNumerico: int.tryParse(_codigoNumericoController.text) ?? 12345678,
          modelo: 55,
          serie: int.tryParse(_serieController.text) ?? 1,
          numero: int.tryParse(_numeroController.text) ?? 1,
          tipoEmissao: 1,
          emissao: _emissaoController.text,
          cnpjCpf: _cnpjController.text.replaceAll(RegExp(r'\D'), ''),
        ),
      );
      setState(() => _chave = resultado.chave);
    });
  }

  Future<void> _consultarStatusSefaz() async {
    await _executar(() async {
      final status = await _service.statusServico(emitterId: _emitenteSelecionado);
      const encoder = JsonEncoder.withIndent('  ');
      setState(() => _statusSefaz = encoder.convert(status.raw));
    });
  }

  @override
  Widget build(BuildContext context) {
    return ErpScaffold(
      titulo: 'Fiscal NF-e / ACBrLib',
      body: RefreshIndicator(
        onRefresh: _carregarDiagnostico,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _HeaderCard(
              baseUrl: AppConfig.nfeWebApiUrl,
              carregando: _carregando,
              onAtualizar: _carregarDiagnostico,
            ),
            if (_erro != null) ...[
              const SizedBox(height: 12),
              Card(
                color: Colors.red.shade50,
                child: ListTile(
                  leading: const Icon(Icons.error_outline, color: Colors.red),
                  title: const Text('Falha no gateway fiscal'),
                  subtitle: Text(_erro!),
                ),
              ),
            ],
            const SizedBox(height: 12),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                _StatusCard(title: 'NfeWeb API', response: _health, icon: Icons.cloud_done),
                _StatusCard(title: 'ACBrLibNFe', response: _acbr, icon: Icons.extension),
                _StatusCard(title: 'Base fiscal', response: _db, icon: Icons.storage),
              ],
            ),
            const SizedBox(height: 16),
            _EmitentesCard(
              emitentes: _emitentes,
              selecionado: _emitenteSelecionado,
              onChanged: (value) => setState(() => _emitenteSelecionado = value),
              onStatusSefaz: _consultarStatusSefaz,
            ),
            const SizedBox(height: 16),
            _GerarChaveCard(
              cnpjController: _cnpjController,
              numeroController: _numeroController,
              serieController: _serieController,
              codigoUfController: _codigoUfController,
              codigoNumericoController: _codigoNumericoController,
              emissaoController: _emissaoController,
              chave: _chave,
              onGerar: _gerarChave,
            ),
            if (_statusSefaz != null) ...[
              const SizedBox(height: 16),
              _JsonCard(title: 'Status SEFAZ', json: _statusSefaz!),
            ],
          ],
        ),
      ),
    );
  }
}

class _HeaderCard extends StatelessWidget {
  final String baseUrl;
  final bool carregando;
  final VoidCallback onAtualizar;

  const _HeaderCard({
    required this.baseUrl,
    required this.carregando,
    required this.onAtualizar,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            CircleAvatar(
              radius: 28,
              backgroundColor: Colors.indigo.withOpacity(0.12),
              child: const Icon(Icons.receipt_long, color: Colors.indigo),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Gateway fiscal NfeWeb + ACBrLib', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text('Base URL: $baseUrl'),
                  const SizedBox(height: 4),
                  const Text('Use NFEWEB_API_URL ou ERP_NFEWEB_API_URL no Web para apontar para o Oracle/ACBrLib.'),
                ],
              ),
            ),
            const SizedBox(width: 12),
            FilledButton.icon(
              onPressed: carregando ? null : onAtualizar,
              icon: carregando
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Icon(Icons.refresh),
              label: const Text('Atualizar'),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusCard extends StatelessWidget {
  final String title;
  final FiscalApiResponse? response;
  final IconData icon;

  const _StatusCard({required this.title, required this.response, required this.icon});

  @override
  Widget build(BuildContext context) {
    final ok = response?.ok ?? false;
    return SizedBox(
      width: 260,
      child: Card(
        child: ListTile(
          leading: CircleAvatar(
            backgroundColor: ok ? Colors.green.withOpacity(0.12) : Colors.orange.withOpacity(0.12),
            child: Icon(icon, color: ok ? Colors.green : Colors.orange),
          ),
          title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
          subtitle: Text(response == null ? 'Aguardando diagnóstico' : 'Status: ${response!.status}'),
        ),
      ),
    );
  }
}

class _EmitentesCard extends StatelessWidget {
  final List<EmitenteFiscal> emitentes;
  final String? selecionado;
  final ValueChanged<String?> onChanged;
  final VoidCallback onStatusSefaz;

  const _EmitentesCard({
    required this.emitentes,
    required this.selecionado,
    required this.onChanged,
    required this.onStatusSefaz,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Emitentes fiscais', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            if (emitentes.isEmpty)
              const Text('Nenhum emitente retornado por /emitentes.')
            else
              DropdownButtonFormField<String>(
                value: selecionado,
                decoration: const InputDecoration(labelText: 'Emitente'),
                items: emitentes
                    .map((e) => DropdownMenuItem(
                          value: e.id,
                          child: Text('${e.nome} ${e.cnpj ?? ''} ${e.uf ?? ''}'.trim()),
                        ))
                    .toList(),
                onChanged: onChanged,
              ),
            const SizedBox(height: 12),
            Align(
              alignment: Alignment.centerRight,
              child: FilledButton.icon(
                onPressed: onStatusSefaz,
                icon: const Icon(Icons.public),
                label: const Text('Status SEFAZ'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _GerarChaveCard extends StatelessWidget {
  final TextEditingController cnpjController;
  final TextEditingController numeroController;
  final TextEditingController serieController;
  final TextEditingController codigoUfController;
  final TextEditingController codigoNumericoController;
  final TextEditingController emissaoController;
  final String? chave;
  final VoidCallback onGerar;

  const _GerarChaveCard({
    required this.cnpjController,
    required this.numeroController,
    required this.serieController,
    required this.codigoUfController,
    required this.codigoNumericoController,
    required this.emissaoController,
    required this.chave,
    required this.onGerar,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Gerar chave NF-e via ACBrLib', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                SizedBox(width: 220, child: TextField(controller: cnpjController, decoration: const InputDecoration(labelText: 'CNPJ/CPF'))),
                SizedBox(width: 120, child: TextField(controller: codigoUfController, decoration: const InputDecoration(labelText: 'Código UF'))),
                SizedBox(width: 150, child: TextField(controller: codigoNumericoController, decoration: const InputDecoration(labelText: 'Código numérico'))),
                SizedBox(width: 120, child: TextField(controller: serieController, decoration: const InputDecoration(labelText: 'Série'))),
                SizedBox(width: 120, child: TextField(controller: numeroController, decoration: const InputDecoration(labelText: 'Número'))),
                SizedBox(width: 150, child: TextField(controller: emissaoController, decoration: const InputDecoration(labelText: 'Emissão'))),
              ],
            ),
            const SizedBox(height: 12),
            Align(
              alignment: Alignment.centerRight,
              child: FilledButton.icon(
                onPressed: onGerar,
                icon: const Icon(Icons.vpn_key),
                label: const Text('Gerar chave'),
              ),
            ),
            if (chave != null && chave!.isNotEmpty) ...[
              const Divider(),
              SelectableText('Chave: $chave', style: const TextStyle(fontWeight: FontWeight.bold)),
            ],
          ],
        ),
      ),
    );
  }
}

class _JsonCard extends StatelessWidget {
  final String title;
  final String json;

  const _JsonCard({required this.title, required this.json});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.black87,
                borderRadius: BorderRadius.circular(8),
              ),
              child: SelectableText(
                json,
                style: const TextStyle(color: Colors.white, fontFamily: 'monospace'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
