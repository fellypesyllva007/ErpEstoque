import 'package:flutter/material.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  Widget card(String titulo, String valor) {
    return Card(
      child: SizedBox(
        width: 220,
        height: 120,
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                titulo,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 12),
              Text(
                valor,
                style: TextStyle(
                  fontSize: 28,
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
        title: const Text('Dashboard ERP'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Wrap(
          spacing: 16,
          runSpacing: 16,
          children: [
            card('Vendas Hoje', '0'),
            card('Faturamento Hoje', 'R\$ 0,00'),
            card('OS Abertas', '0'),
            card('OS Concluídas', '0'),
            card('Estoque Baixo', '0'),
            card('Estoque Zerado', '0'),
          ],
        ),
      ),
    );
  }
}
