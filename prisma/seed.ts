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
  console.log("Seeding database...")

  // Create admin
  const admin = await prisma.person.upsert({
    where: { email: "admin@christex.foundation" },
    update: {},
    create: {
      firstName: "Colin",
      lastName: "Ogoo",
      email: "admin@christex.foundation",
      phone: "+23276000001",
      role: "ADMIN",
      hashedPassword: await bcrypt.hash("admin123", 10),
    },
  })

  // Create super admin
  const superAdmin = await prisma.person.upsert({
    where: { email: "markgbla16@gmail.com" },
    update: {},
    create: {
      firstName: "Mark",
      lastName: "Gbla",
      email: "markgbla16@gmail.com",
      role: "ADMIN",
      hashedPassword: await bcrypt.hash("NSHM2019", 10),
    },
  })

  // Create staff members
  const staff1 = await prisma.person.upsert({
    where: { email: "aminata@christex.foundation" },
    update: {},
    create: {
      firstName: "Aminata",
      lastName: "Kamara",
      email: "aminata@christex.foundation",
      phone: "+23276000002",
      role: "STAFF",
      hashedPassword: await bcrypt.hash("staff123", 10),
    },
  })

  const staff2 = await prisma.person.upsert({
    where: { email: "mohammed@christex.foundation" },
    update: {},
    create: {
      firstName: "Mohammed",
      lastName: "Sesay",
      email: "mohammed@christex.foundation",
      phone: "+23276000003",
      role: "STAFF",
      hashedPassword: await bcrypt.hash("staff123", 10),
    },
  })

  // Create community members
  const members = await Promise.all([
    prisma.person.create({
      data: { firstName: "Ibrahim", lastName: "Conteh", phone: "+23276100001", role: "MEMBER" },
    }),
    prisma.person.create({
      data: { firstName: "Fatmata", lastName: "Bangura", phone: "+23276100002", role: "MEMBER" },
    }),
    prisma.person.create({
      data: { firstName: "Alhaji", lastName: "Bah", phone: "+23276100003", role: "MEMBER" },
    }),
    prisma.person.create({
      data: { firstName: "Mariama", lastName: "Jalloh", phone: "+23276100004", role: "MEMBER" },
    }),
    prisma.person.create({
      data: { firstName: "Abdul", lastName: "Koroma", phone: "+23276100005", role: "MEMBER" },
    }),
    prisma.person.create({
      data: { firstName: "Isatu", lastName: "Turay", phone: "+23276100006", role: "MEMBER" },
    }),
    prisma.person.create({
      data: { firstName: "Mohamed", lastName: "Kargbo", phone: "+23276100007", role: "MEMBER" },
    }),
    prisma.person.create({
      data: { firstName: "Aminata", lastName: "Mansaray", phone: "+23276100008", role: "MEMBER" },
    }),
    prisma.person.create({
      data: { firstName: "Abubakarr", lastName: "Sesay", phone: "+23276100009", role: "MEMBER" },
    }),
    prisma.person.create({
      data: { firstName: "Hawa", lastName: "Kamara", phone: "+23276100010", role: "MEMBER" },
    }),
  ])

  // Create assets
  const assets = await Promise.all([
    prisma.asset.create({ data: { name: "Dell Latitude 5520 #1", type: "LAPTOP", condition: "GOOD", serialNumber: "DL5520-001", location: "Lab A" } }),
    prisma.asset.create({ data: { name: "Dell Latitude 5520 #2", type: "LAPTOP", condition: "GOOD", serialNumber: "DL5520-002", location: "Lab A" } }),
    prisma.asset.create({ data: { name: "Dell Latitude 5520 #3", type: "LAPTOP", condition: "FAIR", serialNumber: "DL5520-003", location: "Lab A" } }),
    prisma.asset.create({ data: { name: "HP ProBook 450 #1", type: "LAPTOP", condition: "EXCELLENT", serialNumber: "HP450-001", location: "Lab B" } }),
    prisma.asset.create({ data: { name: "HP ProBook 450 #2", type: "LAPTOP", condition: "GOOD", serialNumber: "HP450-002", location: "Lab B" } }),
    prisma.asset.create({ data: { name: "Lenovo ThinkPad T14 #1", type: "LAPTOP", condition: "EXCELLENT", serialNumber: "LT14-001", location: "Storage" } }),
    prisma.asset.create({ data: { name: "iMac 24-inch #1", type: "DESKTOP", condition: "GOOD", serialNumber: "IMAC24-001", location: "Lab A" } }),
    prisma.asset.create({ data: { name: "Samsung Galaxy Tab S8", type: "TABLET", condition: "GOOD", serialNumber: "SGT-S8-001", location: "Storage" } }),
    prisma.asset.create({ data: { name: "Epson EB-W52 Projector", type: "PROJECTOR", condition: "GOOD", serialNumber: "EPSON-W52-001", location: "Classroom" } }),
    prisma.asset.create({ data: { name: "TP-Link Archer AX50", type: "ROUTER", condition: "EXCELLENT", serialNumber: "TPLINK-AX50-001", location: "Server Room" } }),
  ])

  // Create some sessions (2 active, rest completed)
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  // Active sessions
  await prisma.usageSession.create({
    data: {
      assetId: assets[0].id, personId: members[0].id, checkedOutById: staff1.id,
      purpose: "COHORT", checkedOutAt: twoDaysAgo, notes: "Cohort 8 — Solana development",
    },
  })
  await prisma.asset.update({ where: { id: assets[0].id }, data: { status: "CHECKED_OUT" } })

  await prisma.usageSession.create({
    data: {
      assetId: assets[3].id, personId: members[2].id, checkedOutById: staff1.id,
      purpose: "PERSONAL_LEARNING", checkedOutAt: yesterday,
    },
  })
  await prisma.asset.update({ where: { id: assets[3].id }, data: { status: "CHECKED_OUT" } })

  // Completed sessions
  await prisma.usageSession.create({
    data: {
      assetId: assets[1].id, personId: members[1].id, checkedOutById: staff1.id,
      purpose: "WORKSHOP", checkedOutAt: oneWeekAgo, checkedInAt: new Date(oneWeekAgo.getTime() + 4 * 60 * 60 * 1000),
      checkedInById: staff1.id, conditionOnReturn: "GOOD",
    },
  })
  await prisma.usageSession.create({
    data: {
      assetId: assets[4].id, personId: members[3].id, checkedOutById: staff2.id,
      purpose: "RESEARCH", checkedOutAt: oneWeekAgo, checkedInAt: new Date(oneWeekAgo.getTime() + 6 * 60 * 60 * 1000),
      checkedInById: staff2.id, conditionOnReturn: "GOOD",
    },
  })

  // Create issues
  await prisma.issue.create({
    data: {
      assetId: assets[2].id, reportedById: staff1.id, assignedToId: staff2.id,
      title: "Battery dies after 1 hour", description: "Battery health is very low, laptop shuts down after about 1 hour of use. Needs battery replacement.",
      severity: "MEDIUM", status: "IN_PROGRESS",
    },
  })
  await prisma.asset.update({ where: { id: assets[2].id }, data: { status: "NEEDS_ATTENTION" } })

  await prisma.issue.create({
    data: {
      assetId: assets[6].id, reportedById: staff2.id,
      title: "Mouse cursor freezes intermittently", description: "The iMac mouse cursor freezes for a few seconds every 10-15 minutes. Might be a Bluetooth issue.",
      severity: "LOW", status: "OPEN",
    },
  })

  await prisma.issue.create({
    data: {
      assetId: assets[1].id, reportedById: staff1.id, assignedToId: staff2.id,
      title: "Screen flickering", description: "Screen flickers when brightness is above 80%. Resolved by replacing display cable.",
      severity: "HIGH", status: "RESOLVED", resolutionNotes: "Replaced display cable. Issue no longer occurs.",
      resolvedAt: yesterday,
    },
  })

  // Create activity log entries
  await prisma.activityLog.create({
    data: { personId: admin.id, action: "ASSET_CREATED", entityType: "Asset", entityId: assets[0].id, metadata: { name: assets[0].name } },
  })
  await prisma.activityLog.create({
    data: { personId: staff1.id, action: "SESSION_STARTED", entityType: "UsageSession", entityId: assets[0].id, metadata: { assetName: assets[0].name, personName: "Ibrahim Conteh" } },
  })
  await prisma.activityLog.create({
    data: { personId: staff1.id, action: "ISSUE_REPORTED", entityType: "Issue", entityId: assets[2].id, metadata: { title: "Battery dies after 1 hour", assetName: assets[2].name } },
  })

  console.log("Seed complete!")
  console.log(`  Admin: markgbla16@gmail.com / NSHM2019`)
  console.log(`  Admin: admin@christex.foundation / admin123`)
  console.log(`  Staff: aminata@christex.foundation / staff123`)
  console.log(`  Staff: mohammed@christex.foundation / staff123`)
  console.log(`  ${members.length} community members`)
  console.log(`  ${assets.length} assets`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
