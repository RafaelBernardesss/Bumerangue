import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// A partir do Prisma 7, o PrismaClient não conecta mais sozinho: é
// preciso passar um "adapter" que sabe conversar com o banco escolhido.
// Pra SQLite local, o adapter é o PrismaBetterSqlite3.
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

export default prisma;