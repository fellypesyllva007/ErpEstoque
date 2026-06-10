class FileStorage {
  /// Salva bytes como arquivo e retorna o caminho (IO) ou dispara download (Web).
  static Future<String?> salvar(String nomeArquivo, List<int> bytes) async {
    throw UnimplementedError('FileStorage não suportado nesta plataforma');
  }

  /// Lê um arquivo escolhido pelo usuário como String.
  /// Retorna null se cancelar.
  static Future<({String nome, String conteudo})?> pickTextFile({
    List<String> extensoes = const ['csv'],
  }) async {
    throw UnimplementedError('FileStorage não suportado nesta plataforma');
  }

  /// Lê um arquivo escolhido pelo usuário como bytes.
  static Future<({String nome, List<int> bytes})?> pickBytesFile({
    List<String> extensoes = const ['csv'],
  }) async {
    throw UnimplementedError('FileStorage não suportado nesta plataforma');
  }
}
