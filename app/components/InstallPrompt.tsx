"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "growup-install-dismissed-until";
const DISMISS_DAYS = 14;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    nav.standalone === true
  );
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIPhoneOrIpod = /iPhone|iPod/.test(ua);
  // iPadOS 13+ reports as "Macintosh" but has touch support.
  const isIpad =
    /iPad/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return isIPhoneOrIpod || isIpad;
}

function isDismissed(): boolean {
  const until = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
  return Date.now() < until;
}

function dismissFor(days: number) {
  localStorage.setItem(
    DISMISS_KEY,
    String(Date.now() + days * 24 * 60 * 60 * 1000)
  );
}

/**
 * Nudges users to install the app to their home screen. iOS Safari has no
 * native install prompt (unlike Chrome/Android's `beforeinstallprompt`), so
 * for iOS we show manual "tap Share, then Add to Home Screen" instructions.
 * For browsers that do support it, we show a real install button instead.
 */
export function InstallPrompt() {
  const [variant, setVariant] = useState<"none" | "ios" | "android">("none");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone() || isDismissed()) return;

    if (isIos()) {
      // Feature/UA detection needs `window`/`navigator`, which don't exist
      // during SSR — this can only run after mount, so it can't be computed
      // during render without a server/client markup mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVariant("ios");
      return;
    }

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVariant("android");
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        onBeforeInstallPrompt
      );
  }, []);

  if (variant === "none") return null;

  function dismiss() {
    dismissFor(DISMISS_DAYS);
    setVariant("none");
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      dismissFor(365);
    } else {
      dismissFor(DISMISS_DAYS);
    }
    setVariant("none");
  }

  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:bottom-4 sm:left-auto sm:right-4 sm:w-96 sm:px-0">
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-lg dark:border-emerald-900/50 dark:bg-zinc-900">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 text-base shadow-sm">
          🌱
        </span>
        <div className="flex-1 text-sm">
          {variant === "ios" ? (
            <>
              <p className="font-medium">Install Grow Up di iPhone kamu</p>
              <p className="mt-1 text-zinc-500 dark:text-zinc-400">
                Tap tombol Share{" "}
                <span aria-hidden className="inline-block">
                  ⎋
                </span>{" "}
                di Safari, lalu pilih{" "}
                <span className="font-medium">
                  &quot;Add to Home Screen&quot;
                </span>
                .
              </p>
            </>
          ) : (
            <>
              <p className="font-medium">Install Grow Up</p>
              <p className="mt-1 text-zinc-500 dark:text-zinc-400">
                Akses lebih cepat langsung dari layar utama, seperti aplikasi
                biasa.
              </p>
              <button
                type="button"
                onClick={install}
                className="mt-2 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
              >
                Install Aplikasi
              </button>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Tutup"
          className="shrink-0 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
