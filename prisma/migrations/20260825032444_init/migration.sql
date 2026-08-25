-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "weeklyTarget" INTEGER,
    "group" TEXT NOT NULL DEFAULT 'Umum',
    "icon" TEXT NOT NULL DEFAULT '📌',
    "dailyTracking" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyEntry" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "count" INTEGER,
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyEntry" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyEntry_categoryId_weekStart_key" ON "WeeklyEntry"("categoryId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "DailyEntry_categoryId_date_key" ON "DailyEntry"("categoryId", "date");

-- AddForeignKey
ALTER TABLE "WeeklyEntry" ADD CONSTRAINT "WeeklyEntry_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyEntry" ADD CONSTRAINT "DailyEntry_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
