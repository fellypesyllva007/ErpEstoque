import express from "express";

import authRoutes from "./modules/auth/auth.routes";

import { authMiddleware } from "./middlewares/auth.middleware";
import { permissionMiddleware } from "./middlewares/permission.middleware";

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
  permissionMiddleware([
    "Administrador",
    "Gerente"
  ]),
  (_req, res) => {
    res.json({
      message: "Área Administrativa Liberada"
    });
  }
);

app.use("/auth", authRoutes);

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`ERP Backend rodando na porta ${PORT}`);
});
