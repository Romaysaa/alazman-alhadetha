const loggedOutEl = document.getElementById("loggedOut");
const loggedInEl = document.getElementById("loggedIn");
const userEmailEl = document.getElementById("userEmail");
const quoteListEl = document.getElementById("quoteList");
const loadErrorEl = document.getElementById("loadError");
const itemsListEl = document.getElementById("itemsList");

const fClientName = document.getElementById("fClientName");
const fClientPhone = document.getElementById("fClientPhone");
const fDelivery = document.getElementById("fDelivery");

const tSubtotal = document.getElementById("tSubtotal");
const tTax = document.getElementById("tTax");
const tTotal = document.getElementById("tTotal");

// TEMPORARY: TEST_MODE skips the login gate entirely so the dashboard is
// usable while Netlify Identity email is being set up. Set to false (and
// restore the login-gate line at the bottom of this file) before real use.
const TEST_MODE = true;

// Full product type list, confirmed from OfficeArt's real dropdown.
const ALL_CATEGORIES = [
  "مكتب", "وحدة أدراج", "وحدة عمل", "طاولة اجتماعات", "طاولة ضيافه",
  "وحدة استقبال", "كاردنزا", "ديكور", "وحدة تليفزيون", "دولاب", "كنب", "كرسي",
];
const OTHER_CATEGORY = "آخر";

// Nested field trees per category, keyed by dot-path (matching OfficeArt's
// own customSpecs model). "معدن/خشب/النظام المطور/لا يوجد" (الأرجل), "لا يوجد"
// (الملحق), and "1 لون" (السطح) are confirmed real values from the actual
// system; every other option list below is a reasonable placeholder — replace
// with the real lists once confirmed. Only "مكتب" is fully mapped so far.
const CATEGORY_FIELDS = {
  "مكتب": [
    { key: "السطح", options: ["1 لون", "خشب طبيعي", "زجاج", "لا يوجد"], children: [
        { key: "العرض", text: true },
        { key: "العمق", text: true },
        { key: "السماكه", options: ["2 سم", "3 سم", "4 سم"] },
        { key: "اللون", options: ["أبيض", "أسود", "بني", "رمادي", "بيج"] },
        { key: "فتحة الاسلاك", options: ["يوجد", "لا يوجد"] },
      ] },
    { key: "الأرجل", options: ["معدن", "خشب", "النظام المطور", "لا يوجد"], children: [
        { key: "اللون", options: ["أسود", "فضي", "أبيض", "بني"] },
        { key: "المقاس", options: ["70 سم", "72 سم", "75 سم"] },
      ] },
    { key: "الملحق", options: ["وحدة كهرباء", "وحدة كابلات", "لا يوجد"] },
    { key: "الستارة", options: ["قماش", "خشب", "لا يوجد"] },
    { key: "ادراج", options: ["لا يوجد", "درج واحد", "درجان", "ثلاثة أدراج"] },
  ],
};

let currentItems = [];
let editingId = null;

function newItem() {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    category: "",
    customType: "",
    attributes: {},
    itemNotes: "",
    qty: 1,
    unitPrice: 0,
    discountEnabled: false,
    discountAmount: 0,
    imageUrl: null,
  };
}

function effectiveType(item) {
  if (item.category === OTHER_CATEGORY) return (item.customType || "").trim();
  return item.category || "";
}

function hydrateItem(rawItem) {
  const isKnownCategory = ALL_CATEGORIES.includes(rawItem.type);
  return {
    ...rawItem,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    category: isKnownCategory ? rawItem.type : rawItem.type ? OTHER_CATEGORY : "",
    customType: isKnownCategory ? "" : rawItem.type || "",
    attributes: rawItem.attributes || {},
    itemNotes: rawItem.itemNotes || "",
  };
}

function itemTotal(item) {
  const qty = Number(item.qty) || 0;
  const unitPrice = Number(item.unitPrice) || 0;
  const discount = item.discountEnabled ? Number(item.discountAmount) || 0 : 0;
  return Math.max(0, qty * unitPrice - discount);
}

