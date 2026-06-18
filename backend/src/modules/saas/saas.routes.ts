import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { SaasController } from "./saas.controller.js";

const router = Router();
const c = new SaasController();

router.get("/planos", c.planos.bind(c));
router.post("/cadastro", c.cadastrar.bind(c));
router.get("/admin", authMiddleware, c.adminDashboard.bind(c));
router.post("/admin/planos", authMiddleware, c.salvarPlano.bind(c));
router.put("/admin/planos/:id", authMiddleware, c.salvarPlano.bind(c));
router.put("/admin/assinaturas/:id", authMiddleware, c.atualizarAssinatura.bind(c));

export default router;
