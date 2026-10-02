import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import prisma from "../prisma/client.js";
import { estaOnline, limiteOnline } from "../utils/online.js";
import { apagarArquivoUpload } from "../utils/uploadImagem.js";

// Senhas novas são salvas com bcrypt; contas antigas ainda podem estar em texto puro.
async function senhaConfere(digitada, salva) {
  if (typeof salva === "string" && salva.startsWith("$2")) {
    return bcrypt.compare(digitada, salva);
  }
  return digitada === salva;
}


export async function buscarUsuario(req, res) {
  try {
    const idUsuario = Number(req.params.id || req.user?.id);

    if (!idUsuario) {
      return res.status(400).json({ erro: "ID do usuário não informado." });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: idUsuario },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        telefone: true,
        foto: true,
        cidade: true,
        estado: true,
        ultimoAcesso: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    const { ultimoAcesso, ...dadosUsuario } = usuario;

    return res.status(200).json({
      usuario: { ...dadosUsuario, online: estaOnline(ultimoAcesso), ultimoAcesso },
    });
  } catch (erro) {
    console.error("Erro ao buscar usuário:", erro);
    return res.status(500).json({ erro: "Erro interno ao buscar o usuário." });
  }
}

export async function atualizarFotoPerfil(req, res) {
  try {
    const idUsuario = Number(req.params.id || req.user?.id);

    if (!idUsuario) {
      return res.status(400).json({ erro: "ID do usuário não informado." });
    }

    if (!req.file) {
      return res.status(400).json({ erro: "Nenhuma imagem foi enviada." });
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: idUsuario },
    });

    if (!usuarioExistente) {
      // Remove o arquivo enviado, já que o usuário não existe
      fs.unlink(req.file.path, () => { });
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    // Se já existia uma foto anterior, apaga o arquivo antigo do disco
    if (usuarioExistente.foto) {
      const caminhoAntigo = path.resolve(usuarioExistente.foto);
      fs.unlink(caminhoAntigo, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("Erro ao remover foto antiga:", err);
        }
      });
    }


    const caminhoRelativo = path.posix.join("uploads", "perfil", req.file.filename);

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: idUsuario },
      data: { foto: caminhoRelativo },
      select: {
        id: true,
        nome: true,
        email: true,
        foto: true,
        telefone: true,
        cidade: true,
        estado: true,
      },
    });

    return res.status(200).json({
      mensagem: "Foto de perfil atualizada com sucesso.",
      usuario: usuarioAtualizado,
    });
  } catch (erro) {
    console.error("Erro ao atualizar foto de perfil:", erro);
    return res.status(500).json({ erro: "Erro interno ao atualizar a foto de perfil." });
  }
}


export async function removerFotoPerfil(req, res) {
  try {
    const idUsuario = Number(req.params.id || req.user?.id);

    if (!idUsuario) {
      return res.status(400).json({ erro: "ID do usuário não informado." });
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: idUsuario },
    });

    if (!usuarioExistente) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    if (usuarioExistente.foto) {
      const caminhoFoto = path.resolve(usuarioExistente.foto);
      fs.unlink(caminhoFoto, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("Erro ao remover arquivo da foto:", err);
        }
      });
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: idUsuario },
      data: { foto: null },
      select: {
        id: true,
        nome: true,
        email: true,
        foto: true,
        telefone: true,
        cidade: true,
        estado: true,
      },
    });

    return res.status(200).json({
      mensagem: "Foto de perfil removida com sucesso.",
      usuario: usuarioAtualizado,
    });
  } catch (erro) {
    console.error("Erro ao remover foto de perfil:", erro);
    return res.status(500).json({ erro: "Erro interno ao remover a foto de perfil." });
  }
}


export async function atualizarNomeUsuario(req, res) {
  try {
    const idUsuario = Number(req.params.id || req.user?.id);
    const { nome } = req.body;

    if (!idUsuario) {
      return res.status(400).json({ erro: "ID do usuário não informado." });
    }

    if (!nome || typeof nome !== "string" || nome.trim().length < 2) {
      return res.status(400).json({ erro: "Nome inválido. Informe pelo menos 2 caracteres." });
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: idUsuario },
    });

    if (!usuarioExistente) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: idUsuario },
      data: { nome: nome.trim() },
      select: {
        id: true,
        nome: true,
        email: true,
        foto: true,
        telefone: true,
        cidade: true,
        estado: true,
      },
    });

    return res.status(200).json({
      mensagem: "Nome de usuário atualizado com sucesso.",
      usuario: usuarioAtualizado,
    });
  } catch (erro) {
    console.error("Erro ao atualizar nome de usuário:", erro);
    return res.status(500).json({ erro: "Erro interno ao atualizar o nome de usuário." });
  }
}


