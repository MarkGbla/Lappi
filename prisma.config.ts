import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations must run over a direct (non-pooled) connection.
    // DIRECT_URL is the unpooled Neon URL; fall back to DATABASE_URL for local dev.
    url: (process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"])!,
  },
})
