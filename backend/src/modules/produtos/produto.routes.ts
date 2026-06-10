import { Router } from "express";
import { ProdutoController } from "./produto.controller.js";
import { EtiquetaController } from "./etiqueta.controller.js";
import { ImportacaoController } from "./importacao.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { permissionMiddleware } from "../../middlewares/permission.middleware.js";

const router = Router();
const c = new ProdutoController();
const imp = new ImportacaoController();
const etiq = new EtiquetaController();

router.get("/", authMiddleware, permissionMiddleware("produtos.produtos_tela.visualizar"), c.listar.bind(c));
router.get("/estoque-baixo", authMiddleware, permissionMiddleware("produtos.produtos_tela.visualizar"), c.estoqueBaixo.bind(c));
router.get("/estoque-zerado", authMiddleware, permissionMiddleware("produtos.produtos_tela.visualizar"), c.estoqueZerado.bind(c));
router.get("/importacao/template", authMiddleware, imp.template.bind(imp));
router.get("/:id", authMiddleware, permissionMiddleware("produtos.produtos_tela.visualizar"), c.buscarPorId.bind(c));
router.post("/", authMiddleware, permissionMiddleware("produtos.produtos_tela.criar"), c.criar.bind(c));
router.post("/importacao", authMiddleware, permissionMiddleware("produtos.produtos_tela.importar_excel"), imp.importar.bind(imp));
router.put("/:id", authMiddleware, permissionMiddleware("produtos.produtos_tela.editar"), c.atualizar.bind(c));
router.delete("/:id", authMiddleware, permissionMiddleware("produtos.produtos_tela.excluir"), c.excluir.bind(c));
router.post("/etiquetas", authMiddleware, etiq.gerarEtiquetas.bind(etiq));
router.get("/etiquetas", authMiddleware, etiq.gerarEtiquetas.bind(etiq));
router.get("/:id/etiqueta", authMiddleware, etiq.gerarEtiquetaUnica.bind(etiq));

export default router;
