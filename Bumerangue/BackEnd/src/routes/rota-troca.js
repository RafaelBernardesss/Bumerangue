import { Router } from "express";
import trocaController from "../controllers/TrocaController.js";
import uploadFotoTroca from "../middlewares/uploadFotoTroca.js";
import { tratarUpload } from "../utils/uploadImagem.js";

const router = Router();

router.post("/enviar-foto", tratarUpload(uploadFotoTroca.single("foto")), (req, res) =>
  trocaController.EnviarFoto(req, res)
);
router.post("/confirmar", (req, res) => trocaController.Confirmar(req, res));
router.post("/cancelar", (req, res) => trocaController.Cancelar(req, res));
router.get("/pendentes/:usuarioId", (req, res) => trocaController.Pendentes(req, res));
router.get("/:anuncioId/:usuarioId/:outroUsuarioId", (req, res) => trocaController.Status(req, res));

export default router;
