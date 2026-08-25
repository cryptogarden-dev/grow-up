import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const defaultCategories = [
  {
    name: "Konten YouTube",
    type: "counter",
    weeklyTarget: 1,
    group: "Konten Sosmed",
    icon: "📺",
    order: 0,
  },
  {
    name: "Konten TikTok",
    type: "counter",
    weeklyTarget: 1,
    group: "Konten Sosmed",
    icon: "🎵",
    order: 1,
  },
  {
    name: "Konten Instagram",
    type: "counter",
    weeklyTarget: 1,
    group: "Konten Sosmed",
    icon: "📸",
    order: 2,
  },
  {
    name: "Usaha - Crypgarden",
    type: "notes",
    weeklyTarget: null,
    group: "Usaha & Karir",
    icon: "🌱",
    order: 3,
  },
  {
    name: "Karir",
    type: "notes",
    weeklyTarget: null,
    group: "Usaha & Karir",
    icon: "💼",
    order: 4,
  },
  {
    name: "Skill",
    type: "notes",
    weeklyTarget: null,
    group: "Usaha & Karir",
    icon: "📚",
    order: 5,
  },
  {
    name: "Tahajud",
    type: "counter",
    weeklyTarget: 3,
    group: "Ibadah",
    icon: "🌙",
    order: 6,
    dailyTracking: true,
  },
  {
    name: "Sholat 5 Waktu",
    type: "counter",
    // 17 rakaat wajib/hari x 7 hari.
    weeklyTarget: 119,
    group: "Ibadah",
    icon: "🕌",
    order: 7,
    dailyTracking: true,
  },
  {
    name: "Doa & Dzikir",
    type: "counter",
    weeklyTarget: 7,
    group: "Ibadah",
    icon: "🤲",
    order: 8,
    dailyTracking: true,
  },
];

async function main() {
  for (const category of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: category.name },
    });
    if (existing) {
      await prisma.category.update({
        where: { id: existing.id },
        data: category,
      });
      console.log(`Updated category: ${category.name}`);
    } else {
      await prisma.category.create({ data: category });
      console.log(`Created category: ${category.name}`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
