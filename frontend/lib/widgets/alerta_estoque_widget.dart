import 'dart:async';
import 'package:flutter/material.dart';
import '../core/api_service.dart';

class AlertaEstoqueOverlay extends StatefulWidget {
  const AlertaEstoqueOverlay({super.key});
  @override
  State<AlertaEstoqueOverlay> createState() => _AlertaEstoqueOverlayState();
}

class _AlertaEstoqueOverlayState extends State<AlertaEstoqueOverlay> {
  int _criticos = 0;
  int _alertas = 0;
  Timer? _timer;
  bool _expandido = false;
  List<dynamic> _itens = [];

  @override
  void initState() {
    super.initState();
    _verificar();
    _timer = Timer.periodic(const Duration(minutes: 2), (_) => _verificar());
  }

  @override
  void dispose() { _timer?.cancel(); super.dispose(); }

  Future<void> _verificar() async {
    try {
      final data = await ApiService.get('/notificacoes/alertas-estoque') as Map<String, dynamic>;
      setState(() {
        _criticos = data['criticos'] ?? 0;
        _alertas = data['alertas'] ?? 0;
        _itens = (data['itens'] as List?) ?? [];
      });
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final total = _criticos + _alertas;
    if (total == 0) return const SizedBox.shrink();

    return Positioned(
      bottom: 80,
      right: 16,
      child: Material(
        elevation: 8,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () => setState(() => _expandido = !_expandido),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 250),
            width: _expandido ? 320 : 56,
            constraints: BoxConstraints(maxHeight: _expandido ? 400 : 56),
            decoration: BoxDecoration(
              color: _criticos > 0 ? Colors.red.shade600 : Colors.orange.shade600,
              borderRadius: BorderRadius.circular(12),
            ),
            child: _expandido ? _buildExpandido() : _buildCompacto(total),
          ),
        ),
      ),
    );
  }

  Widget _buildCompacto(int total) {
    return SizedBox(
      width: 56, height: 56,
      child: Stack(alignment: Alignment.center, children: [
        const Icon(Icons.warning, color: Colors.white, size: 28),
        Positioned(top: 6, right: 6, child: Container(
          padding: const EdgeInsets.all(2),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10)),
          constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
          child: Text('$total', style: TextStyle(color: _criticos > 0 ? Colors.red : Colors.orange, fontSize: 10, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
        )),
      ]),
    );
  }

  Widget _buildExpandido() {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Row(children: [
          const Icon(Icons.warning, color: Colors.white),
          const SizedBox(width: 8),
          Expanded(child: Text('Alertas de Estoque', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
          IconButton(icon: const Icon(Icons.close, color: Colors.white, size: 18), onPressed: () => setState(() => _expandido = false), padding: EdgeInsets.zero),
        ]),
        if (_criticos > 0) _chip('$_criticos zerados', Colors.red.shade900),
        if (_alertas > 0) _chip('$_alertas abaixo do mínimo', Colors.orange.shade900),
        const Divider(color: Colors.white30),
        Flexible(
          child: ListView.builder(
            shrinkWrap: true,
            itemCount: _itens.take(8).length,
            itemBuilder: (_, i) {
              final item = _itens[i];
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: Text(item['mensagem'], style: const TextStyle(color: Colors.white, fontSize: 12)),
              );
            },
          ),
        ),
      ]),
    );
  }

  Widget _chip(String label, Color cor) => Container(
    margin: const EdgeInsets.symmetric(vertical: 2),
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
    decoration: BoxDecoration(color: cor, borderRadius: BorderRadius.circular(12)),
    child: Text(label, style: const TextStyle(color: Colors.white, fontSize: 12)),
  );
}
