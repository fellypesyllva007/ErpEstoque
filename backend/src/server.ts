import express from "express";
import cors from "cors";

import authRoutes from "./modules/auth/auth.routes.js";
import categoriaRoutes from "./modules/produtos/categoria.routes.js";
import marcaRoutes from "./modules/marcas/marca.routes.js";
import fornecedorRoutes from "./modules/fornecedores/fornecedor.routes.js";
import produtoRoutes from "./modules/produtos/produto.routes.js";
import estoqueRoutes from "./modules/estoque/estoque.routes.js";
import clienteRoutes from "./modules/clientes/cliente.routes.js";
import osRoutes from "./modules/os/os.routes.js";
import usuarioRoutes from "./modules/usuarios/usuario.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import compraRoutes from "./modules/compras/compra.routes.js";
import vendaRoutes from "./modules/vendas/venda.routes.js";
import relatoriosRoutes from "./modules/relatorios/relatorios.routes.js";
import notificacoesRoutes from "./modules/notificacoes/notificacoes.routes.js";
import { LicenciamentoService } from "./modules/licenciamento/licenciamento.service.js";
import licenciamentoRoutes from "./modules/licenciamento/licenciamento.routes.js";
import fiscalRoutes from "./modules/fiscal/fiscal.routes.js";
import financeiroRoutes from "./modules/financeiro/financeiro.routes.js";
import cadastrosRoutes from "./modules/cadastros/cadastros.routes.js";

const app = express();

const corsOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:4000,http://localhost:5173,http://127.0.0.1:4000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    if (!origin || corsOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origem não permitida pelo CORS"));
  },
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: false,
};

app.use(cors(corsOptions));
app.options("/*splat", cors(corsOptions)); // preflight
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => res.json({ status: "ok", ts: new Date().toISOString() }));
app.get("/", (_req, res) => res.json({ sistema: "KoreERP", status: "online" }));

app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/licenciamento", licenciamentoRoutes);
app.use("/notificacoes", notificacoesRoutes);
app.use("/produtos/categorias", categoriaRoutes);
app.use("/produtos/marcas", marcaRoutes);
app.use("/produtos", produtoRoutes);
app.use("/estoque", estoqueRoutes);
app.use("/fornecedores", fornecedorRoutes);
app.use("/clientes", clienteRoutes);
app.use("/os", osRoutes);
app.use("/compras", compraRoutes);
app.use("/vendas", vendaRoutes);
app.use("/relatorios", relatoriosRoutes);
app.use("/fiscal", fiscalRoutes);
app.use("/financeiro", financeiroRoutes);
app.use("/cadastros", cadastrosRoutes);
app.use("/usuarios", usuarioRoutes);

// Error handler global
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Erro interno do servidor" });
});

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  await new LicenciamentoService().inicializar();

  app.listen(PORT, () =>
    console.log(`KoreERP Backend rodando na porta ${PORT}`)
  );
}

bootstrap().catch((error) => {
  console.error("[BOOTSTRAP]", error);
  process.exit(1);
});
