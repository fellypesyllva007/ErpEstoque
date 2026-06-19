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
router.get("/compras/cotacoes", ...secured, c.cotacoesCompra); router.post("/compras/cotacoes", ...secured, c.criarCotacaoCompra); router.patch("/compras/cotacoes/:id/vencedora", ...secured, c.escolherCotacaoVencedora);
router.get("/vendas/orcamentos", ...secured, c.orcamentosVenda); router.post("/vendas/orcamentos", ...secured, c.criarOrcamentoVenda); router.patch("/vendas/orcamentos/:id/aprovar", ...secured, c.aprovarOrcamento);
router.post("/crm/oportunidades/:id/converter-orcamento", ...secured, c.converterOportunidadeEmOrcamento);
router.get("/vendas/pedidos", ...secured, c.pedidosVenda); router.post("/vendas/pedidos", ...secured, c.criarPedidoVenda); router.post("/vendas/pedidos/:id/faturar", ...secured, c.faturarPedidoVenda);
router.get("/vendas/tabelas-preco", ...secured, c.tabelasPreco); router.post("/vendas/tabelas-preco", ...secured, c.criarTabelaPreco);
router.get("/fiscal/configuracoes-tributarias", ...secured, c.configuracoesTributarias); router.post("/fiscal/configuracoes-tributarias", ...secured, c.criarConfiguracaoTributaria);
router.get("/fiscal/entradas", ...secured, c.entradasFiscais); router.post("/fiscal/entradas", ...secured, c.criarEntradaFiscal);


router.get("/workflow/regras", ...secured, c.workflows); router.post("/workflow/regras", ...secured, c.criarWorkflow);
router.get("/producao/listas-tecnicas", ...secured, c.listasTecnicas); router.post("/producao/listas-tecnicas", ...secured, c.criarListaTecnica);
router.get("/producao/ordens", ...secured, c.ordensProducao); router.post("/producao/ordens", ...secured, c.criarOrdemProducao);
router.get("/producao/mrp", ...secured, c.rodadasMrp); router.post("/producao/mrp", ...secured, c.criarRodadaMrp);
router.get("/wms/enderecos", ...secured, c.enderecosEstoque); router.post("/wms/enderecos", ...secured, c.criarEnderecoEstoque);
router.get("/wms/tarefas", ...secured, c.tarefasWms); router.post("/wms/tarefas", ...secured, c.criarTarefaWms);
router.get("/analytics/visoes", ...secured, c.visoesAnaliticas); router.post("/analytics/visoes", ...secured, c.criarVisaoAnalitica);

export default router;
