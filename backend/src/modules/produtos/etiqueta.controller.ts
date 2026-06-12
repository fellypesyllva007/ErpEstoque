import { Request, Response } from "express";
import { prisma } from "../../core/prisma/prisma.js";
import { getRouteParam } from "../../utils/request.js";

interface ProdutoEtiqueta {
  nome: string;
  codigoInterno: string;
  precoVenda: unknown;
  categoria?: { nome: string } | null;
  marca?: { nome: string } | null;
}

function gerarHtml(produtos: ProdutoEtiqueta[]): string {
  const etiquetas = produtos
    .map(
      (p) => `
      <div class="etiqueta">
        <div class="nome">${p.nome}</div>
        <div class="codigo">${p.codigoInterno}</div>
        <div class="preco">R$ ${Number(p.precoVenda).toFixed(2)}</div>
        <div class="info">${p.categoria?.nome ?? ''} · ${p.marca?.nome ?? ''}</div>
        <div class="barcode">*${p.codigoInterno}*</div>
      </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Etiquetas ERP</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39&display=swap">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; }
    .container { display:flex; flex-wrap:wrap; gap:4mm; padding:5mm; }
    .etiqueta {
      width:80mm; height:40mm; border:0.5px solid #999;
      padding:2mm 3mm; display:flex; flex-direction:column;
      justify-content:space-between; page-break-inside:avoid;
    }
    .nome { font-size:9pt; font-weight:bold; line-height:1.2; }
    .codigo { font-size:8pt; color:#444; }
    .preco { font-size:15pt; font-weight:bold; }
    .info { font-size:7pt; color:#666; }
    .barcode { font-family:'Libre Barcode 39',monospace; font-size:20pt; }
    @media print { .etiqueta { border:0.5px solid #000; } }
  </style>
</head>
<body>
  <div class="container">${etiquetas}</div>
  <script>window.onload=()=>window.print();</script>
</body>
</html>`;
}

export class EtiquetaController {
  // POST /produtos/etiquetas  { ids: string[] }
  async gerarEtiquetas(req: Request, res: Response) {
    const ids: string[] =
      req.body?.ids ??
      (typeof req.query.ids === "string" ? req.query.ids.split(",") : []);

    if (!ids.length) {
      return res.status(400).json({ message: "Informe os IDs dos produtos" });
    }

    const produtos = await prisma.produto.findMany({
      where: { id: { in: ids } },
      include: { categoria: true, marca: true },
    });

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(gerarHtml(produtos));
  }

  // GET /produtos/:id/etiqueta
  async gerarEtiquetaUnica(req: Request, res: Response) {
    const produto = await prisma.produto.findUnique({
      where: { id: getRouteParam(req, "id") },
      include: { categoria: true, marca: true },
    });
    if (!produto)
      return res.status(404).json({ message: "Produto não encontrado" });

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(gerarHtml([produto]));
  }
}
