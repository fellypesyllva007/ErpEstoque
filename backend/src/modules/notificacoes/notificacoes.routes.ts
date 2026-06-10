import { Router } from "express";
import { NotificacoesController } from "./notificacoes.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();
const c = new NotificacoesController();

router.get("/alertas-estoque", authMiddleware, c.alertasEstoque.bind(c));
router.get("/resumo", authMiddleware, c.resumoGeral.bind(c));

export default router;
