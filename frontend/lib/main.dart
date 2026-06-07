import 'package:flutter/material.dart';

import 'modules/login/login_page.dart';

void main() {
  runApp(const ErpApp());
}

class ErpApp extends StatelessWidget {
  const ErpApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ERP Estoque',
      debugShowCheckedModeBanner: false,
      home: const LoginPage(),
    );
  }
}
