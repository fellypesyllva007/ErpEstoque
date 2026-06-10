import 'package:flutter/material.dart';
import '../platform/barcode/barcode_service.dart';

/// Campo de leitura de código de barras.
///
/// Funciona em TODAS as plataformas de duas formas:
/// 1. Scanner USB (teclado) → digita o código + Enter → funciona em qualquer lugar.
/// 2. Câmera → usa BarcodeService → disponível quando mobile_scanner estiver configurado.
class BarcodeScannerField extends StatefulWidget {
  final String label;
  final void Function(String codigo) onScanned;
  final bool autofocus;

  const BarcodeScannerField({
    super.key,
    required this.label,
    required this.onScanned,
    this.autofocus = false,
  });

  @override
  State<BarcodeScannerField> createState() => _BarcodeScannerFieldState();
}

class _BarcodeScannerFieldState extends State<BarcodeScannerField> {
  final _ctrl = TextEditingController();
  final _focus = FocusNode();

  @override
  void dispose() {
    _ctrl.dispose();
    _focus.dispose();
    super.dispose();
  }

  void _onSubmit(String value) {
    final codigo = value.trim();
    if (codigo.isNotEmpty) {
      widget.onScanned(codigo);
      _ctrl.clear();
    }
  }

  Future<void> _scanCamara() async {
    try {
      final codigo = await BarcodeService.scanear();
      if (codigo != null && codigo.isNotEmpty) {
        widget.onScanned(codigo);
      }
    } catch (e) {
      // Câmera não configurada — ignora silenciosamente
    }
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: _ctrl,
      focusNode: _focus,
      autofocus: widget.autofocus,
      decoration: InputDecoration(
        labelText: widget.label,
        hintText: 'Scanner USB ou digite o código...',
        prefixIcon: const Icon(Icons.qr_code_scanner),
        border: const OutlineInputBorder(),
        suffixIcon: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Botão câmera — apenas exibido quando câmera disponível
            if (BarcodeService.suportado)
              IconButton(
                icon: const Icon(Icons.camera_alt),
                tooltip: 'Ler pela câmera',
                onPressed: _scanCamara,
              ),
            IconButton(
              icon: const Icon(Icons.search),
              tooltip: 'Buscar',
              onPressed: () => _onSubmit(_ctrl.text),
            ),
          ],
        ),
      ),
      onSubmitted: _onSubmit,
      textInputAction: TextInputAction.search,
    );
  }
}
