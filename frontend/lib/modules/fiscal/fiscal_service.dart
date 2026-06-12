import '../../core/api_service.dart';
import 'fiscal_models.dart';

class FiscalService {
  const FiscalService();

  Future<List<DocumentoFiscal>> listarNfe({String? status, String? vendaId}) async {
    final params = <String>[];
    if (status != null && status.isNotEmpty) params.add('status=$status');
    if (vendaId != null && vendaId.isNotEmpty) params.add('vendaId=$vendaId');
    final query = params.isEmpty ? '' : '?${params.join('&')}';
    final data = await ApiService.get('/fiscal/nfe$query') as List;
    return data.whereType<Map<String, dynamic>>().map(DocumentoFiscal.fromJson).toList();
  }

  Future<DocumentoFiscal> criarDaVenda(String vendaId, {String modelo = '55'}) async {
    final data = await ApiService.post('/fiscal/nfe/from-venda/$vendaId', {'modelo': modelo});
    return DocumentoFiscal.fromJson(data as Map<String, dynamic>);
  }

  Future<DocumentoFiscal> validar(String id) async {
    final data = await ApiService.post('/fiscal/nfe/$id/validar', {});
    return DocumentoFiscal.fromJson(data as Map<String, dynamic>);
  }

  Future<DocumentoFiscal> transmitir(String id) async {
    final data = await ApiService.post('/fiscal/nfe/$id/transmitir', {});
    return DocumentoFiscal.fromJson(data as Map<String, dynamic>);
  }

  Future<DocumentoFiscal> cancelar(String id, {String? justificativa}) async {
    final data = await ApiService.post('/fiscal/nfe/$id/cancelar', {
      if (justificativa != null) 'justificativa': justificativa,
    });
    return DocumentoFiscal.fromJson(data as Map<String, dynamic>);
  }
}
