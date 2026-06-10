import { Router } from "express";
import { MarcaController } from "./marca.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { permissionMiddleware } from "../../middlewares/permission.middleware.js";

const router = Router();
const controller = new MarcaController();

router.get("/", authMiddleware, permissionMiddleware("produtos.marcas.visualizar"), controller.listar.bind(controller));
router.get("/:id", authMiddleware, permissionMiddleware("produtos.marcas.visualizar"), controller.buscarPorId.bind(controller));
router.post("/", authMiddleware, permissionMiddleware("produtos.marcas.criar"), controller.criar.bind(controller));
router.put("/:id", authMiddleware, permissionMiddleware("produtos.marcas.editar"), controller.atualizar.bind(controller));
router.delete("/:id", authMiddleware, permissionMiddleware("produtos.marcas.excluir"), controller.excluir.bind(controller));

export default router;
