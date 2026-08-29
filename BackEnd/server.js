import app from "./src/app.js";
import prisma from "./src/prisma/Client.js";

async function ensureTables() {
    // Create conversation and message tables if they don't exist (SQLite)
    try {
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS conversa (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                solicitacaoId INTEGER,
                donoId INTEGER,
                solicitanteId INTEGER,
                criadoEm DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS mensagem (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversaId INTEGER,
                remetenteId INTEGER,
                texto TEXT,
                criadoEm DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Tabelas de conversa/mensagem verificadas/criadas.");
    } catch (e) {
        console.error("Erro ao criar tabelas de conversa/mensagem:", e);
    }
}

// root handled by app.js

(async () => {
    await ensureTables();
    app.listen(3000, () => {
        console.log("Servidor rodando na porta 3000")
    });
})();