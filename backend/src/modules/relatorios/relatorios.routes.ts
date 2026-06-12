import { Router } from "express";
import { RelatoriosController } from "./relatorios.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../core/tenant.js";
import { permissionMiddleware } from "../../middlewares/permission.middleware.js";

const router = Router();
const c = new RelatoriosController();

router.get("/estoque", authMiddleware, requireTenant, permissionMiddleware("relatorios.estoque.visualizar"), c.estoqueCompleto.bind(c));
router.get("/movimentacoes", authMiddleware, requireTenant, permissionMiddleware("relatorios.estoque.visualizar"), c.movimentacoes.bind(c));
router.get("/sugestao-reposicao", authMiddleware, requireTenant, permissionMiddleware("relatorios.estoque.visualizar"), c.sugestaoReposicao.bind(c));
router.get("/vendas", authMiddleware, requireTenant, permissionMiddleware("relatorios.vendas.visualizar"), c.vendas.bind(c));
router.get("/compras", authMiddleware, requireTenant, permissionMiddleware("relatorios.compras.visualizar"), c.compras.bind(c));
router.get("/auditoria", authMiddleware, requireTenant, permissionMiddleware("relatorios.auditoria.visualizar"), c.auditoria.bind(c));

export default router;
