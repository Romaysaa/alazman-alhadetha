const { getStore } = require("@netlify/blobs");

const SITE_ID = "d837d865-dfee-4e23-a4d2-2a0dd4cddbce";

function getStoreSafe(name) {
  const token = process.env.BLOBS_TOKEN;
  if (token) {
    return getStore({ name, siteID: SITE_ID, token });
  }
  return getStore(name);
}

const MAX_BYTES = 2 * 1024 * 1024; // 2MB

exports.handler = async (event) => {
  const store = getStoreSafe("quote-images");

  if (event.httpMethod === "GET") {
    const id = event.queryStringParameters && event.queryStringParameters.id;
    if (!id) {
      return { statusCode: 400, body: "Missing id" };
    }
    const blob = await store.getWithMetadata(id, { type: "arrayBuffer" });
    if (!blob) {
      return { statusCode: 404, body: "Not found" };
    }
    return {
      statusCode: 200,
      headers: {
        "Content-Type": (blob.metadata && blob.metadata.contentType) || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
      body: Buffer.from(blob.data).toString("base64"),
      isBase64Encoded: true,
    };
  }

  if (event.httpMethod === "POST") {
    let data;
    try {
      data = JSON.parse(event.body || "{}");
    } catch {
      return { statusCode: 400, body: JSON.stringify({ error: "بيانات غير صالحة" }) };
    }

    const base64 = (data.data || "").replace(/^data:[^;]+;base64,/, "");
    const contentType = data.contentType || "image/jpeg";

    if (!base64) {
      return { statusCode: 400, body: JSON.stringify({ error: "لا توجد صورة" }) };
    }

    const buffer = Buffer.from(base64, "base64");
    if (buffer.length > MAX_BYTES) {
      return { statusCode: 400, body: JSON.stringify({ error: "حجم الصورة كبير جداً (الحد الأقصى 2 ميجابايت)" }) };
    }

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    await store.set(id, buffer, { metadata: { contentType } });

    return { statusCode: 201, body: JSON.stringify({ id, url: `/.netlify/functions/image?id=${id}` }) };
  }

  return { statusCode: 405, body: "Method not allowed" };
};
