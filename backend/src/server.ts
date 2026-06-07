import express from "express";

import authRoutes from "./modules/auth/auth.routes";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    sistema: "ERP Estoque",
    status: "online"
  });
});

app.use("/auth", authRoutes);

const PORT = 3333;

app.listen(PORT, () => {
  console.log(`ERP Backend rodando na porta ${PORT}`);
});
