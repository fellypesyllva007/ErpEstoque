// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;

/// Configuração para Web.
/// URL pode ser sobrescrita via:
///   localStorage.setItem('ERP_API_URL', 'http://192.168.1.100:4000')
/// Ou via --dart-define=API_URL=... no build.
class AppConfig {
  static String get apiUrl {
    // 1. Prioridade: dart-define (build time)
    const buildUrl = String.fromEnvironment('API_URL', defaultValue: '');
    if (buildUrl.isNotEmpty) return buildUrl;

    // 2. localStorage (runtime — permite trocar sem recompilar)
    final stored = html.window.localStorage['ERP_API_URL'] ?? '';
    if (stored.isNotEmpty) return stored;

    // 3. Mesmo origin (quando o Flutter web é servido pelo próprio backend)
    final origin = html.window.location.origin ?? '';
    if (origin.isNotEmpty && !origin.contains('localhost:')) return origin;

    // 4. Fallback
    return 'http://localhost:4000';
  }

  static const String versao = '2.0.0';
  static const String nomeApp = 'ERP Assistência Técnica';
}
