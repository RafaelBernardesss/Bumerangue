import prisma from "../prisma/Client.js";
import jwt from "jsonwebtoken";

class LoginController {
  async login(req, res) {
    try {
      const { cpf, senha } = req.body;

      if (!cpf || !senha) {
        return res.status(400).json({
          erro: "Preencha CPF e senha",
        });
      }

      const cpfLimpo = cpf.replace(/\D/g, "");

      const usuario = await prisma.usuario.findFirst({
        where: { cpf: cpfLimpo, senha },
      });

      if (!usuario) {
        return res.status(401).json({
          erro: "CPF ou senha inválidos",
        });
      }

      const { senha: _senha, ...usuarioSemSenha } = usuario;

      // Gera o token JWT que o app vai usar nas rotas autenticadas
      const token = jwt.sign(
        { id: usuario.id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        mensagem: "Login realizado com sucesso",
        usuario: usuarioSemSenha,
        token,
      });

    } catch (error) {
      console.log(error);

      return res.status(500).json({
        erro: "Erro ao fazer login",
      });
    }
  }
}

export default new LoginController();