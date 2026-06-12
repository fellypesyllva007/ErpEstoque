import { Router } from "express";
import { OSController } from "./os.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../core/tenant.js";
import { permissionMiddleware } from "../../middlewares/permission.middleware.js";

const router = Router();
const c = new OSController();

router.get("/", authMiddleware, requireTenant, permissionMiddleware("os.lista.visualizar"), c.listar.bind(c));
router.get("/contagem", authMiddleware, requireTenant, permissionMiddleware("os.lista.visualizar"), c.contarPorStatus.bind(c));
router.get("/:id", authMiddleware, requireTenant, permissionMiddleware("os.lista.visualizar"), c.buscarPorId.bind(c));
router.post("/", authMiddleware, requireTenant, permissionMiddleware("os.lista.criar"), c.criar.bind(c));
router.put("/:id", authMiddleware, requireTenant, permissionMiddleware("os.lista.editar"), c.atualizar.bind(c));
router.post("/:id/pecas", authMiddleware, requireTenant, permissionMiddleware("os.lista.editar"), c.adicionarPeca.bind(c));
router.delete("/:id/pecas/:itemId", authMiddleware, requireTenant, permissionMiddleware("os.lista.editar"), c.removerPeca.bind(c));

export default router;
