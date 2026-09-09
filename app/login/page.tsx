import { login } from "@/app/lib/auth-actions";

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const error =
    typeof searchParams.error === "string" ? searchParams.error : undefined;
  const nextParam =
    typeof searchParams.next === "string" ? searchParams.next : "/";
  const next = nextParam.startsWith("/") ? nextParam : "/";

  return (
    <div className="mx-auto flex max-w-sm flex-1 flex-col items-center justify-center gap-6 py-16">
      <div className="text-center">
        <span className="text-4xl">🌱</span>
        <h1 className="mt-3 text-xl font-semibold">Masuk ke Grow Up</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Aplikasi ini privat. Masukkan password untuk melanjutkan.
        </p>
      </div>

      <form action={login} className="flex w-full flex-col gap-3">
        <input type="hidden" name="next" value={next} />
        <input
          type="password"
          name="password"
          required
          autoFocus
          placeholder="Password"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />

        {error === "1" && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Password salah. Coba lagi.
          </p>
        )}
        {error === "config" && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Server belum dikonfigurasi (APP_PASSWORD / AUTH_SECRET belum
            diset).
          </p>
        )}

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
        >
          Masuk
        </button>
      </form>
    </div>
  );
}
