import { criarUploadImagem } from "../utils/uploadImagem.js";

// Foto de perfil -> uploads/perfil
export default criarUploadImagem("perfil", "perfil", (req) => req.params?.id);
