import express from "express";
import cors from "cors";
import rotaCadastro from "./routes/rotaCadastro.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/usuarios", rotaCadastro);

export default app;