"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_COOKIE_MAX_AGE,
  createSessionToken,
  verifyPassword,
} from "@/app/lib/auth";

function safeNext(next: FormDataEntryValue | null): string {
  return typeof next === "string" && next.startsWith("/") ? next : "/";
}

export async function login(formData: FormData) {
  const password = (formData.get("password") as string) ?? "";
  const next = safeNext(formData.get("next"));

  let valid: boolean;
  try {
    valid = verifyPassword(password);
  } catch (error) {
    console.error("login failed: APP_PASSWORD not configured", error);
    redirect(`/login?error=config&next=${encodeURIComponent(next)}`);
  }

  if (!valid) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
  });

  redirect(next);
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
