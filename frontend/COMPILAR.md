# Compilando o ERP para múltiplas plataformas

## Arquitetura de abstração

```
lib/
├── core/
│   ├── app_config.dart          ← entrada (redireciona por plataforma)
│   ├── app_config_io.dart       ← Windows / Android / Linux
│   ├── app_config_web.dart      ← Web (lê localStorage ou origin)
│   └── api_service.dart         ← HTTP — funciona em todas
│
├── platform/
│   ├── file_storage/
│   │   ├── file_storage.dart        ← entrada
│   │   ├── file_storage_io.dart     ← File + FilePicker (IO)
│   │   └── file_storage_web.dart    ← Blob download + FilePicker bytes
│   │
│   ├── printer/
│   │   ├── printer_service.dart     ← entrada
│   │   ├── printer_service_io.dart  ← url_launcher (abre no browser)
│   │   └── printer_service_web.dart ← window.open (nova aba)
│   │
│   ├── launcher/
│   │   ├── launcher_service.dart    ← entrada
│   │   ├── launcher_service_io.dart ← url_launcher
│   │   └── launcher_service_web.dart← window.open
│   │
│   └── barcode/
│       ├── barcode_service.dart     ← entrada
│       ├── barcode_service_io.dart  ← câmera IO (mobile_scanner)
│       └── barcode_service_web.dart ← câmera web (mobile_scanner)
│
└── modules/                     ← ZERO imports platform-específicos
```

## Compilar — Windows

```bash
# IP do backend na rede local:
flutter build windows \
  --dart-define=API_URL=http://192.168.1.100:4000 \
  --release

# Executável em:
# build/windows/x64/runner/Release/erp_estoque.exe
```

## Compilar — Web

```bash
# Opção 1: URL fixa no build
flutter build web \
  --dart-define=API_URL=http://192.168.1.100:4000 \
  --release \
  --web-renderer canvaskit

# Opção 2: URL configurável via localStorage (sem recompilar)
flutter build web --release --web-renderer canvaskit
# Usuário configura no navegador:
# localStorage.setItem('ERP_API_URL', 'http://192.168.1.100:4000')

# Servir os arquivos (build/web/) com qualquer servidor HTTP:
cd build/web
python3 -m http.server 8080
# Ou via nginx / caddy / Apache
```

## Compilar — Android

```bash
flutter build apk \
  --dart-define=API_URL=http://192.168.1.100:4000 \
  --release

# APK em: build/app/outputs/flutter-apk/app-release.apk
```

## Compilar — Linux

```bash
flutter build linux \
  --dart-define=API_URL=http://192.168.1.100:4000 \
  --release
```

## Servir Web com o próprio backend (same-origin)

No `docker-compose.yml`, adicione um serviço nginx que serve o Flutter Web
e faz proxy para o backend — assim o web app usa o mesmo origin:

```nginx
server {
  listen 80;

  # Flutter Web
  location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
  }

  # Proxy para o backend
  location /api/ {
    rewrite ^/api/(.*)$ /$1 break;
    proxy_pass http://backend:4000;
    proxy_set_header Host $host;
  }
}
```

Neste caso, o AppConfig detecta automaticamente o origin e usa `window.location.origin`.

## Habilitar scanner de câmera (mobile_scanner)

1. Adicione ao `pubspec.yaml`:
   ```yaml
   mobile_scanner: ^5.2.3
   ```

2. Edite `lib/platform/barcode/barcode_service_io.dart` e
   `lib/platform/barcode/barcode_service_web.dart`:
   ```dart
   static bool get suportado => true;

   static Future<String?> scanear() async {
     // Implementar com MobileScannerController
   }
   ```

3. Para Android: adicione permissão no `AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.CAMERA"/>
   ```

## Regra de ouro

**As telas (`lib/modules/`) NUNCA importam:**
- `dart:io`
- `dart:html`
- `path_provider`
- `dart:io` → `File`
- `url_launcher` diretamente

**Sempre use a camada `lib/platform/`.**
