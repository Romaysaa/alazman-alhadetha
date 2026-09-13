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

// Shared laminate/veneer color catalog (143 real supplier codes, confirmed
// from the live OfficeArt bundle). NOTE: these are OfficeArt's own supplier
// codes — الأزمان الحديثة will want to swap this for its real suppliers' codes.
const LAMINATE_COLORS = ["آخر","Art_125","Art_126","Art_140","Art_178","Art_191","Art_197","Art_210","Art_212","Art_213","Art_219","Art_223","Art_226","Art_228","Art_279","Art_300","Art_301","Art_302","Art_303","Art_305","Art_306","Art_308","Art_309","Art_312","Art_317","Art_319","Art_324","Art_327","Art_401","Art_416","Art_417","Art_440","Art_455","Art_466","Art_477","Art_515","Art_551","Art_552","Art_553","Art_554","Art_556","Art_557","Art_558","Art_559","Art_562","Art_564","Art_625","Art_653","Art_660","Art_690","Art_693","Art_710","Art_715","Art_720","Art_725","Art_730","Art_735","Art_740","Art_750","Art_775","Art_790","Art_795","Art_797","Art_799","Art_821","Art_833","Art_837","Art_835","Art_840","Art_874","Art_876","Art_904","Art_910","Art_911","Art_916","Art_922","Art_1600 Pluse","Art_1601 Pluse","Art_1602 Pluse","Art_1603 Pluse","Art_1604 Pluse","Art_1605 Pluse","Art_1606 Pluse","Art_1607 Pluse","Art_1608 Pluse","Art_1609 Pluse","Art_1610 Pluse","Art_1611 Pluse","Art_1612 Pluse","Art_1613 Pluse","Art_1614 Pluse","Art_1615 Pluse","Art_1616 Pluse","Art_1617 Pluse","Art_1618 Pluse","Art_1619 Pluse","MPT_0006","MPT_0202","MPT_1101","MPT_1112","MPT_1115","MPT_1230","MPT_1236","MPT_1239","MPT_1240","MPT_2003","MPT_2131","MPT_2277","MPT_2344","MPT_2359","MPT_2407","MPT_2416","MPT_2417","MPT_2575","MPT_2615","MPT_2729","MPT_3011","MPT_3030","MPT_3622","MPT_3624","MPT_3910","MPT_4104","MPT_4131","MPT_4132","MPT_4133","MPT_4503","MPT_4900","MPT_5013","MPT_5023","MPT_5039","MPT_5400","MPT_5412","MPT_5700","MPT_5701","MPT_5800","MPT_6057","MPT_7500","MPT_8393","MPT_8538","MPT_9027","MPT_9103","MPT_9301","MPT_9512"];
function colorField(key) {
  return { key, options: LAMINATE_COLORS };
}

const OPEN_METHOD_OPTIONS = ["ضغط", "جروف", "مسكه اسود", "مسكه سيلفر"];
const LOCK_OPTIONS = ["نعم", "لا"];
const GROMMET_OPTIONS = ["اسود دائريه", "سيلفر دائريه", "ابيض دائريه", "اسود مربعه 8*8", "اسود مستطيله 16*8", "اسود مستطيله 28*8", "سيلفر مربعه 8*8", "سيلفر مستطيله 16*8", "سيلفر مستطيله 28*8", "ابيض مربعه 8*8", "ابيض مستطيله 16*8", "ابيض مستطيله 28*8"];
const METAL_LEG_COLORS = ["ابيض 9003", "اسود 9005", "1013 بيج", "7040 رصاصي فاتح", "7043 رصاصي غامق"];
const LEG_SIZES = ["3*3", "4*4", "3*6", "5*5"];
const DEVELOPED_LEG_COLORS = ["ابيض", "اسود", "رصاصي فاتح", "رصاصي غامق"];
const THICKNESS_OPTIONS = ["25", "34", "36", "50"];