export async function atualizarTelefone(req, res) {
  try {
    const idUsuario = Number(req.params.id || req.user?.id);
    const { telefone } = req.body;

    if (!idUsuario) {
      return res.status(400).json({ erro: "ID do usuário não informado." });
    }

    if (!telefone || typeof telefone !== "string") {
      return res.status(400).json({ erro: "Telefone inválido." });
    }

    // Mantém apenas dígitos para validar a quantidade de números
    const somenteDigitos = telefone.replace(/\D/g, "");
    if (somenteDigitos.length < 10 || somenteDigitos.length > 11) {
      return res.status(400).json({ erro: "Informe um telefone válido, com DDD." });
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: idUsuario },
    });

    if (!usuarioExistente) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: idUsuario },
      data: { telefone: telefone.trim() },
      select: {
        id: true,
        nome: true,
        email: true,
        foto: true,
        telefone: true,
        cidade: true,
        estado: true,
      },
    });

    return res.status(200).json({
      mensagem: "Telefone atualizado com sucesso.",
      usuario: usuarioAtualizado,
    });
  } catch (erro) {
    console.error("Erro ao atualizar telefone:", erro);
    return res.status(500).json({ erro: "Erro interno ao atualizar o telefone." });
  }
}


export async function atualizarLocalizacao(req, res) {
  try {
    const idUsuario = Number(req.params.id || req.user?.id);
    const { cidade, estado } = req.body;

    if (!idUsuario) {
      return res.status(400).json({ erro: "ID do usuário não informado." });
    }

    if (
      (cidade === undefined || cidade === null) &&
      (estado === undefined || estado === null)
    ) {
      return res.status(400).json({ erro: "Informe a cidade e/ou o estado." });
    }

    if (cidade !== undefined && cidade !== null && typeof cidade !== "string") {
      return res.status(400).json({ erro: "Cidade inválida." });
    }

    if (estado !== undefined && estado !== null && typeof estado !== "string") {
      return res.status(400).json({ erro: "Estado inválido." });
    }

    if (typeof estado === "string" && estado.trim().length > 0 && estado.trim().length !== 2) {
      return res.status(400).json({ erro: "Informe o estado na sigla (ex: SP, RJ)." });
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: idUsuario },
    });

    if (!usuarioExistente) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    const dadosParaAtualizar = {};

    if (cidade !== undefined) {
      dadosParaAtualizar.cidade = cidade.trim() || null;
    }

    if (estado !== undefined) {
      dadosParaAtualizar.estado = estado.trim().toUpperCase() || null;
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: idUsuario },
      data: dadosParaAtualizar,
      select: {
        id: true,
        nome: true,
        email: true,
        foto: true,
        telefone: true,
        cidade: true,
        estado: true,
      },
    });

    return res.status(200).json({
      mensagem: "Localização atualizada com sucesso.",
      usuario: usuarioAtualizado,
    });
  } catch (erro) {
    console.error("Erro ao atualizar localização:", erro);
    return res.status(500).json({ erro: "Erro interno ao atualizar a localização." });
  }
}


export async function redefinirSenha(req, res) {
  try {
    const idUsuario = Number(req.params.id || req.user?.id);
    const { senhaAtual, novaSenha, confirmarNovaSenha } = req.body;

    if (!idUsuario) {
      return res.status(400).json({ erro: "ID do usuário não informado." });
    }

    if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
      return res.status(400).json({
        erro: "Informe a senha atual, a nova senha e a confirmação da nova senha.",
      });
    }

    if (novaSenha !== confirmarNovaSenha) {
      return res.status(400).json({ erro: "A nova senha e a confirmação não coincidem." });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ erro: "A nova senha deve ter pelo menos 6 caracteres." });
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: idUsuario },
    });

    if (!usuarioExistente) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    if (!(await senhaConfere(senhaAtual, usuarioExistente.senha))) {
      return res.status(401).json({ erro: "Senha atual incorreta." });
    }

    if (novaSenha === senhaAtual) {
      return res.status(400).json({ erro: "A nova senha deve ser diferente da senha atual." });
    }

    await prisma.usuario.update({
      where: { id: idUsuario },
      data: { senha: await bcrypt.hash(novaSenha, 10) },
    });

    return res.status(200).json({ mensagem: "Senha redefinida com sucesso." });
  } catch (erro) {
    console.error("Erro ao redefinir senha:", erro);
    return res.status(500).json({ erro: "Erro interno ao redefinir a senha." });
  }
}


