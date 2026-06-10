import 'package:flutter/material.dart';

Future<bool?> confirmarExclusao(BuildContext context, String nome) {
  return showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text('Confirmar exclusão'),
      content: Text('Deseja excluir "$nome"?'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
        FilledButton(
          onPressed: () => Navigator.pop(ctx, true),
          style: FilledButton.styleFrom(backgroundColor: Colors.red),
          child: const Text('Excluir'),
        ),
      ],
    ),
  );
}
