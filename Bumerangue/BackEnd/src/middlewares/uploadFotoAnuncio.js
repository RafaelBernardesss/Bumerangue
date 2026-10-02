import { criarUploadImagem } from "../utils/uploadImagem.js";

// Foto do anúncio -> uploads/anuncios
export default criarUploadImagem("anuncios", "anuncio", (req) => req.body?.usuarioId || req.params?.id);
