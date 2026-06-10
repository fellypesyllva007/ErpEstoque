/// Serviço de impressão de etiquetas e documentos.
/// As telas nunca conhecem a implementação — apenas chamam PrinterService.
import 'printer_service_stub.dart'
    if (dart.library.html) 'printer_service_web.dart'
    if (dart.library.io) 'printer_service_io.dart';

export 'printer_service_stub.dart'
    if (dart.library.html) 'printer_service_web.dart'
    if (dart.library.io) 'printer_service_io.dart';
