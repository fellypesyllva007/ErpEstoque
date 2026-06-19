import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../core/tenant.js";
import { permissionMiddleware } from "../../middlewares/permission.middleware.js";
import { requireAssinaturaAtiva } from "../../middlewares/saas.middleware.js";
import { EnterpriseController } from "./enterprise.controller.js";

const router = Router();
const c = new EnterpriseController();
const secured = [authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("dashboard.inicio.visualizar")];

router.get("/crm/leads", ...secured, c.leads); router.post("/crm/leads", ...secured, c.criarLead);
router.get("/crm/oportunidades", ...secured, c.oportunidades); router.post("/crm/oportunidades", ...secured, c.criarOportunidade);
router.get("/crm/atividades", ...secured, c.atividades); router.post("/crm/atividades", ...secured, c.criarAtividade);
router.get("/crm/pipeline", ...secured, c.pipeline);
router.get("/compras/solicitacoes", ...secured, c.solicitacoesCompra); router.post("/compras/solicitacoes", ...secured, c.criarSolicitacaoCompra); router.patch("/compras/solicitacoes/:id/aprovar", ...secured, c.aprovarSolicitacao);
router.get("/compras/cotacoes", ...secured, c.cotacoesCompra); router.post("/compras/cotacoes", ...secured, c.criarCotacaoCompra);
router.get("/vendas/orcamentos", ...secured, c.orcamentosVenda); router.post("/vendas/orcamentos", ...secured, c.criarOrcamentoVenda);
router.get("/vendas/pedidos", ...secured, c.pedidosVenda); router.post("/vendas/pedidos", ...secured, c.criarPedidoVenda);
router.get("/vendas/tabelas-preco", ...secured, c.tabelasPreco); router.post("/vendas/tabelas-preco", ...secured, c.criarTabelaPreco);
router.get("/fiscal/configuracoes-tributarias", ...secured, c.configuracoesTributarias); router.post("/fiscal/configuracoes-tributarias", ...secured, c.criarConfiguracaoTributaria);
router.get("/fiscal/entradas", ...secured, c.entradasFiscais); router.post("/fiscal/entradas", ...secured, c.criarEntradaFiscal);

export default router;
