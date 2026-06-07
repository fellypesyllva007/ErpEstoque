import { Request, Response } from "express";

import { AuthService } from "./auth.service";

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const resultado = await authService.login(req.body);

      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(401).json({
        message: error instanceof Error
          ? error.message
          : "Erro de autenticação"
      });
    }
  }
}