function legsField() {
  return {
    key: "الأرجل",
    options: ["معدن", "خشب", "النظام المطور", "لا يوجد"],
    optionChildren: {
      "معدن": [{ key: "اللون", options: METAL_LEG_COLORS }, { key: "المقاس", options: LEG_SIZES }],
      "خشب": [colorField("اللون")],
      "النظام المطور": [{ key: "اللون", options: DEVELOPED_LEG_COLORS }],
    },
  };
}

function drawersField() {
  return {
    key: "ادراج",
    options: ["ثابته", "متحركه", "لا يوجد"],
    children: [{ key: "طريقة الفتح", options: OPEN_METHOD_OPTIONS }, { key: "قفل", options: LOCK_OPTIONS }],
  };
}

// Full product type list and their nested field trees — confirmed from the
// live OfficeArt JS bundle (fetched directly from its public assets). Field
// names, option values and nesting are exact; per-option price add-ons and
// the surface-area pricing formulas that exist in the real system are NOT
// replicated here (too easy to get subtly wrong) — adjust "سعر الوحدة"
// manually to account for premium options for now.
const CATEGORY_FIELDS = {
  "مكتب": [
    { key: "السطح", options: ["1 لون", "2 لون", "لا يوجد"], optionChildren: {
        "1 لون": [{ key: "العرض", text: true }, { key: "العمق", text: true }, { key: "السماكه", options: THICKNESS_OPTIONS }, colorField("اللون"), { key: "فتحة الاسلاك", options: GROMMET_OPTIONS }],
        "2 لون": [{ key: "العرض", text: true }, { key: "العمق", text: true }, { key: "السماكه", options: THICKNESS_OPTIONS }, colorField("لون 1"), colorField("لون 2"), { key: "فتحة الاسلاك", options: GROMMET_OPTIONS }],
      } },
    legsField(),
    { key: "الملحق", options: ["صغير", "كبير", "لا يوجد"], optionChildren: {
        "صغير": [{ key: "الطول", text: true }, { key: "العمق", text: true }, { key: "الاتجاه", options: ["يمين", "يسار"] }, colorField("اللون")],
        "كبير": [{ key: "الطول", text: true }, { key: "العمق", text: true }, { key: "الاتجاه", options: ["يمين", "يسار"] }, colorField("لون الجسم"), colorField("لون الابواب"), { key: "ابواب", options: ["سحاب خشب", "سحاب زجاج", "مفصلي"] }, { key: "طريقة الفتح", options: OPEN_METHOD_OPTIONS }],
      } },
    { key: "الستارة", options: ["خشب ساده", "خشب موديل", "لا يوجد"], optionChildren: {
        "خشب ساده": [{ key: "الحجم", options: ["صغيره", "كامله"] }, colorField("اللون")],
        "خشب موديل": [colorField("لون 1"), colorField("لون 2"), { key: "كامل", options: ["بدون اضاءه", "باضاءه"] }],
      } },
    drawersField(),
  ],
  "وحدة أدراج": [
    { key: "النوع", options: ["ثابته", "متحركه"] },
    { key: "طريقة الفتح", options: OPEN_METHOD_OPTIONS },
    colorField("لون الجسم"),
    colorField("لون الاوجه"),
    { key: "قفل", options: LOCK_OPTIONS },
  ],
  "وحدة عمل": [
    { key: "السطح", options: ["1 لون", "2 لون", "لا يوجد"], optionChildren: {
        "1 لون": [{ key: "الشكل", options: ["مستطيل", "شكل Y", "شكل ✚", "اخري"] }, { key: "العرض", text: true }, { key: "العمق", text: true }, { key: "السماكه", options: THICKNESS_OPTIONS }, colorField("اللون"), { key: "فتحة الاسلاك", options: GROMMET_OPTIONS }],
        "2 لون": [{ key: "الشكل", options: ["مستطيل", "شكل Y", "شكل ✚", "اخري"] }, { key: "العرض", text: true }, { key: "العمق", text: true }, { key: "السماكه", options: THICKNESS_OPTIONS }, colorField("لون 1"), colorField("لون 2"), { key: "فتحة الاسلاك", options: GROMMET_OPTIONS }],
      } },
    legsField(),
    { key: "الحاجز", options: ["خشب", "قماش", "زجاج", "زجاج مع لوجو", "لا يوجد"], children: [{ key: "الأرتفاع", text: true }] },
    drawersField(),
  ],
  "طاولة اجتماعات": [
    { key: "السطح", options: ["1 لون", "2 لون", "لا يوجد"], optionChildren: {
        "1 لون": [{ key: "الشكل", options: ["مستطيل", "دائريه", "شكل U", "اخري"] }, { key: "العرض", text: true }, { key: "العمق", text: true }, { key: "السماكه", options: THICKNESS_OPTIONS }, colorField("اللون"), { key: "فتحة الاسلاك", options: GROMMET_OPTIONS }],
        "2 لون": [{ key: "الشكل", options: ["مستطيل", "شكل Y", "شكل ✚", "اخري"] }, { key: "العرض", text: true }, { key: "العمق", text: true }, { key: "السماكه", options: THICKNESS_OPTIONS }, colorField("لون 1"), colorField("لون 2"), { key: "فتحة الاسلاك", options: GROMMET_OPTIONS }],
      } },
    legsField(),
  ],
  "طاولة ضيافه": [
    { key: "السطح", options: ["1 لون", "2 لون", "لا يوجد"], optionChildren: {
        "1 لون": [{ key: "العرض", text: true }, { key: "العمق", text: true }, { key: "السماكه", options: THICKNESS_OPTIONS }, colorField("اللون")],
        "2 لون": [{ key: "العرض", text: true }, { key: "العمق", text: true }, { key: "السماكه", options: THICKNESS_OPTIONS }, colorField("لون 1"), colorField("لون 2")],
      } },
    legsField(),
  ],
  "وحدة استقبال": [
    { key: "السطح", options: ["1 لون", "2 لون", "لا يوجد"], optionChildren: {
        "1 لون": [{ key: "العرض", text: true }, { key: "العمق", text: true }, { key: "الارتفاع", text: true }, { key: "السماكه", options: THICKNESS_OPTIONS }, colorField("اللون")],
        "2 لون": [{ key: "العرض", text: true }, { key: "العمق", text: true }, { key: "الارتفاع", text: true }, { key: "السماكه", options: THICKNESS_OPTIONS }, colorField("لون 1"), colorField("لون 2")],
      } },
    drawersField(),
    { key: "اضاءه", options: LOCK_OPTIONS },
  ],
  "كاردنزا": [{ key: "المواصفات", text: true }],
  "ديكور": [{ key: "المواصفات", text: true }],
  "وحدة تليفزيون": [{ key: "المواصفات", text: true }],
  "دولاب": [{ key: "المواصفات", text: true }],
  "كنب": [{ key: "المواصفات", text: true }],
  "كرسي": [{ key: "كود الكرسي", text: true }, { key: "المواصفات", text: true }],
  "آخر": [{ key: "اسم المنتج", text: true }, { key: "المواصفات", text: true }],
};

