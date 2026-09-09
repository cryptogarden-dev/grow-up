import { getArchivedCategories, getCategories } from "@/app/lib/data";
import { unarchiveCategory } from "@/app/lib/actions";
import { AddCategoryForm } from "@/app/components/AddCategoryForm";
import { CategoryRow } from "@/app/components/CategoryRow";
import { groupByCategory, groupIcon } from "@/app/lib/groups";

export default async function SettingsPage() {
  const [categories, archivedCategories] = await Promise.all([
    getCategories(),
    getArchivedCategories(),
  ]);
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

        <section className="flex flex-col gap-6">
          <div>
            <h2 className="mb-3 font-medium">Tambah Kategori Baru</h2>
            <AddCategoryForm groups={groupNames} />
          </div>

          {archivedCategories.length > 0 && (
            <div>
              <h2 className="mb-3 font-medium">Kategori Diarsipkan</h2>
              <div className="flex flex-col gap-2">
                {archivedCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900/50"
                  >
                    <span className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                      <span>{category.icon}</span>
                      {category.name}
                    </span>
                    <form action={unarchiveCategory}>
                      <input type="hidden" name="id" value={category.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        Aktifkan lagi
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
