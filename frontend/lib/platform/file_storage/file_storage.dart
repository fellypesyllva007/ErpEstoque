/// Interface de armazenamento de arquivos — independente de plataforma.
/// As telas usam apenas esta classe; nunca importam dart:io ou dart:html.
import 'file_storage_stub.dart'
    if (dart.library.html) 'file_storage_web.dart'
    if (dart.library.io) 'file_storage_io.dart';

export 'file_storage_stub.dart'
    if (dart.library.html) 'file_storage_web.dart'
    if (dart.library.io) 'file_storage_io.dart';
