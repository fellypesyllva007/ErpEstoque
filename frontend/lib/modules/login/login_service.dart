import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class LoginService {
  static const String baseUrl =
      'https://apibackend.ddns.net';

  Future<Map<String, dynamic>> login({
    required String usuario,
    required String senha,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'usuario': usuario,
        'senha': senha,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Usuário ou senha inválidos');
    }

    final data =
        jsonDecode(response.body) as Map<String, dynamic>;

    final prefs =
        await SharedPreferences.getInstance();

    await prefs.setString(
      'token',
      data['token'],
    );

    await prefs.setString(
      'refreshToken',
      data['refreshToken'],
    );

    return data;
  }
}
