import { Router } from "express";
import { UsuarioController } from "./usuario.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../core/tenant.js";
import { permissionMiddleware } from "../../middlewares/permission.middleware.js";

const router = Router();
const controller = new UsuarioController();

router.get("/perfis", authMiddleware, requireTenant, controller.listarPerfis.bind(controller));
router.get("/", authMiddleware, requireTenant, permissionMiddleware("usuarios.lista.visualizar"), controller.listar.bind(controller));
router.get("/:id", authMiddleware, requireTenant, permissionMiddleware("usuarios.lista.visualizar"), controller.buscarPorId.bind(controller));
router.post("/", authMiddleware, requireTenant, permissionMiddleware("usuarios.lista.criar"), controller.criar.bind(controller));
router.put("/senha", authMiddleware, requireTenant, controller.alterarSenha.bind(controller));
router.put("/:id", authMiddleware, requireTenant, permissionMiddleware("usuarios.lista.editar"), controller.atualizar.bind(controller));

export default router;
