import { Router } from "express";
import {
  listarNotificacoes,
  responderSolicitacao,
  listarServicosEmAndamento,
  salvarPushToken,
} from "../controllers/notificacaoController.js";
import autenticar from "../middlewares/autenticar.js"; // seu middleware de auth (JWT/sessão)

const router = Router();

router.get("/", autenticar, listarNotificacoes);
router.put("/:solicitacaoId/responder", autenticar, responderSolicitacao);
router.get("/servicos-em-andamento", autenticar, listarServicosEmAndamento);
router.post("/push-token", autenticar, salvarPushToken);

export default router;