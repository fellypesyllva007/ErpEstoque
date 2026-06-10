/// Scanner via câmera para plataformas IO (Windows Desktop, Android, Linux).
/// 
/// Para habilitar no Android: adicione ao AndroidManifest.xml:
///   <uses-permission android:name="android.permission.CAMERA"/>
///
/// Para habilitar no Windows: adicione ao CMakeLists.txt do runner:
///   (veja docs do mobile_scanner)
///
/// Enquanto mobile_scanner não estiver configurado, retorna null
/// e o campo de texto USB continua funcionando normalmente.
class BarcodeService {
  static bool get suportado => false; // Mude para true ao configurar mobile_scanner

  static Future<String?> scanear() async {
    // TODO: descomentar ao adicionar mobile_scanner ao pubspec.yaml:
    // final result = await MobileScannerController().barcodes.first;
    // return result.barcodes.firstOrNull?.rawValue;
    return null;
  }
}
