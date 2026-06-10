import 'package:url_launcher/url_launcher.dart';

class LauncherService {
  static Future<void> abrirUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }
}
