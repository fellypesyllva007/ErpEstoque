import { Router } from "express";
import { UsuarioController } from "./usuario.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { permissionMiddleware } from "../../middlewares/permission.middleware.js";

const router = Router();
const controller = new UsuarioController();

router.get("/perfis", authMiddleware, controller.listarPerfis.bind(controller));
router.get("/", authMiddleware, permissionMiddleware("usuarios.lista.visualizar"), controller.listar.bind(controller));
router.get("/:id", authMiddleware, permissionMiddleware("usuarios.lista.visualizar"), controller.buscarPorId.bind(controller));
router.post("/", authMiddleware, permissionMiddleware("usuarios.lista.criar"), controller.criar.bind(controller));
router.put("/senha", authMiddleware, controller.alterarSenha.bind(controller));
router.put("/:id", authMiddleware, permissionMiddleware("usuarios.lista.editar"), controller.atualizar.bind(controller));

export default router;
