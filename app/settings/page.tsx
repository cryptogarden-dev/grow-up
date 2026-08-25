import { getCategories } from "@/app/lib/data";
import { AddCategoryForm } from "@/app/components/AddCategoryForm";
import { CategoryRow } from "@/app/components/CategoryRow";
import { groupByCategory, groupIcon } from "@/app/lib/groups";

export default async function SettingsPage() {
  const categories = await getCategories();
  const groups = groupByCategory(
    categories.map((category) => ({ category }))
  );
  const groupNames = groups.map((g) => g.group);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Pengaturan Kategori
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Sesuaikan area yang ingin kamu lacak setiap minggu.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="flex flex-col gap-6">
          {groups.map(({ group, items }) => (
            <div key={group} className="flex flex-col gap-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                <span>{groupIcon(group)}</span>
                {group}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map(({ category }) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    groups={groupNames}
                  />
                ))}
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
              Belum ada kategori sama sekali. Tambahkan lewat form di samping.
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-medium">Tambah Kategori Baru</h2>
          <AddCategoryForm groups={groupNames} />
        </section>
      </div>
    </div>
  );
}
