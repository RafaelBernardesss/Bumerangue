-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT,
    "foto" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "pushToken" TEXT,
    "dataNascimento" DATETIME,
    "ultimoAcesso" DATETIME
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Anuncio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "preferencia" TEXT NOT NULL,
    "foto" TEXT,
    "disponibilidade" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "cidade" TEXT,
    "estado" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    CONSTRAINT "Anuncio_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Anuncio_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Mensagem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "conteudo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'texto',
    "data_hora" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "apagadaRemetente" BOOLEAN NOT NULL DEFAULT false,
    "apagadaDestinatario" BOOLEAN NOT NULL DEFAULT false,
    "remetenteId" INTEGER NOT NULL,
    "destinatarioId" INTEGER NOT NULL,
    "anuncioId" INTEGER NOT NULL,
    CONSTRAINT "Mensagem_remetenteId_fkey" FOREIGN KEY ("remetenteId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Mensagem_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Mensagem_anuncioId_fkey" FOREIGN KEY ("anuncioId") REFERENCES "Anuncio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Proposta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mensagem" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "anuncioId" INTEGER NOT NULL,
    "propostoPor" INTEGER NOT NULL,
    CONSTRAINT "Proposta_anuncioId_fkey" FOREIGN KEY ("anuncioId") REFERENCES "Anuncio" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Proposta_propostoPor_fkey" FOREIGN KEY ("propostoPor") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Troca" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "anuncioId" INTEGER NOT NULL,
    "usuarioAId" INTEGER NOT NULL,
    "usuarioBId" INTEGER NOT NULL,
    "usuarioAFoto" TEXT,
    "usuarioBFoto" TEXT,
    "usuarioAConfirmou" BOOLEAN NOT NULL DEFAULT false,
    "usuarioBConfirmou" BOOLEAN NOT NULL DEFAULT false,
    "finalizada" BOOLEAN NOT NULL DEFAULT false,
    "ultimoEnviouId" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Troca_anuncioId_fkey" FOREIGN KEY ("anuncioId") REFERENCES "Anuncio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Avaliacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "trocaId" INTEGER,
    "anuncioId" INTEGER,
    "anuncioTitulo" TEXT,
    "avaliadorId" INTEGER NOT NULL,
    "avaliadoId" INTEGER NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Avaliacao_trocaId_fkey" FOREIGN KEY ("trocaId") REFERENCES "Troca" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_cpf_key" ON "Usuario"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nome_key" ON "Categoria"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Troca_anuncioId_usuarioBId_key" ON "Troca"("anuncioId", "usuarioBId");

-- CreateIndex
CREATE INDEX "Avaliacao_avaliadoId_idx" ON "Avaliacao"("avaliadoId");

-- CreateIndex
CREATE UNIQUE INDEX "Avaliacao_trocaId_avaliadorId_key" ON "Avaliacao"("trocaId", "avaliadorId");
