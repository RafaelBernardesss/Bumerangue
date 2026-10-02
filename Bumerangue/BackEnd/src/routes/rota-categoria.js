import { Router } from "express";
import categoriaController from "../controllers/CategoriaController.js";

const router = Router();

router.get("/", (req, res) => categoriaController.Listar(req, res));
router.post("/", (req, res) => categoriaController.Criar(req, res));
router.delete("/:id", (req, res) => categoriaController.Excluir(req, res));

export default router;
