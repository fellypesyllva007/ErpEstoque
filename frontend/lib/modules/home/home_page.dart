import 'package:flutter/material.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  Widget modulo(
    IconData icon,
    String titulo,
  ) {
    return Card(
      child: InkWell(
        onTap: onTap,
        child: SizedBox(
          width: 220,
          height: 130,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 42,
              ),
              const SizedBox(height: 12),
              Text(
                titulo,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ERP Estoque e Assistência Técnica'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Wrap(
          spacing: 16,
          runSpacing: 16,
          children: [
            modulo(Icons.inventory_2, 'Estoque'),
            modulo(Icons.category, 'Produtos'),
            modulo(Icons.shopping_cart, 'Compras'),
            modulo(Icons.point_of_sale, 'Vendas'),
            modulo(Icons.build, 'Ordens de Serviço'),
            modulo(Icons.people, 'Clientes'),
            modulo(Icons.local_shipping, 'Fornecedores'),
            modulo(Icons.dashboard, 'Dashboard'),
            modulo(Icons.bar_chart, 'Relatórios'),
            modulo(Icons.admin_panel_settings, 'Usuários'),
            modulo(Icons.settings, 'Configurações'),
            modulo(Icons.notifications, 'Alertas'),
          ],
        ),
      ),
    );
  }
}
