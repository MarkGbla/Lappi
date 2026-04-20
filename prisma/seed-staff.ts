import dotenv from "dotenv"
dotenv.config()
import pg from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"
import bcrypt from "bcryptjs"

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = "staff@christex.foundation"
  const hashedPassword = await bcrypt.hash("staff123", 10)

  const person = await prisma.person.upsert({
    where: { email },
    update: {
      hashedPassword,
      isActive: true,
      role: "STAFF",
    },
    create: {
      firstName: "Staff",
      lastName: "User",
      email,
      role: "STAFF",
      hashedPassword,
    },
  })

  console.log(`Upserted ${person.email} (id=${person.id}, role=${person.role}, active=${person.isActive})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
