import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../core/tenant.js";
import { permissionMiddleware } from "../../middlewares/permission.middleware.js";
import { CadastrosController } from "./cadastros.controller.js";

const router = Router();
const c = new CadastrosController();
const secured = [authMiddleware, requireTenant, permissionMiddleware("cadastros.base.visualizar")];

router.get("/empresas", ...secured, c.empresas.bind(c));
router.get("/filiais", ...secured, c.filiais.bind(c));
router.get("/unidades", ...secured, c.unidades.bind(c));
router.post("/unidades", ...secured, c.criarUnidade.bind(c));
router.get("/condicoes-pagamento", ...secured, c.condicoes.bind(c));
router.post("/condicoes-pagamento", ...secured, c.criarCondicao.bind(c));
router.get("/formas-pagamento", ...secured, c.formas.bind(c));
router.post("/formas-pagamento", ...secured, c.criarForma.bind(c));
router.get("/centros-custo", ...secured, c.centros.bind(c));
router.post("/centros-custo", ...secured, c.criarCentro.bind(c));
router.get("/plano-contas", ...secured, c.plano.bind(c));
router.post("/plano-contas", ...secured, c.criarConta.bind(c));

export default router;
