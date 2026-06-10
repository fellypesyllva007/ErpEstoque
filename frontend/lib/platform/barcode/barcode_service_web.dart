/// Scanner via câmera para Web.
/// mobile_scanner suporta web via câmera do navegador.
class BarcodeService {
  static bool get suportado => false; // Mude para true ao configurar mobile_scanner

  static Future<String?> scanear() async {
    // TODO: descomentar ao adicionar mobile_scanner ao pubspec.yaml:
    // final result = await MobileScannerController().barcodes.first;
    // return result.barcodes.firstOrNull?.rawValue;
    return null;
  }
}
