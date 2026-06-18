import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../dashboard/dashboard_page.dart';
import '../produtos/produtos_page.dart';
import '../produtos/busca_codigo_page.dart';
import '../estoque/estoque_page.dart';
import '../fornecedores/fornecedores_page.dart';
import '../clientes/clientes_page.dart';
import '../os/os_page.dart';
import '../usuarios/usuarios_page.dart';
import '../compras/compras_page.dart';
import '../vendas/vendas_page.dart';
import '../relatorios/relatorios_page.dart';
import '../fiscal/fiscal_page.dart';
import '../financeiro/financeiro_page.dart';
import '../cadastros/cadastros_page.dart';
import '../login/login_page.dart';
import '../saas/saas_page.dart';
import '../../widgets/alerta_estoque_widget.dart';
import '../../core/api_service.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  String _nomeUsuario = '';
  String _perfil = '';
  Map<String, dynamic>? _resumo;

  @override
  void initState() {
    super.initState();
    _carregarInfo();
    _carregarResumo();
  }

  Future<void> _carregarInfo() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _nomeUsuario = prefs.getString('nomeUsuario') ?? 'Usuário';
      _perfil = prefs.getString('perfil') ?? '';
    });
  }

  Future<void> _carregarResumo() async {
    try {
      final data = await ApiService.get('/notificacoes/resumo') as Map<String, dynamic>;
      setState(() => _resumo = data);
    } catch (_) {}
  }

  Widget _modulo(BuildContext ctx, IconData icon, String titulo, Widget page, Color cor, {int? badge}) {
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => page)).then((_) => _carregarResumo()),
        child: SizedBox(
          width: 150,
          height: 115,
          child: Stack(
            children: [
              Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: cor.withOpacity(0.15),
                      child: Icon(icon, size: 26, color: cor),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      titulo,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
              if (badge != null && badge > 0)
                Positioned(
                  top: 8, right: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      '$badge',
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _logout(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    if (context.mounted) {
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginPage()));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('KoreERP'),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner),
            tooltip: 'Buscar por código',
            onPressed: () => Navigator.push(
              context, MaterialPageRoute(builder: (_) => const BuscaCodigoPage())),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Sair',
            onPressed: () => _logout(context),
          ),
        ],
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Saudação
                Row(children: [
                  CircleAvatar(
                    backgroundColor: Colors.blue.shade100,
                    child: const Icon(Icons.person, color: Colors.blue),
                  ),
                  const SizedBox(width: 12),
                  Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Olá, $_nomeUsuario', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    Text(_perfil, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                  ]),
                ]),
                const SizedBox(height: 20),

                // Operacional
                const Text('Operacional', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.grey)),
                const SizedBox(height: 8),
                Wrap(spacing: 12, runSpacing: 12, children: [
                  _modulo(context, Icons.dashboard, 'Dashboard', const DashboardPage(), Colors.blue),
                  _modulo(context, Icons.point_of_sale, 'Vendas', const VendasPage(), Colors.green),
                  _modulo(context, Icons.build, 'Ordens de\nServiço', const OSPage(), Colors.orange,
                    badge: _resumo?['osAbertas']),
                  _modulo(context, Icons.people, 'Clientes', const ClientesPage(), Colors.teal),
                ]),
                const SizedBox(height: 20),

                // Estoque & Compras
                const Text('Estoque & Compras', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.grey)),
                const SizedBox(height: 8),
                Wrap(spacing: 12, runSpacing: 12, children: [
                  _modulo(context, Icons.inventory_2, 'Estoque', const EstoquePage(), Colors.indigo,
                    badge: _resumo?['alertasEstoque']),
                  _modulo(context, Icons.category, 'Produtos', const ProdutosPage(), Colors.deepPurple),
                  _modulo(context, Icons.shopping_cart, 'Compras', const ComprasPage(), Colors.brown,
                    badge: _resumo?['pedidosAbertos']),
                  _modulo(context, Icons.local_shipping, 'Fornecedores', const FornecedoresPage(), Colors.blueGrey),
                ]),
                const SizedBox(height: 20),

                // Gestão
                const Text('Gestão', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.grey)),
                const SizedBox(height: 8),
                Wrap(spacing: 12, runSpacing: 12, children: [
                  _modulo(context, Icons.bar_chart, 'Relatórios', const RelatoriosPage(), Colors.red),
                  _modulo(context, Icons.receipt_long, 'Fiscal\nNF-e', const FiscalPage(), Colors.indigo),
                  _modulo(context, Icons.attach_money, 'Financeiro', const FinanceiroPage(), Colors.green),
                  _modulo(context, Icons.settings_applications, 'Cadastros', const CadastrosPage(), Colors.blueGrey),
                  _modulo(context, Icons.admin_panel_settings, 'Usuários', const UsuariosPage(), Colors.purple),
                  _modulo(context, Icons.cloud, 'SaaS', const SaasPage(), Colors.cyan),
                ]),
                const SizedBox(height: 80),
              ],
            ),
          ),
          const AlertaEstoqueOverlay(),
        ],
      ),
    );
  }
}
