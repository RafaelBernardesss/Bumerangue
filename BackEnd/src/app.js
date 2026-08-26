import express from "express";
import cors from "cors";

//importando as rotas
import rotaCadastro from "./routes/rotaCadastro.js";
import rotaLogin from "./routes/rotaLogin.js";
import rotaAdmin from "./routes/rota-admin.js";
import rotaUsuario from "./routes/rota-usuario.js"
import rotaAnuncio from "./routes/rota-Anuncio.js";
import rotaCategoria from "./routes/rota-Categoria.js";
import rotaNotificacao from "./routes/rota-notificacao.js";
import path from "path";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/usuarios", rotaCadastro);
app.use("/usuarios", rotaLogin);
app.use("/usuarios", rotaAdmin);
app.use("/usuarios", rotaUsuario);
app.use("/anuncios", rotaAnuncio);
app.use("/categorias", rotaCategoria);
app.use("/notificacoes", rotaNotificacao);
app.use("/uploads", express.static(path.resolve("uploads")));

export default app;