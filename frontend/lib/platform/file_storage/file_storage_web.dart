// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;
import 'package:file_picker/file_picker.dart';

class FileStorage {
  /// No web: dispara download do arquivo via Blob.
  static Future<String?> salvar(String nomeArquivo, List<int> bytes) async {
    final blob = html.Blob([bytes]);
    final url = html.Url.createObjectUrlFromBlob(blob);
    final anchor = html.AnchorElement(href: url)
      ..setAttribute('download', nomeArquivo)
      ..click();
    html.Url.revokeObjectUrl(url);
    return nomeArquivo; // retorna só o nome — no web não há caminho real
  }

  /// No web: FilePicker já retorna bytes diretamente.
  static Future<({String nome, String conteudo})?> pickTextFile({
    List<String> extensoes = const ['csv'],
  }) async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: extensoes,
      allowMultiple: false,
      withData: true,
    );
    if (result == null || result.files.single.bytes == null) return null;
    final conteudo = String.fromCharCodes(result.files.single.bytes!);
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
