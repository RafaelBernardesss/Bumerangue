import jwt from "jsonwebtoken";

export default function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: "Token não informado." });
  }

  const [, token] = authHeader.split(" "); // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ erro: "Token não informado." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = payload.id;
    return next();
  } catch (erro) {
    return res.status(401).json({ erro: "Token inválido ou expirado." });
  }
}