// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;

class LauncherService {
  static Future<void> abrirUrl(String url) async {
    html.window.open(url, '_blank');
  }
}
