import { Router } from "express";
import {
  buscarUsuario,
  atualizarFotoPerfil,
  removerFotoPerfil,
  atualizarNomeUsuario,
  atualizarTelefone,
  redefinirSenha,
  excluirConta,
} from "../controllers/usuarioController.js";
import uploadFoto from "../middlewares/uploadFoto.js";

const router = Router();


router.get("/:id", buscarUsuario);
router.put("/:id/foto", uploadFoto.single("foto"), atualizarFotoPerfil);
router.delete("/:id/foto", removerFotoPerfil);
router.put("/:id/nome", atualizarNomeUsuario);
router.put("/:id/telefone", atualizarTelefone);
router.put("/:id/senha", redefinirSenha);
router.delete("/:id", excluirConta);

export default router;