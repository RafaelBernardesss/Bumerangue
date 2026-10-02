import { Router } from "express";
import multer from "multer";
import {
  buscarUsuario,
  atualizarFotoPerfil,
  removerFotoPerfil,
  atualizarNomeUsuario,
  atualizarTelefone,
  atualizarLocalizacao,
  redefinirSenha,
  excluirConta,
  salvarPushToken,
  listarContatos,
  registrarPing,
  marcarOffline,
  estatisticas,
  listarUsuarios,
} from "../controllers/UsuarioController.js";
import loginController from "../controllers/LoginController.js";
import cadastroController from "../controllers/CadastroController.js";
import uploadFoto from "../middlewares/uploadFoto.js";

const router = Router();

// Middleware que envolve o multer e trata os erros dele como JSON
function tratarUploadFoto(req, res, next) {
  uploadFoto.single("foto")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ erro: err.message });
    }
    if (err) {
      return res.status(400).json({ erro: err.message });
    }
    next();
  });
}


router.post("/login", (req, res) => loginController.login(req, res));
router.post("/cadastro", (req, res) => cadastroController.cadastrar(req, res));
router.get("/estatisticas", estatisticas);
router.get("/listar", listarUsuarios);
router.delete("/deletar/:id", excluirConta);
router.get("/:id/contatos", listarContatos);
router.get("/:id", buscarUsuario);
router.put("/:id/foto", tratarUploadFoto, atualizarFotoPerfil);
router.delete("/:id/foto", removerFotoPerfil);
router.put("/:id/nome", atualizarNomeUsuario);
router.put("/:id/telefone", atualizarTelefone);
router.put("/:id/localizacao", atualizarLocalizacao);
router.put("/:id/senha", redefinirSenha);
router.put("/:id/push-token", salvarPushToken);
router.put("/:id/ping", registrarPing);
router.put("/:id/offline", marcarOffline);
router.delete("/:id", excluirConta);

export default router;