import 'produtos_service.dart';
import 'produto_model.dart';

class ProdutosController {
  final _service = ProdutosService();

  Future<List<Produto>> listar() => _service.listar();
  Future<void> excluir(String id) => _service.excluir(id);
  Future<List<dynamic>> listarCategorias() => _service.listarCategorias();
  Future<List<dynamic>> listarMarcas() => _service.listarMarcas();
  Future<List<dynamic>> listarFornecedores() => _service.listarFornecedores();
  Future<Produto> criar(Map<String, dynamic> body) => _service.criar(body);
  Future<Produto> atualizar(String id, Map<String, dynamic> body) => _service.atualizar(id, body);
}
