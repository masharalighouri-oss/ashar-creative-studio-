export async function onRequestGet({ env, params }) {
  if (!env.DESIGNS) {
    return new Response("Storage not configured", {
      status: 500
    });
  }

  const key = params.key;

  if (!key || key.includes("..") || key.startsWith("/")) {
    return new Response("Invalid image key", {
      status: 400
    });
  }

  const object = await env.DESIGNS.get(key);

  if (!object) {
    return new Response("Image not found", {
      status: 404
    });
  }

  const headers = new Headers();

  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=86400");
  headers.set("X-Content-Type-Options", "nosniff");

  return new Response(object.body, {
    headers
  });
}