function fmt(n) {
  return (Math.round(n * 100) / 100).toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function recalcTotals() {
  const subtotal = currentItems.reduce((sum, it) => sum + itemTotal(it), 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;
  tSubtotal.textContent = fmt(subtotal);
  tTax.textContent = fmt(tax);
  tTotal.textContent = fmt(total);
}

function renderFieldTree(fields, attributes, pathPrefix, depth) {
  return fields
    .map((field) => {
      const path = pathPrefix + field.key;
      const value = attributes[path] || "";
      const useText = field.text || !field.options || field.options.length === 0;
      const control = useText
        ? `<input type="text" class="spec-input" data-field="attr:${escapeAttr(path)}" value="${escapeAttr(value)}" placeholder="أدخل ${escapeAttr(field.key)}">`
        : `<select class="spec-input" data-field="attr:${escapeAttr(path)}">
            <option value="">ابحث أو اختر...</option>
            ${field.options
              .map((opt) => `<option value="${escapeAttr(opt)}" ${value === opt ? "selected" : ""}>${escapeHtml(opt)}</option>`)
              .join("")}
          </select>`;
      const row = `<div class="spec-row" style="margin-inline-start:${depth * 20}px"><label>${escapeHtml(field.key)}:</label>${control}</div>`;
      const childrenHtml =
        field.children && value && value !== "لا يوجد"
          ? renderFieldTree(field.children, attributes, path + ".", depth + 1)
          : "";
      return row + childrenHtml;
    })
    .join("");
}

function renderItems() {
  itemsListEl.innerHTML = "";
  currentItems.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "item-row";
    row.innerHTML = `
      <div class="item-row-top">
        <span class="item-index">${index + 1}</span>
        <label class="item-type">
          نوع المنتج:
          <select data-field="category">
            <option value="">اختر نوع المنتج</option>
            ${ALL_CATEGORIES.map((cat) => `<option value="${escapeAttr(cat)}" ${item.category === cat ? "selected" : ""}>${escapeHtml(cat)}</option>`).join("")}
            <option value="${OTHER_CATEGORY}" ${item.category === OTHER_CATEGORY ? "selected" : ""}>${OTHER_CATEGORY}</option>
          </select>
        </label>
        ${
          item.category === OTHER_CATEGORY
            ? `<input type="text" data-field="customType" value="${escapeAttr(item.customType)}" placeholder="اسم المنتج" class="item-custom-type">`
            : ""
        }
      </div>
      ${
        item.category && CATEGORY_FIELDS[item.category]
          ? `<div class="item-attributes">
              ${renderFieldTree(CATEGORY_FIELDS[item.category], item.attributes, "", 0)}
              <label class="item-notes-field">ملاحظات<textarea data-field="itemNotes" rows="2" placeholder="أدخل ملاحظات">${escapeHtml(item.itemNotes)}</textarea></label>
            </div>`
          : ""
      }
      <div class="item-row-body">
        <div class="item-row-main">
          <div class="item-row-fields">
            <label>
              الكمية
              <input type="number" min="0" step="1" data-field="qty" value="${item.qty}">
            </label>
            <label>
              سعر الوحدة
              <input type="number" min="0" step="0.01" data-field="unitPrice" value="${item.unitPrice}">
            </label>
            <label class="discount-toggle">
              <input type="checkbox" data-field="discountEnabled" ${item.discountEnabled ? "checked" : ""}>
              خصم خاص على هذا البند
            </label>
            ${item.discountEnabled ? `<label>قيمة الخصم<input type="number" min="0" step="0.01" data-field="discountAmount" value="${item.discountAmount}"></label>` : ""}
            <div class="item-total">الإجمالي قبل الضريبة: <strong>${fmt(itemTotal(item))}</strong></div>
          </div>
          <div class="item-row-actions">
            <button type="button" class="btn btn-outline btn-sm" data-action="duplicate">نسخ المنتج</button>
            <button type="button" class="btn btn-outline btn-sm" data-action="delete">حذف المنتج</button>
          </div>
        </div>
        <div class="item-image-box">
          ${
            item.imageUrl
              ? `<img src="${escapeAttr(item.imageUrl)}" alt="صورة المنتج" class="item-image-preview">`
              : `<div class="item-image-placeholder">لا توجد صورة</div>`
          }
          <input type="file" accept="image/*" class="item-image-input" hidden>
          <button type="button" class="btn btn-outline btn-sm item-image-btn">+ إضافة صورة</button>
        </div>
      </div>
    `;

    row.querySelectorAll("[data-field]").forEach((el) => {
      const eventName = el.tagName === "SELECT" ? "change" : "input";
      el.addEventListener(eventName, () => {
        const field = el.dataset.field;
        if (field === "category") {
          item.category = el.value;
          if (el.value !== OTHER_CATEGORY) item.customType = "";
          item.attributes = {};
          renderItems();
          recalcTotals();
          return;
        }
        if (field === "customType") {
          item.customType = el.value;
        } else if (field === "itemNotes") {
          item.itemNotes = el.value;
        } else if (field.startsWith("attr:")) {
          item.attributes[field.slice(5)] = el.value;
          renderItems();
          recalcTotals();
          return;
        } else if (field === "discountEnabled") {
          item.discountEnabled = el.checked;
          renderItems();
          recalcTotals();
          return;
        } else {
          item[field] = Number(el.value) || 0;
        }
        const totalEl = row.querySelector(".item-total strong");
        if (totalEl) totalEl.textContent = fmt(itemTotal(item));
        recalcTotals();
      });
    });

    row.querySelector('[data-action="delete"]').addEventListener("click", () => {
      currentItems = currentItems.filter((it) => it.id !== item.id);
      renderItems();
      recalcTotals();
    });

    row.querySelector('[data-action="duplicate"]').addEventListener("click", () => {
      const copy = { ...item, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6) };
      const pos = currentItems.indexOf(item);
      currentItems.splice(pos + 1, 0, copy);
      renderItems();
      recalcTotals();
    });

    const imageInput = row.querySelector(".item-image-input");
    const imageBtn = row.querySelector(".item-image-btn");
    const imageBox = row.querySelector(".item-image-box");

    imageBtn.addEventListener("click", () => imageInput.click());
    imageInput.addEventListener("change", () => {
      const file = imageInput.files[0];
      if (file) uploadImageForItem(item, file, imageBtn);
    });

    imageBox.tabIndex = 0;
    imageBox.title = "اضغط هنا ثم الصق صورة (Ctrl+V)";
    imageBox.addEventListener("paste", (e) => {
      const items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      for (const clipItem of items) {
        if (clipItem.type.startsWith("image/")) {
          e.preventDefault();
          const file = clipItem.getAsFile();
          if (file) uploadImageForItem(item, file, imageBtn);
          break;
        }
      }
    });

    itemsListEl.appendChild(row);
  });
}

