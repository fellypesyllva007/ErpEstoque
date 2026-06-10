import 'package:url_launcher/url_launcher.dart';

class PrinterService {
  static Future<void> imprimirEtiquetas(List<String> ids, String baseUrl, String? token) async {
    final idsParam = ids.join(',');
    final tokenParam = token != null ? '&token=$token' : '';
    final uri = Uri.parse('$baseUrl/produtos/etiquetas?ids=$idsParam$tokenParam');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      throw Exception('Não foi possível abrir o navegador');
    }
  }
}
