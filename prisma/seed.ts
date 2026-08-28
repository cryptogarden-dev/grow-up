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

type SeedGoal = {
  title: string;
  area: string;
  period: string;
  targetValue: string;
  order: number;
  tasks: string[];
};

// From the "Karir & Bisnis" 2026-2027 roadmap: each big target gets a few
// starter tasks so it's immediately workable day-to-day, not just a number.
const defaultGoals: SeedGoal[] = [
  {
    title: "Stok unit 20-30 motor",
    area: "Panglima Motor",
    period: "2026-2027",
    targetValue: "20-30 unit",
    order: 0,
    tasks: [
      "Riset supplier motor bekas/baru",
      "Hitung modal & margin per unit",
      "Beli unit pertama (mulai dari 5 unit)",
    ],
  },
  {
    title: "Branding sosmed - TikTok 10rb follower",
    area: "Panglima Motor",
    period: "2026-2027",
    targetValue: "10rb follower TikTok",
    order: 1,
    tasks: [
      "Buat akun TikTok bisnis",
      "Rancang 10 ide konten pertama",
      "Konsisten posting 3x/minggu",
    ],
  },
  {
    title: "Modal 250 juta",
    area: "Panglima Motor",
    period: "2026-2027",
    targetValue: "Rp 250.000.000",
    order: 2,
    tasks: [
      "Hitung kebutuhan modal detail (unit, sewa, operasional)",
      "List sumber modal (tabungan, investor, pinjaman)",
      "Godok skema pendanaan",
    ],
  },
  {
    title: "Omset bersih 3-4 juta+",
    area: "Panglima Motor",
    period: "2026-2027",
    targetValue: "Rp 3-4 juta/bulan",
    order: 3,
    tasks: [
      "Tentukan harga jual & margin per unit",
      "Buat target penjualan bulanan",
      "Catat & evaluasi omset mingguan",
    ],
  },
  {
    title: "3 cabang profit",
    area: "Toko Zoya",
    period: "2026-2027",
    targetValue: "3 cabang",
    order: 4,
    tasks: [
      "Analisa performa cabang yang sudah ada",
      "Cari lokasi cabang baru",
      "Susun rencana buka cabang",
    ],
  },
  {
    title: "Karyawan 3 orang",
    area: "Toko Zoya",
    period: "2026-2027",
    targetValue: "3 karyawan",
    order: 5,
    tasks: [
      "Buat deskripsi kerja & syarat",
      "Pasang lowongan",
      "Interview & rekrut",
    ],
  },
  {
    title: "Branding sosmed - TikTok 10rb follower",
    area: "Toko Zoya",
    period: "2026-2027",
    targetValue: "10rb follower TikTok",
    order: 6,
    tasks: [
      "Buat akun TikTok bisnis",
      "Rancang 10 ide konten pertama",
      "Konsisten posting 3x/minggu",
    ],
  },
  {
    title: "Omset total semua cabang 10 juta+",
    area: "Toko Zoya",
    period: "2026-2027",
    targetValue: "Rp 10 juta+/bulan",
    order: 7,
    tasks: [
      "Tentukan target omset per cabang",
      "Evaluasi mingguan omset semua cabang",
    ],
  },
  {
    title: "Daftar PNS",
    area: "Personal",
    period: "2026-2027",
    targetValue: "",
    order: 8,
    tasks: [
      "Cari info formasi & syarat CPNS terbaru",
      "Siapkan berkas administrasi",
      "Daftar & ikut ujian SKD",
    ],
  },
  {
    title: "Kerja corporate",
    area: "Personal",
    period: "2026-2027",
    targetValue: "Rate mid 5-7 juta",
    order: 9,
    tasks: [
      "Update CV & portfolio",
      "List perusahaan target",
      "Apply & ikut interview",
    ],
  },
  {
    title: "Masuk S2",
    area: "Personal",
    period: "2026-2027",
    targetValue: "",
    order: 10,
    tasks: [
      "Riset kampus & jurusan S2",
      "Siapkan syarat (TOEFL, dokumen)",
      "Daftar S2",
    ],
  },
  {
    title: "Mulai lagi branding",
    area: "Crypgarden",
    period: "2026-2027",
    targetValue: "",
    order: 11,
    tasks: [
      "Audit akun sosmed yang ada",
      "Rancang konten calendar",
      "Posting konten pertama",
    ],
  },
  {
    title: "Trade & posting",
    area: "Crypgarden",
    period: "2026-2027",
    targetValue: "Rate 0-5 juta+",
    order: 12,
    tasks: [
      "Riset market & strategi trading",
      "Trading rutin dengan modal kecil dulu",
      "Posting hasil/insight rutin",
    ],
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

  for (const goal of defaultGoals) {
    const { tasks, ...goalData } = goal;
    const existing = await prisma.goal.findFirst({
      where: { title: goal.title, area: goal.area },
    });

    const goalId = existing
      ? existing.id
      : (await prisma.goal.create({ data: goalData })).id;

    if (existing) {
      await prisma.goal.update({ where: { id: goalId }, data: goalData });
    }

    for (let i = 0; i < tasks.length; i++) {
      const existingTask = await prisma.task.findFirst({
        where: { goalId, title: tasks[i] },
      });
      if (!existingTask) {
        await prisma.task.create({
          data: { goalId, title: tasks[i], order: i },
        });
      }
    }

    console.log(`${existing ? "Updated" : "Created"} goal: ${goal.title}`);
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
