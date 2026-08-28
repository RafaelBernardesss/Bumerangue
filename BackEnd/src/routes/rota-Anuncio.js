import { Router } from "express";
import {
  criarAnuncio,
  listarAnuncios,
  buscarAnuncio,
  atualizarAnuncio,
  excluirAnuncio,
} from "../controllers/anuncioController.js";
import { criarSolicitacao } from "../controllers/solicitacaoController.js";
import uploadFotoAnuncio from "../middlewares/uploadFotoAnuncio.js";
import autenticar from "../middlewares/autenticar.js";

const router = Router();

router.post("/", uploadFotoAnuncio.single("foto"), criarAnuncio);
router.get("/", listarAnuncios);
router.get("/:id", buscarAnuncio);
router.put("/:id", uploadFotoAnuncio.single("foto"), atualizarAnuncio);
router.delete("/:id", excluirAnuncio);
router.post("/:id/solicitar", autenticar, criarSolicitacao);

export default router;