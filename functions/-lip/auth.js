const COOKIE = "ashar_owner_session";
const LIFE = 28800;

function b64(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function un64(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  s += "=".repeat((4 - s.length % 4) % 4);
  return Uint8Array.from(atob(s), c => c.charCodeAt(0));
}

async function key(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function makeSession(secret) {
  const p = b64(new TextEncoder().encode(JSON.stringify({
    owner: true,
    exp: Math.floor(Date.now() / 1000) + LIFE
  })));

  const sig = await crypto.subtle.sign(
    "HMAC",
    await key(secret),
    new TextEncoder().encode(p)
  );

  return p + "." + b64(new Uint8Array(sig));
}

export async function isOwner(req, secret) {
  if (!secret) return false;

  const c = (req.headers.get("Cookie") || "")
    .split(";")
    .map(x => x.trim())
    .find(x => x.startsWith(COOKIE + "="));

  if (!c) return false;

  const parts = c.slice(COOKIE.length + 1).split(".");
  if (parts.length !== 2) return false;

  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await key(secret),
      un64(parts[1]),
      new TextEncoder().encode(parts[0])
    );

    if (!valid) return false;

    const p = JSON.parse(
      new TextDecoder().decode(un64(parts[0]))
    );

    return p.owner === true &&
      p.exp > Math.floor(Date.now() / 1000);
  } catch (e) {
    return false;
  }
}

export const cookie = t =>
  `${COOKIE}=${t}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${LIFE}`;

export const clearCookie = () =>
  `${COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers
    }
  });
}

export const clean = (v, n) =>
  typeof v === "string" ? v.trim().slice(0, n) : "";
