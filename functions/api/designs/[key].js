import { getSession, json } from "../../_lib/auth.js";

export async function onRequestDelete({ request, env, params }) {
  const session = await getSession(
    request,
    env.SESSION_SECRET
  );

  if (!session) {
    return json({ error: "Unauthorized" }, 401);
  }

  if (!env.DESIGNS) {
    return json({ error: "Storage not configured" }, 500);
  }

  const key = params.key;

  if (!key || key.includes("/") || key.includes("\\")) {
    return json({ error: "Invalid design key" }, 400);
  }

  const existing = await env.DESIGNS.head(key);

  if (!existing) {
    return json({ error: "Design not found" }, 404);
  }

  await env.DESIGNS.delete(key);

  return json({ ok: true, deleted: key });
}
