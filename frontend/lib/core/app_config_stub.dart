class AppConfig {
  static String get apiUrl => const String.fromEnvironment(
        'API_URL',
        defaultValue: 'http://localhost:4000',
      );
  static const String versao = '2.0.0';
  static const String nomeApp = 'ERP Assistência Técnica';
}
