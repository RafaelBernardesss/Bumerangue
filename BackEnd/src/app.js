import cors from "cors";
import express from "express";

//importando as rotas
import path from "path";
import rotaAdmin from "./routes/rota-admin.js";
import rotaAnuncio from "./routes/rota-Anuncio.js";
import rotaCategoria from "./routes/rota-Categoria.js";
import rotaConversa from "./routes/rota-conversa.js";
import rotaNotificacao from "./routes/rota-notificacao.js";
import rotaUsuario from "./routes/rota-usuario.js";
import rotaCadastro from "./routes/rotaCadastro.js";
import rotaLogin from "./routes/rotaLogin.js";

const app = express();
// Simple request logger to help diagnose incoming requests
app.use((req, res, next) => {
	console.log(`[HTTP] ${req.method} ${req.originalUrl}`);
	next();
});

app.use(cors());
app.use(express.json());

app.use("/usuarios", rotaCadastro);
app.use("/usuarios", rotaLogin);
app.use("/usuarios", rotaAdmin);
app.use("/usuarios", rotaUsuario);
app.use("/anuncios", rotaAnuncio);
app.use("/categorias", rotaCategoria);
app.use("/notificacoes", rotaNotificacao);
app.use("/conversas", rotaConversa);
app.use("/uploads", express.static(path.resolve("uploads")));

export default app;