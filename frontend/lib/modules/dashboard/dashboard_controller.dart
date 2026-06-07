class DashboardController {
  Future<Map<String, dynamic>> carregarIndicadores() async {
    return {
      'vendasHoje': 0,
      'faturamentoHoje': 0,
      'osAbertas': 0,
      'osConcluidas': 0,
      'estoqueBaixo': 0,
      'estoqueZerado': 0,
    };
  }
}
