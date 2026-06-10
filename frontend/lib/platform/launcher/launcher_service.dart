import 'launcher_service_stub.dart'
    if (dart.library.html) 'launcher_service_web.dart'
    if (dart.library.io) 'launcher_service_io.dart';

export 'launcher_service_stub.dart'
    if (dart.library.html) 'launcher_service_web.dart'
    if (dart.library.io) 'launcher_service_io.dart';
