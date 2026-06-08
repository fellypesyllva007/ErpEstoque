import { Router } from "express";

import { CategoriaController } from "./categoria.controller.js";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { permissionMiddleware } from "../../middlewares/permission.middleware.js";

const router = Router();

const controller = new CategoriaController();

router.get(
  "/",
  authMiddleware,
  permissionMiddleware(
    "produtos.categorias.visualizar"
  ),
  controller.listar.bind(controller)
);

router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware(
    "produtos.categorias.visualizar"
  ),
  controller.buscarPorId.bind(controller)
);

router.post(
  "/",
  authMiddleware,
  permissionMiddleware(
    "produtos.categorias.criar"
  ),
  controller.criar.bind(controller)
);

router.put(
  "/:id",
  authMiddleware,
  permissionMiddleware(
    "produtos.categorias.editar"
  ),
  controller.atualizar.bind(controller)
);

export default router;
