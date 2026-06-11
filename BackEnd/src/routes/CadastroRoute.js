import express from "express";
import {cadastrarUsuario} from "../controller/CadastroController.js"

const router = express.Router();

router.post("cadastro", cadastrarUsuario);

export default router;