const ALL_CATEGORIES = Object.keys(CATEGORY_FIELDS);

let currentItems = [];
let editingId = null;

function newItem() {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    category: "",
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
  return item.category || "";
}

function hydrateItem(rawItem) {
  return {
    ...rawItem,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    category: rawItem.type || "",
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
      const childFields = (field.optionChildren && field.optionChildren[value]) || field.children;
      const childrenHtml =
        childFields && value && value !== "لا يوجد"
          ? renderFieldTree(childFields, attributes, path + ".", depth + 1)
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
          </select>
        </label>
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
          item.attributes = {};
          renderItems();
          recalcTotals();
          return;
        }
        if (field === "itemNotes") {
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

function formatItemSpecsHtml(fields, attributes, pathPrefix) {
  return fields
    .map((field) => {
      const path = pathPrefix + field.key;
      const raw = attributes[path];
      if (!raw || String(raw).trim() === "" || raw === "لا يوجد") return "";
      const parts = [`<span class="main-spec"><strong>${escapeHtml(field.key)}:</strong> ${escapeHtml(raw)}</span>`];
      const childFields = (field.optionChildren && field.optionChildren[raw]) || field.children;
      if (childFields) {
        childFields.forEach((child) => {
          const childVal = attributes[path + "." + child.key];
          if (childVal && String(childVal).trim() !== "" && childVal !== "لا يوجد") {
            parts.push(`<span class="sub-spec">${escapeHtml(child.key)}: ${escapeHtml(childVal)}</span>`);
          }
        });
      }
      return `<div class="spec-group">${parts.join(" ، ")}</div>`;
    })
    .join("");
}

function buildPreviewHtml() {
  const rows = currentItems
    .map((item, idx) => {
      const specFields = CATEGORY_FIELDS[item.category];
      const specsHtml = `
        <div class="spec-group"><span class="main-spec" style="font-size:16px;font-weight:bold;">نوع المنتج: ${escapeHtml(effectiveType(item) || "؟؟؟؟")}</span></div>
        ${specFields ? formatItemSpecsHtml(specFields, item.attributes, "") : ""}
        ${item.itemNotes ? `<div class="spec-group"><span class="main-spec">ملاحظات: ${escapeHtml(item.itemNotes)}</span></div>` : ""}
      `;
      const total = itemTotal(item);
      return `<tr>
        <td class="text-center">${idx + 1}</td>
        <td class="specs-cell">${specsHtml}</td>
        <td class="text-center">${item.qty}</td>
        <td class="text-center">${fmt(item.unitPrice)}</td>
        <td class="text-center">${fmt(total)}</td>
        <td class="text-center">${item.imageUrl ? `<img src="${escapeAttr(item.imageUrl)}" alt="" class="product-thumbnail">` : ""}</td>
      </tr>`;
    })
    .join("");

  const subtotal = currentItems.reduce((sum, it) => sum + itemTotal(it), 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  return `
    <div class="quote-pdf-header">
      <div class="pdf-header-top1">
        <div class="pdf-logo-box">
          <svg viewBox="0 0 48 48" width="40" height="40"><path d="M10 30V16a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><rect x="6" y="30" width="36" height="6" rx="2" fill="currentColor"/><path d="M9 36v4M39 36v4" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>
        </div>
        <div class="pdf-main-title">عرض سعر — الأزمان الحديثة</div>
      </div>
      <div class="pdf-header-top2">
        <div class="pdf-client-box">
          <div class="pdf-highlight-box"><h3 class="pdf-client-name">عناية السادة / ${escapeHtml(fClientName.value.trim() || "-")}</h3></div>
          <p class="pdf-intro-text">يسرنا أن نقدم لكم عرضنا الفني والمالي الآتي:</p>
        </div>
        <div class="pdf-date-box">
          <span>تاريخ العرض: </span><span>${new Date().toLocaleDateString("en-GB")}</span><br>
          <span>انتهاء العرض: </span><span>${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB")}</span>
        </div>
      </div>
    </div>

    <table class="products-table">
      <thead>
        <tr><th>م</th><th>المواصفات الفنية</th><th>الكمية</th><th>السعر</th><th>المجموع</th><th>صورة</th></tr>
      </thead>
      <tbody>${rows || `<tr><td colspan="6" class="text-center">لا توجد منتجات</td></tr>`}</tbody>
    </table>

    <div class="pricing-summary">
      <div class="summary-row"><span>المجموع:</span><span class="amount">${fmt(subtotal)} ريال</span></div>
      <div class="summary-row"><span>ضريبة القيمة المضافة (15%):</span><span class="amount">${fmt(tax)} ريال</span></div>
      <div class="summary-row total"><span>المجموع الكلي:</span><span class="amount">${fmt(total)} ريال</span></div>
    </div>
    ${fDelivery.checked ? `<p class="preview-note">* يشمل توصيل خارج الرياض (تُحدَّد تكلفة التوصيل بشكل منفصل)</p>` : ""}
  `;
}

document.getElementById("previewBtn").addEventListener("click", () => {
  document.getElementById("previewDoc").innerHTML = buildPreviewHtml();
  document.getElementById("previewOverlay").hidden = false;
});
document.getElementById("previewCloseBtn").addEventListener("click", () => {
  document.getElementById("previewOverlay").hidden = true;
});
document.getElementById("previewPrintBtn").addEventListener("click", () => window.print());

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
