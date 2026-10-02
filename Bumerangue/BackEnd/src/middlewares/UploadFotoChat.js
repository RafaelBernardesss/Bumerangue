import { criarUploadImagem } from "../utils/uploadImagem.js";

// Fotos enviadas no chat -> uploads/chat
export default criarUploadImagem("chat", "foto", (req) => req.body?.remetenteId);
