import { Router } from "express";
import { enviarMensagem, excluirConversa, listarMensagens } from "../controllers/conversaController.js";
import autenticar from "../middlewares/autenticar.js";

const router = Router();

router.get("/:id/mensagens", autenticar, listarMensagens);
router.post("/:id/mensagens", autenticar, enviarMensagem);
router.delete("/:id", autenticar, excluirConversa);

export default router;
