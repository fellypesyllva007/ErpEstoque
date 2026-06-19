import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireSaasAdmin } from "../../middlewares/saas.middleware.js";
import { SaasController } from "./saas.controller.js";

const router = Router();
const c = new SaasController();

router.get("/planos", c.planos.bind(c));
router.post("/cadastro", c.cadastrar.bind(c));
const admin = [authMiddleware, requireSaasAdmin];

router.get("/admin", ...admin, c.adminDashboard.bind(c));
router.post("/admin/planos", ...admin, c.salvarPlano.bind(c));
router.put("/admin/planos/:id", ...admin, c.salvarPlano.bind(c));
router.put("/admin/assinaturas/:id", ...admin, c.atualizarAssinatura.bind(c));

export default router;
