import { Router } from "express";
import { RelatoriosController } from "./relatorios.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../core/tenant.js";
import { permissionMiddleware } from "../../middlewares/permission.middleware.js";
import { requireAssinaturaAtiva } from "../../middlewares/saas.middleware.js";

const router = Router();
const c = new RelatoriosController();

router.get("/estoque", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("relatorios.estoque.visualizar"), c.estoqueCompleto.bind(c));
router.get("/movimentacoes", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("relatorios.estoque.visualizar"), c.movimentacoes.bind(c));
router.get("/sugestao-reposicao", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("relatorios.estoque.visualizar"), c.sugestaoReposicao.bind(c));
router.get("/vendas", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("relatorios.vendas.visualizar"), c.vendas.bind(c));
router.get("/compras", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("relatorios.compras.visualizar"), c.compras.bind(c));
router.get("/auditoria", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("relatorios.auditoria.visualizar"), c.auditoria.bind(c));

export default router;
