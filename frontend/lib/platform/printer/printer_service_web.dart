// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;

class PrinterService {
  static Future<void> imprimirEtiquetas(List<String> ids, String baseUrl, String? token) async {
    final idsParam = ids.join(',');
    final tokenParam = token != null ? '&token=$token' : '';
    final url = '$baseUrl/produtos/etiquetas?ids=$idsParam$tokenParam';
    html.window.open(url, '_blank');
  }
}
