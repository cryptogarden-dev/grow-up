import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Minimal single-user "password gate" for this personal app — not a full
 * multi-user auth system. Session state is a signed, stateless cookie
 * (`<expiry>.<hmac>`), so there's no session table to manage. Verified both
 * in `proxy.ts` (optimistic, for page navigation) and inside every mutating
 * Server Action via `requireAuth()`, per Next.js's own guidance not to rely
 * on Proxy alone for authentication/authorization.
 */
export const SESSION_COOKIE = "grow_up_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET env var is not set. Generate one (e.g. `openssl rand -hex 32`) and add it to your environment."
    );
  }
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getAuthSecret()).update(value).digest("hex");
}

/** Constant-time string comparison, safe for secrets/signatures of equal expected length. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Builds a signed session token: `<expiresAtMs>.<hmac>`. */
export function createSessionToken(): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  return `${expiresAt}.${sign(String(expiresAt))}`;
}

export const SESSION_COOKIE_MAX_AGE = SESSION_MAX_AGE_SECONDS;

/** Verifies a session token's signature and expiry. */
export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const dotIndex = token.indexOf(".");
  if (dotIndex === -1) return false;
  const expiresAtRaw = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
  return safeEqual(signature, sign(expiresAtRaw));
}

/** Checks a submitted password against `APP_PASSWORD`, constant-time. */
export function verifyPassword(password: string): boolean {
  const expected = process.env.APP_PASSWORD;
  if (!expected) {
    throw new Error(
      "APP_PASSWORD env var is not set. Add it to your environment to enable login."
    );
  }
  return safeEqual(password, expected);
}

/**
 * Guards a Server Action against unauthenticated use. Proxy already gates
 * page navigation, but Server Functions are POSTs to their own route and
 * deserve their own check — see Next.js's Data Security guide on not
 * relying on Proxy alone for auth. Redirects to /login if the session
 * cookie is missing, invalid, or expired.
 */
export async function requireAuth(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!isValidSessionToken(token)) {
    redirect("/login");
  }
}
