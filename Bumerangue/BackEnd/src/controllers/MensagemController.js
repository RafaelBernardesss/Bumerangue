import fs from 'fs'
import path from 'path'
import prisma from '../prisma/client.js'
import { criptografar, descriptografar } from '../utils/criptografia.js'

const TIPOS_VALIDOS = ['texto', 'foto', 'audio']

// Devolve a mensagem para o app: conteúdo já descriptografado e sem os campos internos
function paraResposta(m) {
  const { apagadaRemetente, apagadaDestinatario, ...resto } = m
  return { ...resto, conteudo: descriptografar(m.conteudo) }
}

// Mensagens que o usuário já apagou "só para ele" não voltam na conversa dele
function naoApagadaPara(usuarioId) {
  return {
    NOT: {
      OR: [
        { remetenteId: usuarioId, apagadaRemetente: true },
        { destinatarioId: usuarioId, apagadaDestinatario: true },
      ],
    },
  }
}

function apagarArquivo(caminhoRelativo) {
  try {
    const pastaUploads = path.resolve('uploads')
    const caminho = path.resolve(caminhoRelativo)
    // só apaga arquivos que estejam dentro da pasta uploads
    if (!caminho.startsWith(pastaUploads + path.sep)) return
    fs.unlink(caminho, (err) => {
      if (err && err.code !== 'ENOENT') console.error('Erro ao remover arquivo do chat:', err)
    })
  } catch (erro) {
    console.error('Erro ao remover arquivo do chat:', erro)
  }
}

class MensagemController {

  async Enviar(req, res) {
    try {
      const { conteudo, remetenteId, destinatarioId, anuncioId, tipo } = req.body

      if (!conteudo || !remetenteId || !destinatarioId || !anuncioId) {
        return res.status(400).json({ erro: 'conteudo, remetenteId, destinatarioId e anuncioId são obrigatórios' })
      }

      const mensagem = await prisma.mensagem.create({
        data: {
          conteudo: criptografar(conteudo),
          // arquivos (foto/áudio) têm rotas próprias; aqui só texto
          tipo: 'texto',
          remetenteId: Number(remetenteId),
          destinatarioId: Number(destinatarioId),
          anuncioId: Number(anuncioId),
        }
      })

      return res.status(201).json(paraResposta(mensagem))
    } catch (error) {
      console.error(error)
      return res.status(500).json({ erro: 'Erro ao enviar mensagem' })
    }
  }

  async EnviarFoto(req, res) {
    try {
      const { remetenteId, destinatarioId, anuncioId } = req.body

      if (!req.file || !remetenteId || !destinatarioId || !anuncioId) {
        return res.status(400).json({ erro: 'foto, remetenteId, destinatarioId e anuncioId são obrigatórios' })
      }

      const caminho = `uploads/chat/${req.file.filename}`

      const mensagem = await prisma.mensagem.create({
        data: {
          conteudo: criptografar(caminho),
          tipo: 'foto',
          remetenteId: Number(remetenteId),
          destinatarioId: Number(destinatarioId),
          anuncioId: Number(anuncioId),
        }
      })

      return res.status(201).json(paraResposta(mensagem))
    } catch (error) {
      console.error(error)
      return res.status(500).json({ erro: 'Erro ao enviar foto' })
    }
  }

  async EnviarAudio(req, res) {
    try {
      const { remetenteId, destinatarioId, anuncioId } = req.body

      if (!req.file || !remetenteId || !destinatarioId || !anuncioId) {
        if (req.file) fs.unlink(req.file.path, () => {})
        return res.status(400).json({ erro: 'audio, remetenteId, destinatarioId e anuncioId são obrigatórios' })
      }

      const caminho = `uploads/chat/${req.file.filename}`

      const mensagem = await prisma.mensagem.create({
        data: {
          conteudo: criptografar(caminho),
          tipo: 'audio',
          remetenteId: Number(remetenteId),
          destinatarioId: Number(destinatarioId),
          anuncioId: Number(anuncioId),
        }
      })

      return res.status(201).json(paraResposta(mensagem))
    } catch (error) {
      console.error(error)
      if (req.file) fs.unlink(req.file.path, () => {})
      return res.status(500).json({ erro: 'Erro ao enviar áudio' })
    }
  }

  async ListarConversa(req, res) {
    try {
      const { anuncioId, usuarioId, outroUsuarioId } = req.params
      const eu = Number(usuarioId)
      const outro = Number(outroUsuarioId)

      const mensagens = await prisma.mensagem.findMany({
        where: {
          anuncioId: Number(anuncioId),
          OR: [
            { remetenteId: eu, destinatarioId: outro },
            { remetenteId: outro, destinatarioId: eu }
          ],
          ...naoApagadaPara(eu),
        },
        orderBy: { data_hora: 'asc' }
      })

      return res.status(200).json(mensagens.map(paraResposta))
    } catch (error) {
      console.error(error)
      return res.status(500).json({ erro: 'Erro ao buscar conversa' })
    }
  }

  // Apaga a conversa SÓ PARA QUEM PEDIU. A outra pessoa continua vendo tudo.
  // Quando os dois lados já apagaram, as mensagens (e os arquivos) saem de vez do banco.
  async ApagarConversa(req, res) {
    try {
      const { anuncioId, usuarioId, outroUsuarioId } = req.params
      const idAnuncio = Number(anuncioId)
      const eu = Number(usuarioId)
      const outro = Number(outroUsuarioId)

      if (!idAnuncio || !eu || !outro) {
        return res.status(400).json({ erro: 'anuncioId, usuarioId e outroUsuarioId são obrigatórios' })
      }

      // mensagens que EU enviei -> some do meu lado (remetente)
      await prisma.mensagem.updateMany({
        where: { anuncioId: idAnuncio, remetenteId: eu, destinatarioId: outro },
        data: { apagadaRemetente: true },
      })

      // mensagens que EU recebi -> some do meu lado (destinatário)
      await prisma.mensagem.updateMany({
        where: { anuncioId: idAnuncio, remetenteId: outro, destinatarioId: eu },
        data: { apagadaDestinatario: true },
      })

      // limpeza: o que os dois já apagaram não precisa mais existir
      const apagadasPorAmbos = await prisma.mensagem.findMany({
        where: {
          anuncioId: idAnuncio,
          apagadaRemetente: true,
          apagadaDestinatario: true,
          OR: [
            { remetenteId: eu, destinatarioId: outro },
            { remetenteId: outro, destinatarioId: eu },
          ],
        },
        select: { id: true, tipo: true, conteudo: true },
      })

      if (apagadasPorAmbos.length > 0) {
        for (const m of apagadasPorAmbos) {
          if (m.tipo === 'foto' || m.tipo === 'audio') apagarArquivo(descriptografar(m.conteudo))
        }
        await prisma.mensagem.deleteMany({
          where: { id: { in: apagadasPorAmbos.map((m) => m.id) } },
        })
      }

      return res.status(200).json({ mensagem: 'Conversa apagada para você.' })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ erro: 'Erro ao apagar conversa' })
    }
  }
}

export default new MensagemController()
