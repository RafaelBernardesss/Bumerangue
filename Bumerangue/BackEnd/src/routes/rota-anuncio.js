import { Router } from "express";
import anuncioController from "../controllers/AnuncioController.js";
import uploadFotoAnuncio from "../middlewares/uploadFotoAnuncio.js";
import { tratarUpload } from "../utils/uploadImagem.js";

const router = Router();
const upload = tratarUpload(uploadFotoAnuncio.single("foto"));


router.get("/servicos-realizados", (req, res) => anuncioController.ServicosRealizados(req, res));
router.get("/", (req, res) => anuncioController.Listar(req, res));
router.post("/", upload, (req, res) => anuncioController.Criar(req, res));
router.get("/:id", (req, res) => anuncioController.Detalhar(req, res));
router.put("/:id", upload, (req, res) => anuncioController.Atualizar(req, res));
router.delete("/:id", (req, res) => anuncioController.Excluir(req, res));

export default router;
