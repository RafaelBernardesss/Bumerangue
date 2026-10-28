import bcrypt from "bcrypt";
import prisma from "../prisma/client.js";
import { lerDataNascimento, ehMaiorDeIdade, MENSAGEM_MENOR_DE_IDADE } from "../utils/idade.js";

class LoginController {
  async login(req, res) {
    try {
      const { cpf, senha, dataNascimento } = req.body;

      if (!cpf || !senha) {
        return res.status(400).json({
          erro: "Preencha CPF e senha",
        });
      }

      const cpfLimpo = cpf.replace(/\D/g, "");

    
      const usuario = await prisma.usuario.findFirst({
        where: { cpf: cpfLimpo },
      });

      if (!usuario) {
        return res.status(401).json({
          erro: "CPF ou senha inválidos",
        });
      }

      let senhaCorreta = false;
      try {
        if (typeof usuario.senha === "string" && usuario.senha.startsWith("$2")) {
          senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        } else {
          senhaCorreta = senha === usuario.senha;
        }
      } catch (e) {
        senhaCorreta = false;
      }

      if (!senhaCorreta) {
        return res.status(401).json({ erro: "CPF ou senha inválidos" });
      }

      let nascimento = usuario.dataNascimento;

      if (!nascimento) {
        if (!dataNascimento) {
          return res.status(403).json({
            erro: "Para continuar, informe a sua data de nascimento.",
            precisaDataNascimento: true,
          });
        }

        nascimento = lerDataNascimento(dataNascimento);
        if (!nascimento) {
          return res.status(400).json({
            erro: "Data de nascimento inválida. Use o formato DD/MM/AAAA.",
            precisaDataNascimento: true,
          });
        }
      }

      if (!ehMaiorDeIdade(nascimento)) {
        return res.status(403).json({ erro: MENSAGEM_MENOR_DE_IDADE, menorDeIdade: true });
      }

      const usuarioAtualizado = await prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          ultimoAcesso: new Date(),
          ...(usuario.dataNascimento ? {} : { dataNascimento: nascimento }),
        },
      });

      const { senha: _senha, ...usuarioSemSenha } = usuarioAtualizado;

      return res.status(200).json({
        mensagem: "Login realizado com sucesso",
        usuario: usuarioSemSenha,
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