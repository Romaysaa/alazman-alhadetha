const { getStore } = require("@netlify/blobs");

exports.handler = async (event, context) => {
  const user = context.clientContext && context.clientContext.user;
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: "غير مصرح لك بالدخول" }) };
  }

  const store = getStore("quotes");

  if (event.httpMethod === "GET") {
    const list = (await store.get("list", { type: "json" })) || [];
    return { statusCode: 200, body: JSON.stringify(list) };
  }

  if (event.httpMethod === "POST") {
    let data;
    try {
      data = JSON.parse(event.body || "{}");
    } catch {
      return { statusCode: 400, body: JSON.stringify({ error: "بيانات غير صالحة" }) };
    }

    const client = (data.client || "").trim();
    const plan = (data.plan || "").trim();
    const notes = (data.notes || "").trim();

    if (!client || !plan) {
      return { statusCode: 400, body: JSON.stringify({ error: "اسم العميل والباقة مطلوبان" }) };
    }

    const list = (await store.get("list", { type: "json" })) || [];
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      client,
      plan,
      notes,
      createdBy: user.email,
      createdAt: new Date().toISOString(),
    };
    list.unshift(entry);
    await store.setJSON("list", list);

    return { statusCode: 201, body: JSON.stringify(entry) };
  }

  return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
};
