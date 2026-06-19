import { Router } from "express";
import { EstoqueController } from "./estoque.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../core/tenant.js";
import { permissionMiddleware } from "../../middlewares/permission.middleware.js";
import { requireAssinaturaAtiva } from "../../middlewares/saas.middleware.js";

const router = Router();
const controller = new EstoqueController();

router.get("/movimentacoes", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("estoque.movimentacoes.visualizar"), controller.listarMovimentacoes.bind(controller));
router.post("/movimentacoes", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("estoque.movimentacoes.criar"), controller.registrarMovimentacao.bind(controller));
router.get("/movimentacoes/:produtoId/resumo", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("estoque.movimentacoes.visualizar"), controller.resumoPorProduto.bind(controller));
router.get("/produtos/:produtoId/saldo-disponivel", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("estoque.movimentacoes.visualizar"), controller.saldoDisponivel.bind(controller));
router.get("/produtos/:produtoId/kardex", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("estoque.movimentacoes.visualizar"), controller.kardex.bind(controller));
router.post("/reservas", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("estoque.movimentacoes.criar"), controller.reservar.bind(controller));
router.get("/inventarios", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("estoque.movimentacoes.visualizar"), controller.listarInventarios.bind(controller));
router.post("/inventarios", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("estoque.movimentacoes.criar"), controller.abrirInventario.bind(controller));
router.patch("/inventarios/itens/:itemId/contagem", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("estoque.movimentacoes.criar"), controller.contarInventario.bind(controller));
router.post("/transferencias", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("estoque.movimentacoes.criar"), controller.criarTransferencia.bind(controller));
router.post("/transferencias/:id/enviar", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("estoque.movimentacoes.criar"), controller.enviarTransferencia.bind(controller));

export default router;
