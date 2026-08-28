-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Anuncio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
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
    CONSTRAINT "Anuncio_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Anuncio_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Anuncio" ("atualizadoEm", "categoriaId", "cidade", "criadoEm", "descricao", "disponibilidade", "estado", "foto", "id", "preferencia", "status", "titulo", "usuarioId") SELECT "atualizadoEm", "categoriaId", "cidade", "criadoEm", "descricao", "disponibilidade", "estado", "foto", "id", "preferencia", "status", "titulo", "usuarioId" FROM "Anuncio";
DROP TABLE "Anuncio";
ALTER TABLE "new_Anuncio" RENAME TO "Anuncio";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
