import { Router } from "express";
import { CompraController } from "./compra.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { permissionMiddleware } from "../../middlewares/permission.middleware.js";

const router = Router();
const c = new CompraController();

router.get("/", authMiddleware, permissionMiddleware("compras.pedidos.visualizar"), c.listar.bind(c));
router.get("/historico", authMiddleware, permissionMiddleware("compras.pedidos.visualizar"), c.historico.bind(c));
router.get("/:id", authMiddleware, permissionMiddleware("compras.pedidos.visualizar"), c.buscarPorId.bind(c));
router.post("/", authMiddleware, permissionMiddleware("compras.pedidos.criar"), c.criar.bind(c));
router.post("/recebimento", authMiddleware, permissionMiddleware("compras.pedidos.receber"), c.registrarRecebimento.bind(c));
router.patch("/:id/cancelar", authMiddleware, permissionMiddleware("compras.pedidos.cancelar"), c.cancelar.bind(c));

export default router;
