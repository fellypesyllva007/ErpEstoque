import { Router } from "express";
import { LicenciamentoController } from "./licenciamento.controller.js";

const router = Router();
const controller = new LicenciamentoController();

router.get(
  "/info",
  controller.info.bind(controller)
);

router.post(
  "/validar",
  controller.validar.bind(controller)
);

router.get(
  "/status",
  controller.status.bind(controller)
);

export default router;
