import { Router } from "express";
import propostaController from "../controllers/PropostaController.js";

const router = Router();


router.get("/recebidas", (req, res) => propostaController.Recebidas(req, res));
router.get("/enviadas", (req, res) => propostaController.Enviadas(req, res));
router.post("/", (req, res) => propostaController.Criar(req, res));
router.put("/:id/responder", (req, res) => propostaController.Responder(req, res));

export default router;
