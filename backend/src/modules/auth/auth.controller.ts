import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const resultado = await authService.login(req.body);

      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(401).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro de autenticação",
      });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      const resultado =
        await authService.refreshAccessToken(
          refreshToken
        );

      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(401).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao renovar token",
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      const resultado =
        await authService.logout(
          refreshToken
        );

      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao realizar logout",
      });
    }
  }

  async me(req: AuthRequest, res: Response) {
    return res.status(200).json({
      usuario: req.user?.usuario,
      perfil: req.user?.perfil,
      id: req.user?.sub,
    });
  }
}
