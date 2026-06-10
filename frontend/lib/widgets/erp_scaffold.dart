import 'package:flutter/material.dart';
import '../modules/home/home_page.dart';

class ErpScaffold extends StatelessWidget {
  final String titulo;
  final Widget body;
  final Widget? floatingActionButton;

  const ErpScaffold({
    super.key,
    required this.titulo,
    required this.body,
    this.floatingActionButton,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(titulo),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => const HomePage()),
          ),
        ),
      ),
      body: body,
      floatingActionButton: floatingActionButton,
    );
  }
}
