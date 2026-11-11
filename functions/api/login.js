import { makeSession, cookie, json } from "../_lib/auth.js";

export async function onRequestPost({ request, env }) {
  if (!env.OWNER_PASSWORD || !env.SESSION_SECRET) {
    return json({ error: "Owner login is not configured." }, 500);
  }

  let b;
  try {
    b = await request.json();
  } catch (e) {
    return json({ error: "Invalid request." }, 400);
  }

  const p = typeof b.password === "string" ? b.password : "";

  if (p.length > 200 || p !== env.OWNER_PASSWORD) {
    return json({ error: "Wrong owner password." }, 401);
  }

  return json(
    { ok: true },
    200,
    {
      "Set-Cookie": cookie(
        await makeSession(env.SESSION_SECRET)
      )
    }
  );
}
