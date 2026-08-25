const GROUP_ICONS: Record<string, string> = {
  "Konten Sosmed": "📱",
  "Usaha & Karir": "💼",
  Ibadah: "🕌",
  Umum: "✨",
};

export function groupIcon(group: string): string {
  return GROUP_ICONS[group] ?? "🗂️";
}

/** Groups a list of items by `category.group`, preserving first-seen order. */
export function groupByCategory<T extends { category: { group: string } }>(
  items: T[]
): { group: string; items: T[] }[] {
  const order: string[] = [];
  const map = new Map<string, T[]>();
  for (const item of items) {
    const group = item.category.group;
    if (!map.has(group)) {
      map.set(group, []);
      order.push(group);
    }
    map.get(group)!.push(item);
  }
  return order.map((group) => ({ group, items: map.get(group)! }));
}
