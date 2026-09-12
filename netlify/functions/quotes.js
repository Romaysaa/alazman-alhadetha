const { getStore } = require("@netlify/blobs");

const SITE_ID = "d837d865-dfee-4e23-a4d2-2a0dd4cddbce";

function getStoreSafe(name) {
  const token = process.env.BLOBS_TOKEN;
  if (token) {
    return getStore({ name, siteID: SITE_ID, token });
  }
  return getStore(name);
}

async function nextQuoteNumber(store) {
  const current = (await store.get("counter", { type: "text" })) || "0";
  const next = parseInt(current, 10) + 1;
  await store.set("counter", String(next));
  return "Q-" + String(next).padStart(4, "0");
}

function computeItemTotal(item) {
  const qty = Number(item.qty) || 0;
  const unitPrice = Number(item.unitPrice) || 0;
  const discount = item.discountEnabled ? Number(item.discountAmount) || 0 : 0;
  return Math.max(0, qty * unitPrice - discount);
}

// TEMPORARY: login requirement disabled for testing. Re-enable the block below
// (require an authenticated Identity user) before real staff data goes in here.
exports.handler = async (event, context) => {
  const user = context.clientContext && context.clientContext.user;
  // if (!user) {
  //   return { statusCode: 401, body: JSON.stringify({ error: "غير مصرح لك بالدخول" }) };
  // }

  const store = getStoreSafe("quotes");

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

    const clientName = (data.clientName || "").trim();
    const clientPhone = (data.clientPhone || "").trim();
    const deliveryOutsideRiyadh = !!data.deliveryOutsideRiyadh;
    const items = Array.isArray(data.items) ? data.items : [];

    if (!clientName) {
      return { statusCode: 400, body: JSON.stringify({ error: "اسم العميل مطلوب" }) };
    }
    if (!items.length) {
      return { statusCode: 400, body: JSON.stringify({ error: "أضف منتجاً واحداً على الأقل" }) };
    }

    const cleanItems = items.map((it) => {
      const total = computeItemTotal(it);
      return {
        id: it.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        type: (it.type || "").trim(),
        qty: Number(it.qty) || 0,
        unitPrice: Number(it.unitPrice) || 0,
        discountEnabled: !!it.discountEnabled,
        discountAmount: Number(it.discountAmount) || 0,
        imageUrl: it.imageUrl || null,
        attributes: it.attributes && typeof it.attributes === "object" ? it.attributes : {},
        itemNotes: (it.itemNotes || "").trim(),
        total,
      };
    });

    const subtotal = cleanItems.reduce((sum, it) => sum + it.total, 0);
    const tax = Math.round(subtotal * 0.15 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    const quoteNumber = await nextQuoteNumber(store);
    const list = (await store.get("list", { type: "json" })) || [];
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      quoteNumber,
      clientName,
      clientPhone,
      deliveryOutsideRiyadh,
      items: cleanItems,
      subtotal,
      tax,
      total,
      createdBy: user ? user.email : "زائر (وضع الاختبار)",
      createdAt: new Date().toISOString(),
    };
    list.unshift(entry);
    await store.setJSON("list", list);

    return { statusCode: 201, body: JSON.stringify(entry) };
  }

  if (event.httpMethod === "DELETE") {
    const id = event.queryStringParameters && event.queryStringParameters.id;
    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: "المعرف مطلوب" }) };
    }
    const list = (await store.get("list", { type: "json" })) || [];
    const filtered = list.filter((q) => q.id !== id);
    await store.setJSON("list", filtered);
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
};
