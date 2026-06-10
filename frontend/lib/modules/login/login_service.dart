import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/app_config.dart';

class LoginService {
  Future<Map<String, dynamic>> login({
    required String usuario,
    required String senha,
  }) async {
    final response = await http.post(
      Uri.parse('${AppConfig.apiUrl}/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'usuario': usuario, 'senha': senha}),
    );

    if (response.statusCode != 200) {
      final body = jsonDecode(response.body);
      throw Exception(body['message'] ?? 'Usuário ou senha inválidos');
    }

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', data['token']);
    await prefs.setString('refreshToken', data['refreshToken']);
    await prefs.setString('nomeUsuario', data['nome']);
    await prefs.setString('perfil', data['perfil']);
    return data;
  }
}
