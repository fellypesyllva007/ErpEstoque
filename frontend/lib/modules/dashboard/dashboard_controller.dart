import 'dashboard_service.dart';

class DashboardController {
  final _service = DashboardService();

  Future<Map<String, dynamic>> carregarIndicadores() => _service.carregarIndicadores();
  Future<List<dynamic>> movimentacoesRecentes() => _service.movimentacoesRecentes();
  Future<List<dynamic>> alertasEstoque() => _service.alertasEstoque();
  Future<Map<String, dynamic>> indicadoresVendas() => _service.indicadoresVendas();
}
