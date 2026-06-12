import { Router } from "express";
import { LicenciamentoController } from "./licenciamento.controller.js";
import { rateLimitMiddleware } from "../../middlewares/rate-limit.middleware.js";

const router = Router();
const controller = new LicenciamentoController();

router.get(
  "/info",
  rateLimitMiddleware(60, 60_000),
  controller.info.bind(controller)
);

router.post(
  "/validar",
  rateLimitMiddleware(10, 60_000),
  controller.validar.bind(controller)
);

router.get(
  "/status",
  rateLimitMiddleware(60, 60_000),
  controller.status.bind(controller)
);

export default router;
