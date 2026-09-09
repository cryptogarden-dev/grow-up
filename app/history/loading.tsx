import { Skeleton } from "@/app/components/Skeleton";

export default function HistoryLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-80 rounded-2xl" />
    </div>
  );
}
