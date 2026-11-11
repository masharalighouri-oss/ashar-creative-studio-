import { getSession, json } from "../_lib/auth.js";

export async function onRequestGet({ request, env }) {
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

  const result = await env.DESIGNS.list();

  const designs = result.objects.map((item) => ({
    key: item.key,
    size: item.size,
    uploaded: item.uploaded
  }));

  return json({
    designs,
    cursor: result.truncated ? result.cursor : null
  });
}
