import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { FiscalController } from "./fiscal.controller.js";

const router = Router();
const controller = new FiscalController();

router.get("/nfe", authMiddleware, controller.listar.bind(controller));
router.get("/nfe/:id", authMiddleware, controller.buscarPorId.bind(controller));
router.post("/nfe/from-venda/:vendaId", authMiddleware, controller.criarDaVenda.bind(controller));
router.post("/nfe/from-os/:osId", authMiddleware, controller.criarDaOS.bind(controller));
router.post("/nfe/:id/validar", authMiddleware, controller.validar.bind(controller));
router.post("/nfe/:id/transmitir", authMiddleware, controller.transmitir.bind(controller));
router.post("/nfe/:id/cancelar", authMiddleware, controller.cancelar.bind(controller));

export default router;
