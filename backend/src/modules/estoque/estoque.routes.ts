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
router.get("/inventarios/:id/itens", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("estoque.movimentacoes.visualizar"), controller.itensInventario.bind(controller));
router.post("/inventarios/:id/aprovar", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("estoque.movimentacoes.criar"), controller.aprovarInventario.bind(controller));
router.patch("/inventarios/itens/:itemId/contagem", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("estoque.movimentacoes.criar"), controller.contarInventario.bind(controller));
router.get("/transferencias", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("estoque.movimentacoes.visualizar"), controller.listarTransferencias.bind(controller));
router.post("/transferencias", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("estoque.movimentacoes.criar"), controller.criarTransferencia.bind(controller));
router.post("/transferencias/:id/enviar", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("estoque.movimentacoes.criar"), controller.enviarTransferencia.bind(controller));
router.post("/transferencias/:id/receber", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("estoque.movimentacoes.criar"), controller.receberTransferencia.bind(controller));


router.get("/lotes", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("estoque.movimentacoes.visualizar"), controller.listarLotes.bind(controller));
router.post("/lotes", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("estoque.movimentacoes.criar"), controller.criarLote.bind(controller));
router.get("/series", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("estoque.movimentacoes.visualizar"), controller.listarSeries.bind(controller));
router.post("/series", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("estoque.movimentacoes.criar"), controller.criarSerie.bind(controller));
router.get("/bloqueios", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("estoque.movimentacoes.visualizar"), controller.listarBloqueios.bind(controller));
router.post("/bloqueios", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("estoque.movimentacoes.criar"), controller.bloquearEstoque.bind(controller));
router.post("/bloqueios/:id/liberar", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("estoque.movimentacoes.criar"), controller.liberarBloqueio.bind(controller));

export default router;
