import { Router } from "express";
import { VendaController } from "./venda.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { permissionMiddleware } from "../../middlewares/permission.middleware.js";

const router = Router();
const c = new VendaController();

router.get("/", authMiddleware, permissionMiddleware("vendas.lista.visualizar"), c.listar.bind(c));
router.get("/ranking", authMiddleware, permissionMiddleware("vendas.relatorios.visualizar"), c.rankingMaisVendidos.bind(c));
router.get("/indicadores-hoje", authMiddleware, permissionMiddleware("vendas.lista.visualizar"), c.indicadoresHoje.bind(c));
router.get("/:id", authMiddleware, permissionMiddleware("vendas.lista.visualizar"), c.buscarPorId.bind(c));
router.post("/", authMiddleware, permissionMiddleware("vendas.lista.criar"), c.criar.bind(c));
router.patch("/:id/cancelar", authMiddleware, permissionMiddleware("vendas.lista.cancelar"), c.cancelar.bind(c));

export default router;