export async function excluirConta(req, res) {
  try {
    const idUsuario = Number(req.params.id || req.user?.id);

    if (!idUsuario) {
      return res.status(400).json({ erro: "ID do usuário não informado." });
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: idUsuario },
    });

    if (!usuarioExistente) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    // fotos que vão sumir junto com a conta (anúncios e trocas)
    const anuncios = await prisma.anuncio.findMany({
      where: { usuarioId: idUsuario },
      select: { foto: true },
    });
    const trocas = await prisma.troca.findMany({
      where: { OR: [{ usuarioAId: idUsuario }, { usuarioBId: idUsuario }] },
      select: { id: true, anuncioId: true, usuarioAFoto: true, usuarioBFoto: true },
    });

    // anúncios, propostas e mensagens saem por cascata; trocas e avaliações não têm relação
    // direta com o usuário no banco, então removemos aqui
    await prisma.$transaction([
      prisma.avaliacao.deleteMany({
        where: { OR: [{ avaliadorId: idUsuario }, { avaliadoId: idUsuario }] },
      }),
      prisma.troca.deleteMany({ where: { id: { in: trocas.map((t) => t.id) } } }),
      prisma.usuario.delete({ where: { id: idUsuario } }),
    ]);

    apagarArquivoUpload(usuarioExistente.foto);
    for (const a of anuncios) apagarArquivoUpload(a.foto);
    for (const t of trocas) {
      apagarArquivoUpload(t.usuarioAFoto);
      apagarArquivoUpload(t.usuarioBFoto);
    }

    return res.status(200).json({ mensagem: "Conta excluída com sucesso." });
  } catch (erro) {
    console.error("Erro ao excluir conta:", erro);
    return res.status(500).json({ erro: "Erro interno ao excluir a conta." });
  }
}


export async function salvarPushToken(req, res) {
  try {
    const idUsuario = Number(req.params.id || req.user?.id);
    const { pushToken } = req.body;

    if (!idUsuario) {
      return res.status(400).json({ erro: "ID do usuário não informado." });
    }

    if (!pushToken || typeof pushToken !== "string") {
      return res.status(400).json({ erro: "Token de notificação inválido." });
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: idUsuario },
    });

    if (!usuarioExistente) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: idUsuario },
      data: { pushToken: pushToken.trim() },
      select: {
        id: true,
        nome: true,
        email: true,
        foto: true,
        telefone: true,
        cidade: true,
        estado: true,
      },
    });

    return res.status(200).json({
      mensagem: "Token de notificação salvo com sucesso.",
      usuario: usuarioAtualizado,
    });
  } catch (erro) {
    console.error("Erro ao salvar token de notificação:", erro);
    return res.status(500).json({ erro: "Erro interno ao salvar o token de notificação." });
  }
}

