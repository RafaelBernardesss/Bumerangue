import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";
import { lerDataNascimento, ehMaiorDeIdade, MENSAGEM_MENOR_DE_IDADE } from "../utils/idade.js";

class UsuarioController {
    async cadastrar(req, res) {
        try {
            const { nome, email, cpf, senha, dataNascimento } = req.body;

            if (!nome || !email || !cpf || !senha) {
                return res.status(400).json({
                    erro: "Preencha todos os campos"
                });
            }

            const cpfLimpo = cpf.replace(/\D/g, "");

            if (!dataNascimento) {
                return res.status(400).json({
                    erro: "Informe a sua data de nascimento"
                });
            }

            const nascimento = lerDataNascimento(dataNascimento);
            if (!nascimento) {
                return res.status(400).json({
                    erro: "Data de nascimento inválida. Use o formato DD/MM/AAAA"
                });
            }

            if (!ehMaiorDeIdade(nascimento)) {
                return res.status(403).json({
                    erro: MENSAGEM_MENOR_DE_IDADE
                });
            }

            const emailExiste = await prisma.usuario.findUnique({
                where: {
                    email
                }
            });
            if (emailExiste) {
                return res.status(400).json({
                    erro: "Email já cadastrado"
                });
            }

            const cpfExiste = await prisma.usuario.findUnique({
                where: {
                    cpf: cpfLimpo
                }
            });
            if (cpfExiste) {
                return res.status(400).json({
                    erro: "CPF já cadastrado"
                });
            }

            const senhaHash = await bcrypt.hash(req.body.senha, 10);

            const usuario = await prisma.usuario.create({
                data: {
                    nome,
                    email,
                    cpf: cpfLimpo,
                    senha: senhaHash,
                    dataNascimento: nascimento
                }
            });

            const { senha: _senha, ...usuarioSemSenha } = usuario;

            return res.status(201).json({
                mensagem: "Usuário cadastrado com sucesso",
                usuario: usuarioSemSenha
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                erro: "Erro ao cadastrar usuário"
            });
        }
    }
}

export default new UsuarioController();