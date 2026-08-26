import jwt from "jsonwebtoken";

export default function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: "Token não informado." });
  }

  const [tipo, token] = authHeader.split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ erro: "Formato de token inválido. Use: Bearer <token>." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Ajuste "id" caso o payload do seu login use outro nome de campo
    req.usuarioId = payload.id;

    return next();
  } catch (erro) {
    return res.status(401).json({ erro: "Token inválido ou expirado." });
  }
}