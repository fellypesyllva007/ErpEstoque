import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:path_provider/path_provider.dart';

class FileStorage {
  static Future<String?> salvar(String nomeArquivo, List<int> bytes) async {
    // Deixa o usuário escolher onde salvar (se suportado), senão salva em Documentos
    String? caminho;

    try {
      caminho = await FilePicker.platform.saveFile(
        dialogTitle: 'Salvar arquivo',
        fileName: nomeArquivo,
      );
    } catch (_) {
      // FilePicker.saveFile pode não estar disponível em todas as versões / plataformas IO
    }

    if (caminho == null) {
      final dir = await getApplicationDocumentsDirectory();
      caminho = '${dir.path}/$nomeArquivo';
    }

    final arquivo = File(caminho);
    await arquivo.writeAsBytes(bytes);
    return caminho;
  }

  static Future<({String nome, String conteudo})?> pickTextFile({
    List<String> extensoes = const ['csv'],
  }) async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: extensoes,
      allowMultiple: false,
    );
    if (result == null || result.files.single.path == null) return null;
    final path = result.files.single.path!;
    final conteudo = await File(path).readAsString();
    return (nome: result.files.single.name, conteudo: conteudo);
  }

  static Future<({String nome, List<int> bytes})?> pickBytesFile({
    List<String> extensoes = const ['csv'],
  }) async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: extensoes,
      allowMultiple: false,
      withData: true,
    );
    if (result == null || result.files.single.bytes == null) return null;
    return (
      nome: result.files.single.name,
      bytes: result.files.single.bytes!.toList(),
    );
  }
}
