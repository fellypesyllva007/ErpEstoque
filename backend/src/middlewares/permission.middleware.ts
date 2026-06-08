import { Response, NextFunction } from "express";
import { prisma } from "../core/prisma/prisma.js";
import { AuthRequest } from "./auth.middleware.js";

export function permissionMiddleware(
  permissaoRequerida: string
) {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const usuarioId = req.user?.sub;

      if (!usuarioId) {
        return res.status(401).json({
          message: "Usuário não autenticado",
        });
      }

      const usuario = await prisma.usuario.findUnique({
        where: {
          id: usuarioId,
        },
        include: {
          perfil: {
            include: {
              permissoes: {
                include: {
                  permissao: {
                    include: {
                      tela: {
                        include: {
                          modulo: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!usuario) {
        return res.status(401).json({
          message: "Usuário não encontrado",
        });
      }

      const permissoes = usuario.perfil.permissoes.map(
        (item) =>
          `${item.permissao.tela.modulo.codigo}.` +
          `${item.permissao.tela.codigo}.` +
          `${item.permissao.codigo}`
      );

      const possuiPermissao =
        permissoes.includes(permissaoRequerida);

      if (!possuiPermissao) {
        return res.status(403).json({
          message: "Acesso negado",
          permissaoRequerida,
        });
      }

      next();
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Erro ao validar permissões",
      });
    }
  };
}
