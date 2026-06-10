import 'barcode_service_stub.dart'
    if (dart.library.html) 'barcode_service_web.dart'
    if (dart.library.io) 'barcode_service_io.dart';

export 'barcode_service_stub.dart'
    if (dart.library.html) 'barcode_service_web.dart'
    if (dart.library.io) 'barcode_service_io.dart';
