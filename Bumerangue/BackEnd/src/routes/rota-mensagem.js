import { Router } from 'express'
import multer from 'multer'
import mensagemController from '../controllers/MensagemController.js'
import uploadFotoChat from '../middlewares/UploadFotoChat.js'
import uploadAudioChat from '../middlewares/UploadAudioChat.js'

const router = Router()


function tratarUpload(middleware) {
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err instanceof multer.MulterError || err) {
        return res.status(400).json({ erro: err.message })
      }
      next()
    })
  }
}

router.post('/', mensagemController.Enviar)
router.post('/foto', tratarUpload(uploadFotoChat.single('foto')), mensagemController.EnviarFoto)
router.post('/audio', tratarUpload(uploadAudioChat.single('audio')), mensagemController.EnviarAudio)
router.get('/:anuncioId/:usuarioId/:outroUsuarioId', mensagemController.ListarConversa)
router.delete('/:anuncioId/:usuarioId/:outroUsuarioId', mensagemController.ApagarConversa)

export default router
