import { criarUploadImagem } from "../utils/uploadImagem.js";

// Foto de comprovação do serviço (finalização da troca) -> uploads/troca
export default criarUploadImagem("troca", "troca", (req) => req.body?.usuarioId);
