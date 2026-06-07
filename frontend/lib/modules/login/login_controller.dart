class LoginController {
  Future<void> login({
    required String usuario,
    required String senha,
  }) async {
    print('Login solicitado: $usuario');
  }
}
