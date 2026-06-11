import express from "express";
import cors from "cors"


const app = express()

app.use(cors());
app.use(express.json());

//imports
import cadastroRoute from "./routes/CadastroRoute.js"

// conecta as rotas do usuário
app.use(cadastroRoute);

export default app;