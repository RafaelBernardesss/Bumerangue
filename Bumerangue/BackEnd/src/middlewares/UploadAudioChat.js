import multer from "multer";
import path from "path";
import fs from "fs";

const pastaUploads = path.resolve("uploads", "chat");

if (!fs.existsSync(pastaUploads)) {
  fs.mkdirSync(pastaUploads, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pastaUploads);
  },
  filename: (req, file, cb) => {
    const idRemetente = String(req.body?.remetenteId || "anonimo").replace(/\D/g, "") || "anonimo";
    const extensao = path.extname(file.originalname).toLowerCase() || ".m4a";
    cb(null, `audio_${idRemetente}_${Date.now()}${extensao}`);
  },
});

// Formatos gravados pelo celular: m4a/aac (Android e iOS), 3gp, caf, mp3, wav, webm
const EXTENSOES = /\.(m4a|aac|mp3|mp4|3gp|wav|caf|webm|ogg)$/;

function filtroArquivo(req, file, cb) {
  const extensaoValida = EXTENSOES.test(path.extname(file.originalname).toLowerCase());
  // alguns aparelhos mandam o m4a como video/mp4 ou application/octet-stream
  const mimeValido = /^(audio\/|video\/mp4|video\/3gpp|application\/octet-stream)/.test(file.mimetype);

  if (extensaoValida && mimeValido) {
    cb(null, true);
  } else {
    cb(new Error("Formato de áudio não suportado."));
  }
}

const uploadAudioChat = multer({
  storage,
  fileFilter: filtroArquivo,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export default uploadAudioChat;
