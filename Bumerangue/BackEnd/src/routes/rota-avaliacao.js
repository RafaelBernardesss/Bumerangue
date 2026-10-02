import { Router } from "express";
import avaliacaoController from "../controllers/AvaliacaoController.js";

const router = Router();

router.get("/resumo", (req, res) => avaliacaoController.Resumo(req, res));
router.get("/troca/:anuncioId/:avaliadorId/:avaliadoId", (req, res) => avaliacaoController.JaAvaliei(req, res));
router.post("/", (req, res) => avaliacaoController.Criar(req, res));

export default router;