function escapeAttr(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML.replace(/"/g, "&quot;");
}

async function uploadImageForItem(item, file, imageBtn) {
  if (file.size > 2 * 1024 * 1024) {
    alert("حجم الصورة كبير جداً (الحد الأقصى 2 ميجابايت)");
    return;
  }
  const originalLabel = imageBtn.textContent;
  imageBtn.textContent = "جارِ الرفع...";
  imageBtn.disabled = true;
  try {
    const base64 = await fileToBase64(file);
    const res = await authFetch("/.netlify/functions/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: base64, contentType: file.type || "image/png" }),
    });
    if (!res.ok) throw new Error("upload failed");
    const result = await res.json();
    item.imageUrl = result.url;
    renderItems();
  } catch {
    alert("تعذّر رفع الصورة");
    imageBtn.textContent = originalLabel;
    imageBtn.disabled = false;
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function resetForm() {
  editingId = null;
  fClientName.value = "";
  fClientPhone.value = "";
  fDelivery.checked = false;
  currentItems = [newItem()];
  renderItems();
  recalcTotals();
}

document.getElementById("addItemBtn").addEventListener("click", () => {
  currentItems.push(newItem());
  renderItems();
  recalcTotals();
});

document.getElementById("newBtn").addEventListener("click", resetForm);

document.getElementById("previewBtn").addEventListener("click", () => {
  const lines = currentItems
    .map((it) => `${effectiveType(it) || "بدون اسم"} × ${it.qty} = ${fmt(itemTotal(it))} ريال`)
    .join("\n");
  alert(
    `عميل: ${fClientName.value || "-"}\nجوال: ${fClientPhone.value || "-"}\n\n${lines}\n\nالإجمالي شامل الضريبة: ${tTotal.textContent} ريال`
  );
});

async function authFetch(url, options = {}) {
  const user = window.netlifyIdentity && netlifyIdentity.currentUser();
  const token = user ? await user.jwt() : null;
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

function renderSavedQuotes(list) {
  quoteListEl.innerHTML = "";
  if (!list.length) {
    quoteListEl.innerHTML = '<li class="quote-empty">لا توجد عروض بعد.</li>';
    return;
  }
  for (const q of list) {
    const li = document.createElement("li");
    li.className = "saved-quote-item";
    li.innerHTML = `
      <div class="saved-quote-top">
        <strong>${escapeHtml(q.clientName)}</strong>
        <span class="saved-quote-total">${fmt(q.total)} ريال</span>
      </div>
      <small>${escapeHtml(q.quoteNumber)}</small>
      <div class="saved-quote-actions">
        <button type="button" class="btn btn-outline btn-sm" data-action="copy">نسخ العرض</button>
        <button type="button" class="btn btn-outline btn-sm" data-action="delete">حذف</button>
      </div>
    `;
    li.querySelector('[data-action="copy"]').addEventListener("click", () => {
      fClientName.value = q.clientName;
      fClientPhone.value = q.clientPhone || "";
      fDelivery.checked = !!q.deliveryOutsideRiyadh;
      currentItems = q.items.map(hydrateItem);
      renderItems();
      recalcTotals();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    li.querySelector('[data-action="delete"]').addEventListener("click", async () => {
      if (!confirm("هل تريد حذف هذا العرض؟")) return;
      try {
        const res = await authFetch(`/.netlify/functions/quotes?id=${encodeURIComponent(q.id)}`, { method: "DELETE" });
        if (!res.ok) throw new Error("failed");
        loadQuotes();
      } catch {
        alert("تعذّر حذف العرض");
      }
    });
    quoteListEl.appendChild(li);
  }
}

async function loadQuotes() {
  loadErrorEl.hidden = true;
  try {
    const res = await authFetch("/.netlify/functions/quotes");
    if (!res.ok) throw new Error("failed to load");
    renderSavedQuotes(await res.json());
  } catch {
    loadErrorEl.textContent = "تعذّر تحميل العروض. هذه الميزة تعمل فقط بعد نشر الموقع على Netlify مع تفعيل Identity.";
    loadErrorEl.hidden = false;
  }
}

document.getElementById("saveBtn").addEventListener("click", async () => {
  const clientName = fClientName.value.trim();
  if (!clientName) {
    alert("الرجاء إدخال اسم العميل");
    return;
  }
  if (!currentItems.length || currentItems.every((it) => !effectiveType(it).trim())) {
    alert("أضف منتجاً واحداً على الأقل");
    return;
  }

  const payloadItems = currentItems.map((it) => ({
    ...it,
    type: effectiveType(it),
  }));

  try {
    const res = await authFetch("/.netlify/functions/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName,
        clientPhone: fClientPhone.value.trim(),
        deliveryOutsideRiyadh: fDelivery.checked,
        items: payloadItems,
      }),
    });
    if (!res.ok) throw new Error("failed to save");
    resetForm();
    loadQuotes();
  } catch {
    alert("حدث خطأ أثناء حفظ العرض.");
  }
});

function showLoggedIn(user) {
  loggedOutEl.hidden = true;
  loggedInEl.hidden = false;
  userEmailEl.textContent = user ? user.email : "وضع الاختبار (بدون تسجيل دخول)";
  resetForm();
  loadQuotes();
}

function showLoggedOut() {
  loggedOutEl.hidden = false;
  loggedInEl.hidden = true;
}

document.getElementById("loginBtn").addEventListener("click", () => netlifyIdentity.open("login"));
document.getElementById("logoutBtn").addEventListener("click", () => netlifyIdentity.logout());

netlifyIdentity.on("init", (user) => (TEST_MODE || user ? showLoggedIn(user) : showLoggedOut()));
netlifyIdentity.on("login", (user) => {
  showLoggedIn(user);
  netlifyIdentity.close();
});
netlifyIdentity.on("logout", () => showLoggedOut());

netlifyIdentity.init();
