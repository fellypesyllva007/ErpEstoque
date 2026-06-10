import { Router } from "express";
import { ClienteController } from "./cliente.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { permissionMiddleware } from "../../middlewares/permission.middleware.js";

const router = Router();
const controller = new ClienteController();

router.get("/", authMiddleware, permissionMiddleware("clientes.lista.visualizar"), controller.listar.bind(controller));
router.get("/:id", authMiddleware, permissionMiddleware("clientes.lista.visualizar"), controller.buscarPorId.bind(controller));
router.post("/", authMiddleware, permissionMiddleware("clientes.lista.criar"), controller.criar.bind(controller));
router.put("/:id", authMiddleware, permissionMiddleware("clientes.lista.editar"), controller.atualizar.bind(controller));
router.delete("/:id", authMiddleware, permissionMiddleware("clientes.lista.excluir"), controller.excluir.bind(controller));

export default router;
