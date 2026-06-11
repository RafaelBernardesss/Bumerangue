import prisma from "../prisma/Client.js"

//Cadastro
export const cadastrarUsuario = async (req, res) => {
    try{
        const {nome, cpf, email, senha} = req.body;

        //verificar se email existe no banco de dados
        const emailExiste = await prisma.usuario.findUnique({
            where:{
                email
            }
        });

        if(emailExiste) {
            return res.status(400).json({
                mensagem: "Email já cadastrado"
            });
        }

        //verificar agora o cpf
        const cpfExiste = await prisma.usuario.findUnique({
            where: {
                cpf
            }
        });

        if(cpfExiste){
            return res.status(400).json({
                mensagem: "CPF já cadastrado"
            });
        }

        //cria usuario
        const usuario = await prisma.usuario.create({
            data: {
                nome,
                cpf,
                email,
                senha
            }
        });

        return res.status(201).json({
            mensagem:"Usuario cadastrado com sucesso",
            usuario
        });

    } catch (error){
        return res.status(500).json({
            erro: error.message
        });
    }
};