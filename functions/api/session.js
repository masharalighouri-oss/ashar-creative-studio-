import { getSession, json } from "../_lib/auth.js";

export async function onRequestGet({ request, env }) {
  if (!env.SESSION_SECRET) {
    return json({ error: "Session is not configured." }, 500);
  }

  const session = await getSession(
    request,
    env.SESSION_SECRET
  );

  if (!session) {
    return json({ authenticated: false }, 401);
  }

  return json({ authenticated: true });
}
