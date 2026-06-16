import '../../core/api_service.dart';

class DashboardService {
  Future<Map<String, dynamic>> carregarIndicadores() async {
    final data = await ApiService.get('/dashboard/indicadores');
    return data as Map<String, dynamic>;
  }

  Future<List<dynamic>> movimentacoesRecentes() async {
    return await ApiService.get('/dashboard/movimentacoes-recentes') as List;
  }

  Future<List<dynamic>> alertasEstoque() async {
    return await ApiService.get('/dashboard/alertas-estoque') as List;
  }

  Future<Map<String, dynamic>> indicadoresVendas() async {
    try {
      return await ApiService.get('/vendas/indicadores-hoje') as Map<String, dynamic>;
    } catch (_) { return {'vendasHoje': 0, 'faturamentoHoje': 0.0}; }
  }

  Future<Map<String, dynamic>> dashboardExecutivo() async {
    return await ApiService.get('/dashboard/executivo') as Map<String, dynamic>;
  }
}
