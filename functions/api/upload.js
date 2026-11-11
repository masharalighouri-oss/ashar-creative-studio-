import { getSession, json } from "../_lib/auth.js";

export async function onRequestPost({ request, env }) {
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

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!file || typeof file.arrayBuffer !== "function") {
      return json({ error: "No file uploaded" }, 400);
    }

    if (file.size > 10 * 1024 * 1024) {
      return json({ error: "File is too large" }, 413);
    }

    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowed.includes(file.type)) {
      return json({ error: "Invalid image type" }, 400);
    }

    const key = crypto.randomUUID() + "." +
      file.type.split("/")[1].replace("jpeg", "jpg");

    await env.DESIGNS.put(
      key,
      await file.arrayBuffer(),
      {
        httpMetadata: {
          contentType: file.type
        }
      }
    );

    return json({ ok: true, key });
  } catch (error) {
    return json({ error: "Upload failed" }, 500);
  }
}
