import express from "express";

import authRoutes from "./modules/auth/auth.routes.js";
import categoriaRoutes from "./modules/produtos/categoria.routes.js";


import { authMiddleware } from "./middlewares/auth.middleware.js";
import { permissionMiddleware } from "./middlewares/permission.middleware.js";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    sistema: "ERP Estoque",
    status: "online"
  });
});

app.get(
  "/admin",
  authMiddleware,
    permissionMiddleware(
      "produtos.menu.visualizar"
    ),
  (_req, res) => {
    res.json({
      message: "Área Administrativa Liberada"
    });
  }
);

app.use("/auth", authRoutes);
app.use("/produtos/categorias", categoriaRoutes);


const PORT = 4000;

app.listen(PORT, () => {
  console.log(`ERP Backend rodando na porta ${PORT}`);
});
