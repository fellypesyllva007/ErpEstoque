import 'package:flutter/material.dart';
import '../home/home_page.dart';
import 'login_service.dart';
import '../saas/saas_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _usuarioController = TextEditingController();
  final _senhaController = TextEditingController();

  bool carregando = false;

  Future<void> entrar() async {
    try {
      setState(() {
        carregando = true;
      });

      await LoginService().login(
        usuario: _usuarioController.text,
        senha: _senhaController.text,
      );

      if (!mounted) return;

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => const HomePage(),
        ),
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            e.toString(),
          ),
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          carregando = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F6F8),
      body: Center(
        child: Container(
          width: 450,
          padding: const EdgeInsets.all(32),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: const [
              BoxShadow(
                blurRadius: 20,
                spreadRadius: 2,
                color: Colors.black12,
              )
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.inventory_2,
                size: 72,
              ),
              const SizedBox(height: 16),
              const Text(
                'ERP Assistência Técnica',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Controle de Estoque e Ordens de Serviço',
              ),
              const SizedBox(height: 32),
              TextField(
                controller: _usuarioController,
                decoration: const InputDecoration(
                  labelText: 'Usuário',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _senhaController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Senha',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: carregando ? null : entrar,
                  child: carregando
                      ? const CircularProgressIndicator()
                      : const Text('Entrar'),
                ),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SaasPage())),
                child: const Text('Criar conta e contratar plano'),
              ),
              const SizedBox(height: 8),
              const Text(
                'Versão 1.0.0',
                style: TextStyle(fontSize: 12),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
