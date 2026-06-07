class LoginService {
  Future<Map<String, dynamic>> login({
    required String usuario,
    required String senha,
  }) async {
    return {
      'usuario': usuario,
      'senha': senha,
    };
  }
}
