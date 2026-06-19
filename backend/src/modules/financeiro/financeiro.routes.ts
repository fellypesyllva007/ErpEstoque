import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../core/tenant.js";
import { permissionMiddleware } from "../../middlewares/permission.middleware.js";
import { requireAssinaturaAtiva } from "../../middlewares/saas.middleware.js";
import { FinanceiroController } from "./financeiro.controller.js";

const router = Router();
const c = new FinanceiroController();
const secured = [authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("financeiro.painel.visualizar")];

router.get("/receber", ...secured, c.receber.bind(c));
router.post("/receber", ...secured, c.criarReceber.bind(c));
router.post("/receber/:id/baixar", ...secured, c.baixarReceber.bind(c));
router.get("/pagar", ...secured, c.pagar.bind(c));
router.post("/pagar", ...secured, c.criarPagar.bind(c));
router.post("/pagar/:id/baixar", ...secured, c.baixarPagar.bind(c));
router.get("/caixa", ...secured, c.caixa.bind(c));
router.post("/caixa/:id/estornar", ...secured, c.estornarCaixa.bind(c));
router.get("/fluxo-caixa", ...secured, c.fluxo.bind(c));
router.get("/inadimplencia", ...secured, c.inadimplencia.bind(c));
router.get("/aging-receber", ...secured, c.agingReceber.bind(c));
router.get("/centros-custo", ...secured, c.centrosCusto.bind(c)); router.post("/centros-custo", ...secured, c.criarCentroCusto.bind(c));
router.get("/plano-contas", ...secured, c.planoContas.bind(c)); router.post("/plano-contas", ...secured, c.criarContaContabil.bind(c));
router.get("/contas-recorrentes", ...secured, c.contasRecorrentes.bind(c)); router.post("/contas-recorrentes", ...secured, c.criarContaRecorrente.bind(c));
router.get("/dre", ...secured, c.dre.bind(c));
router.get("/contabilidade/balancete", ...secured, c.balancete.bind(c));
router.get("/contabilidade/diario", ...secured, c.diario.bind(c));
router.get("/contabilidade/razao/:contaId", ...secured, c.razao.bind(c));
router.post("/fechamento-mensal", ...secured, c.fecharPeriodo.bind(c));
router.get("/conciliacao-bancaria", ...secured, c.conciliacoes.bind(c));
router.post("/conciliacao-bancaria", ...secured, c.criarConciliacao.bind(c));
router.post("/pagar/:id/aprovar", ...secured, c.aprovarPagamento.bind(c));

export default router;
