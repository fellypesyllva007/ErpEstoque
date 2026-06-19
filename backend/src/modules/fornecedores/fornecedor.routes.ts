import { Router } from "express";
import { FornecedorController } from "./fornecedor.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../core/tenant.js";
import { permissionMiddleware } from "../../middlewares/permission.middleware.js";
import { requireAssinaturaAtiva } from "../../middlewares/saas.middleware.js";

const router = Router();
const controller = new FornecedorController();

router.get("/", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("fornecedores.lista.visualizar"), controller.listar.bind(controller));
router.get("/:id", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("fornecedores.lista.visualizar"), controller.buscarPorId.bind(controller));
router.post("/", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("fornecedores.lista.criar"), controller.criar.bind(controller));
router.put("/:id", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("fornecedores.lista.editar"), controller.atualizar.bind(controller));
router.delete("/:id", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("fornecedores.lista.excluir"), controller.excluir.bind(controller));

export default router;
