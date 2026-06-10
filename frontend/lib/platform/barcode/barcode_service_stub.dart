/// Scanner de código de barras via câmera.
/// Em todas as plataformas, o scanner USB funciona sem esta abstração
/// (scanner USB = teclado → campo de texto + Enter).
/// Esta abstração é para scanner via câmera (mobile/webcam).
class BarcodeService {
  static bool get suportado => false;

  static Future<String?> scanear() async {
    throw UnimplementedError('BarcodeService não suportado nesta plataforma');
  }
}
