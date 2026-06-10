import '../../core/api_service.dart';
import 'produto_model.dart';

class ProdutosService {
  Future<List<Produto>> listar() async {
    final data = await ApiService.get('/produtos') as List;
    return data.map((e) => Produto.fromJson(e)).toList();
  }

  Future<Produto> buscarPorId(String id) async {
    final data = await ApiService.get('/produtos/$id');
    return Produto.fromJson(data);
  }

  Future<Produto> criar(Map<String, dynamic> body) async {
    final data = await ApiService.post('/produtos', body);
    return Produto.fromJson(data);
  }

  Future<Produto> atualizar(String id, Map<String, dynamic> body) async {
    final data = await ApiService.put('/produtos/$id', body);
    return Produto.fromJson(data);
  }

  Future<void> excluir(String id) => ApiService.delete('/produtos/$id');

  Future<List<dynamic>> listarCategorias() async =>
      await ApiService.get('/produtos/categorias') as List<dynamic>;

  Future<List<dynamic>> listarMarcas() async =>
      await ApiService.get('/produtos/marcas') as List<dynamic>;

  Future<List<dynamic>> listarFornecedores() async =>
      await ApiService.get('/fornecedores') as List<dynamic>;
}
