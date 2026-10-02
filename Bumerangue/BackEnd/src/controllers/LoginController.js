import bcrypt from "bcrypt";
import prisma from "../prisma/client.js";
import { lerDataNascimento, ehMaiorDeIdade, MENSAGEM_MENOR_DE_IDADE } from "../utils/idade.js";

class LoginController {
  async login(req, res) {
    try {
      const { cpf, senha, dataNascimento } = req.body;

      // Verificar campos vazios
      if (!cpf || !senha) {
        return res.status(400).json({
          erro: "Preencha CPF e senha",
        });
      }

      // remover pontos e traços do CPF
      const cpfLimpo = cpf.replace(/\D/g, "");

    

      // Procurar usuário pelo CPF e senha (texto puro, sem criptografia por enquanto)
      const usuario = await prisma.usuario.findFirst({
        where: { cpf: cpfLimpo },
      });

      // Verificar se encontrou usuário
      if (!usuario) {
        return res.status(401).json({
          erro: "CPF ou senha inválidos",
        });
      }

      // Suporta senhas armazenadas em texto puro ou bcrypt
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

      // ---- Trava de idade: só maiores de 18 anos acessam o app ----
      let nascimento = usuario.dataNascimento;

      if (!nascimento) {
        // Conta antiga (criada antes de existir a data de nascimento): pede a data uma vez só
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

      // Login liberado: salva a data (contas antigas) e marca o usuário como online
      const usuarioAtualizado = await prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          ultimoAcesso: new Date(),
          ...(usuario.dataNascimento ? {} : { dataNascimento: nascimento }),
        },
      });

      // Remove a senha antes de devolver o usuário para o front-end
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