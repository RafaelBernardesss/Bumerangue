import { Router } from "express";
import {
  listarNotificacoes,
  responderSolicitacao,
  listarServicosEmAndamento,
  salvarPushToken,
  excluirNotificacao,
} from "../controllers/notificacaoController.js";
import autenticar from "../middlewares/autenticar.js";

const router = Router();

router.get("/", autenticar, listarNotificacoes);
router.put("/:solicitacaoId/responder", autenticar, responderSolicitacao);
router.get("/servicos-em-andamento", autenticar, listarServicosEmAndamento);
router.post("/push-token", autenticar, salvarPushToken);
router.delete("/:id", autenticar, excluirNotificacao);


export default router;