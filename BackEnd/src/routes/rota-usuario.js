import { Router } from "express";
import {
  buscarUsuario,
  atualizarFotoPerfil,
  atualizarNomeUsuario,
  atualizarTelefone,
  redefinirSenha,
  excluirConta,
} from "../controllers/usuarioController.js";
import uploadFoto from "../middlewares/uploadFoto.js";

const router = Router();

// Se você já tem um middleware de autenticação (ex: verificarToken),
// importe e adicione ele antes do controller em cada rota, assim:
// router.put("/:id/foto", verificarToken, uploadFoto.single("foto"), atualizarFotoPerfil);

router.get("/:id", buscarUsuario);
router.put("/:id/foto", uploadFoto.single("foto"), atualizarFotoPerfil);
router.put("/:id/nome", atualizarNomeUsuario);
router.put("/:id/telefone", atualizarTelefone);
router.put("/:id/senha", redefinirSenha);
router.delete("/:id", excluirConta);

export default router;