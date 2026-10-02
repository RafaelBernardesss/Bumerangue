import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7: a URL do banco fica aqui (não mais no schema.prisma).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
});
