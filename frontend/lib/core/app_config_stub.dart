class AppConfig {
  static String get apiUrl => const String.fromEnvironment(
        'API_URL',
        defaultValue: 'http://localhost:4000',
      );
  static String get nfeWebApiUrl => const String.fromEnvironment(
        'NFEWEB_API_URL',
        defaultValue: 'http://127.0.0.1:3333',
      );

  static const String versao = '2.0.0';
  static const String nomeApp = 'ERP Assistência Técnica';
}
