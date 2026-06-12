/*
  Warnings:

  - Added the required column `senha` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL
);
INSERT INTO "new_Usuario" ("cpf", "email", "id", "nome") SELECT "cpf", "email", "id", "nome" FROM "Usuario";
DROP TABLE "Usuario";
ALTER TABLE "new_Usuario" RENAME TO "Usuario";
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
CREATE UNIQUE INDEX "Usuario_cpf_key" ON "Usuario"("cpf");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