export async function listarContatos(req, res) {
  try {
    const idUsuario = Number(req.params.id || req.user?.id);

    if (!idUsuario) {
      return res.status(400).json({ erro: "ID do usuário não informado." });
    }

    // Propostas aceitas onde o usuário é o DONO do anúncio
    const comoAnunciante = await prisma.proposta.findMany({
      where: {
        status: "aceita",
        anuncio: { usuarioId: idUsuario },
      },
      include: {
        usuario: { select: { id: true, nome: true, foto: true, ultimoAcesso: true } }, // quem propôs
      },
      orderBy: { criadoEm: "desc" },
    });

    // Propostas aceitas onde o usuário é QUEM PROPÔS
    const comoProponente = await prisma.proposta.findMany({
      where: {
        status: "aceita",
        propostoPor: idUsuario,
      },
      include: {
        anuncio: {
          select: {
            usuario: { select: { id: true, nome: true, foto: true, ultimoAcesso: true } }, // dono do anúncio
          },
        },
      },
      orderBy: { criadoEm: "desc" },
    });

    // Usamos um mapa para garantir contatos únicos e armazenamos também o anuncioId
    const mapaContatos = new Map();

    for (const proposta of comoAnunciante) {
      const outraPessoa = proposta.usuario;
      if (outraPessoa.id !== idUsuario) {
        // guarda o anuncioId da proposta mais recente para esse contato
        mapaContatos.set(outraPessoa.id, {
          id: outraPessoa.id,
          nome: outraPessoa.nome,
          foto: outraPessoa.foto,
          ultimoAcesso: outraPessoa.ultimoAcesso,
          anuncioId: proposta.anuncioId,
          criadoEm: proposta.criadoEm,
        });
      }
    }

    for (const proposta of comoProponente) {
      const outraPessoa = proposta.anuncio.usuario;
      if (outraPessoa.id !== idUsuario) {
        // Se já temos esse contato, preferimos a proposta mais recente (ordem já é por criadoEm desc)
        if (!mapaContatos.has(outraPessoa.id)) {
          mapaContatos.set(outraPessoa.id, {
            id: outraPessoa.id,
            nome: outraPessoa.nome,
            foto: outraPessoa.foto,
            ultimoAcesso: outraPessoa.ultimoAcesso,
            anuncioId: proposta.anuncioId,
            criadoEm: proposta.criadoEm,
          });
        }
      }
    }

    const contatos = Array.from(mapaContatos.values()).map((usuario) => ({
      id: usuario.id,
      nome: usuario.nome,
      foto: usuario.foto,
      anuncioId: usuario.anuncioId || null,
      ultimaMensagem: null,
      horaUltimaMensagem: null,
      naoLidas: 0,
      online: estaOnline(usuario.ultimoAcesso),
      favorito: false,
    }));

    return res.status(200).json({ contatos });
  } catch (erro) {
    console.error("Erro ao listar contatos:", erro);
    return res.status(500).json({ erro: "Erro interno ao listar contatos." });
  }
}


/**
 * O app chama essa rota a cada ~30s enquanto está aberto.
 * Quem fez "ping" nos últimos 70s aparece como online.
 */
export async function registrarPing(req, res) {
  try {
    const idUsuario = Number(req.params.id);

    if (!idUsuario) {
      return res.status(400).json({ erro: "ID do usuário não informado." });
    }

    const resultado = await prisma.usuario.updateMany({
      where: { id: idUsuario },
      data: { ultimoAcesso: new Date() },
    });

    if (resultado.count === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    return res.status(200).json({ ok: true });
  } catch (erro) {
    console.error("Erro ao registrar ping:", erro);
    return res.status(500).json({ erro: "Erro interno ao registrar atividade." });
  }
}

/** Marca o usuário como offline (ao sair do app ou da conta). */
export async function marcarOffline(req, res) {
  try {
    const idUsuario = Number(req.params.id);

    if (!idUsuario) {
      return res.status(400).json({ erro: "ID do usuário não informado." });
    }

    await prisma.usuario.updateMany({
      where: { id: idUsuario },
      data: { ultimoAcesso: null },
    });

    return res.status(200).json({ ok: true });
  } catch (erro) {
    console.error("Erro ao marcar offline:", erro);
    return res.status(500).json({ erro: "Erro interno ao atualizar o status." });
  }
}

/** Números do menu inicial: cadastrados, online agora e trocas concluídas. */
export async function estatisticas(req, res) {
  try {
    const [total, online, trocas] = await Promise.all([
      prisma.usuario.count(),
      prisma.usuario.count({ where: { ultimoAcesso: { gte: limiteOnline() } } }),
      prisma.troca.count({ where: { finalizada: true } }),
    ]);

    return res.status(200).json({ total, online, trocas });
  } catch (erro) {
    console.error("Erro ao buscar estatísticas:", erro);
    return res.status(500).json({ erro: "Erro interno ao buscar as estatísticas." });
  }
}

/** Lista de usuários para a tela de administração. */
export async function listarUsuarios(req, res) {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nome: true, cpf: true, email: true },
      orderBy: { nome: "asc" },
    });

    return res.status(200).json({ usuarios });
  } catch (erro) {
    console.error("Erro ao listar usuários:", erro);
    return res.status(500).json({ erro: "Erro interno ao listar os usuários." });
  }
}
