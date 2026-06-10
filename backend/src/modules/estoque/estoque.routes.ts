import { Router } from "express";
import { EstoqueController } from "./estoque.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { permissionMiddleware } from "../../middlewares/permission.middleware.js";

const router = Router();
const controller = new EstoqueController();

router.get("/movimentacoes", authMiddleware, permissionMiddleware("estoque.movimentacoes.visualizar"), controller.listarMovimentacoes.bind(controller));
router.post("/movimentacoes", authMiddleware, permissionMiddleware("estoque.movimentacoes.criar"), controller.registrarMovimentacao.bind(controller));
router.get("/movimentacoes/:produtoId/resumo", authMiddleware, permissionMiddleware("estoque.movimentacoes.visualizar"), controller.resumoPorProduto.bind(controller));

export default router;
