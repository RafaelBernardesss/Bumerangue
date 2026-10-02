import multer from "multer";
import path from "path";
import fs from "fs";

const EXTENSOES = /\.(jpe?g|png|webp|gif|heic|heif)$/;

export function criarUploadImagem(subpasta, prefixo, nomeDoDono) {
  const pasta = path.resolve("uploads", subpasta);
  fs.mkdirSync(pasta, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, pasta),
    filename: (req, file, cb) => {
      const dono = String(nomeDoDono ? nomeDoDono(req) : "").replace(/\D/g, "") || "x";
      const extensao = path.extname(file.originalname).toLowerCase() || ".jpg";
      cb(null, `${prefixo}_${dono}_${Date.now()}${extensao}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
    fileFilter: (req, file, cb) => {
      const extensaoValida = EXTENSOES.test(path.extname(file.originalname).toLowerCase());
      // alguns aparelhos mandam a imagem sem tipo definido
      const mimeValido = /^(image\/|application\/octet-stream)/.test(file.mimetype);

      if (extensaoValida || mimeValido) return cb(null, true);
      cb(new Error("Formato de imagem não suportado. Use JPG, PNG ou WEBP."));
    },
  });
}

/** Envolve o middleware do multer para devolver os erros dele como JSON (400). */
export function tratarUpload(middleware) {
  return (req, res, next) => {
    middleware(req, res, (erro) => {
      if (erro) return res.status(400).json({ erro: erro.message });
      next();
    });
  };
}

/** Apaga um arquivo que esteja dentro da pasta uploads (ignora qualquer outro caminho). */
export function apagarArquivoUpload(caminhoRelativo) {
  try {
    if (!caminhoRelativo) return;
    const pastaUploads = path.resolve("uploads");
    const caminho = path.resolve(caminhoRelativo);
    if (!caminho.startsWith(pastaUploads + path.sep)) return;

    fs.unlink(caminho, (erro) => {
      if (erro && erro.code !== "ENOENT") console.error("Erro ao remover arquivo:", erro);
    });
  } catch (erro) {
    console.error("Erro ao remover arquivo:", erro);
  }
}

/** Caminho que vai para o banco (sempre com "/", funciona no Windows e no Linux). */
export function caminhoUpload(subpasta, nomeArquivo) {
  return path.posix.join("uploads", subpasta, nomeArquivo);
}
