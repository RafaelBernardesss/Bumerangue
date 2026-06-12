import express from "express";
import cors from "cors";
import rotaCadastro from "./routes/rotaCadastro.js";
import rotaLogin from "./routes/rotaLogin.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/usuarios", rotaCadastro);
app.use("/usuarios", rotaLogin)

export default app;