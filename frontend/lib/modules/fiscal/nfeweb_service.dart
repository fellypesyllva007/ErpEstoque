import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../core/app_config.dart';
import 'fiscal_models.dart';

class NfeWebService {
  const NfeWebService();

  String get baseUrl => AppConfig.nfeWebApiUrl;

  Uri _uri(String path) => Uri.parse('$baseUrl$path');

  Future<Map<String, dynamic>> _get(String path) async {
    final response = await http.get(_uri(path));
    return _decode(response);
  }

  Future<Map<String, dynamic>> _post(String path, Map<String, dynamic> body) async {
    final response = await http.post(
      _uri(path),
      headers: const {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );
    return _decode(response);
  }

  Map<String, dynamic> _decode(http.Response response) {
    final decoded = response.body.isEmpty ? <String, dynamic>{} : jsonDecode(response.body);
    final payload = decoded is Map<String, dynamic>
        ? decoded
        : <String, dynamic>{'status': 'error', 'message': 'Resposta fiscal inválida'};

    if (response.statusCode >= 400) {
      throw Exception(payload['message'] ?? 'Erro na comunicação fiscal');
    }

    return payload;
  }

  Future<FiscalApiResponse> health() async {
    return FiscalApiResponse.fromJson(await _get('/health'));
  }

  Future<FiscalApiResponse> acbrInfo() async {
    return FiscalApiResponse.fromJson(await _get('/acbr/info'));
  }

  Future<FiscalApiResponse> dbStatus() async {
    return FiscalApiResponse.fromJson(await _get('/db/status'));
  }

  Future<List<EmitenteFiscal>> emitentes() async {
    final data = await _get('/emitentes');
    final emitentes = data['emitentes'];
    if (emitentes is! List) return const [];
    return emitentes
        .whereType<Map<String, dynamic>>()
        .map(EmitenteFiscal.fromJson)
        .toList();
  }

  Future<ResultadoChaveNfe> gerarChave(GerarChaveNfeRequest request) async {
    return ResultadoChaveNfe.fromJson(
      await _post('/nfe/gerar-chave', request.toJson()),
    );
  }

  Future<FiscalApiResponse> statusServico({String? emitterId}) async {
    return FiscalApiResponse.fromJson(
      await _post('/nfe/status-servico', {
        if (emitterId != null && emitterId.isNotEmpty) 'emitter_id': emitterId,
      }),
    );
  }
}
