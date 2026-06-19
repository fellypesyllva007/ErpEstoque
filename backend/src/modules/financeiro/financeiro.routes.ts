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
router.get("/fluxo-caixa", ...secured, c.fluxo.bind(c));
router.get("/inadimplencia", ...secured, c.inadimplencia.bind(c));
router.get("/dre", ...secured, c.dre.bind(c));
router.get("/contabilidade/balancete", ...secured, c.balancete.bind(c));
router.get("/contabilidade/diario", ...secured, c.diario.bind(c));
router.get("/contabilidade/razao/:contaId", ...secured, c.razao.bind(c));
router.post("/fechamento-mensal", ...secured, c.fecharPeriodo.bind(c));
router.get("/conciliacao-bancaria", ...secured, c.conciliacoes.bind(c));
router.post("/conciliacao-bancaria", ...secured, c.criarConciliacao.bind(c));
router.post("/pagar/:id/aprovar", ...secured, c.aprovarPagamento.bind(c));

export default router;
