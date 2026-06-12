import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'app_config.dart';

class ApiService {
  static String get baseUrl => AppConfig.apiUrl;

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static Future<Map<String, String>> _headers() async {
    final token = await getToken();
    final prefs = await SharedPreferences.getInstance();
    final empresaId = prefs.getString('empresaId');
    final filialId = prefs.getString('filialId');
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
      if (empresaId != null) 'X-Empresa-Id': empresaId,
      if (filialId != null) 'X-Filial-Id': filialId,
    };
  }

  static Future<dynamic> get(String path) async {
    final response = await http.get(
      Uri.parse('$baseUrl$path'),
      headers: await _headers(),
    );
    _checarErro(response);
    return jsonDecode(response.body);
  }

  static Future<dynamic> post(String path, Map<String, dynamic> body) async {
    final response = await http.post(
      Uri.parse('$baseUrl$path'),
      headers: await _headers(),
      body: jsonEncode(body),
    );
    _checarErro(response);
    return jsonDecode(response.body);
  }

  static Future<dynamic> put(String path, Map<String, dynamic> body) async {
    final response = await http.put(
      Uri.parse('$baseUrl$path'),
      headers: await _headers(),
      body: jsonEncode(body),
    );
    _checarErro(response);
    return jsonDecode(response.body);
  }

  static Future<void> delete(String path) async {
    final response = await http.delete(
      Uri.parse('$baseUrl$path'),
      headers: await _headers(),
    );
    if (response.statusCode >= 400) {
      final body = jsonDecode(response.body);
      throw Exception(body['message'] ?? 'Erro na requisição');
    }
  }

  static void _checarErro(http.Response response) {
    if (response.statusCode >= 400) {
      final body = jsonDecode(response.body);
      throw Exception(body['message'] ?? 'Erro na requisição');
    }
  }
}
