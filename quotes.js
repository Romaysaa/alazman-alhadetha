const loggedOutEl = document.getElementById("loggedOut");
const loggedInEl = document.getElementById("loggedIn");
const userEmailEl = document.getElementById("userEmail");
const quoteListEl = document.getElementById("quoteList");
const loadErrorEl = document.getElementById("loadError");
const itemsListEl = document.getElementById("itemsList");

const fClientName = document.getElementById("fClientName");
const fClientPhone = document.getElementById("fClientPhone");
const fDelivery = document.getElementById("fDelivery");
const deliveryFields = document.getElementById("deliveryFields");
const fDeliveryLocation = document.getElementById("fDeliveryLocation");
const fDeliveryCost = document.getElementById("fDeliveryCost");
const fTerms = document.getElementById("fTerms");
const fBankName = document.getElementById("fBankName");
const fBankAccountName = document.getElementById("fBankAccountName");
const fBankAccountNumber = document.getElementById("fBankAccountNumber");
const fBankIban = document.getElementById("fBankIban");
const fSalesRepName = document.getElementById("fSalesRepName");
const fSalesRepPhone = document.getElementById("fSalesRepPhone");
const fCompanyName = document.getElementById("fCompanyName");
const fCompanyCR = document.getElementById("fCompanyCR");
const fCompanyAddress = document.getElementById("fCompanyAddress");
const fCompanyRepName = document.getElementById("fCompanyRepName");
const fCompanyRepId = document.getElementById("fCompanyRepId");
const fCompanyPhone = document.getElementById("fCompanyPhone");
const fCompanyEmail = document.getElementById("fCompanyEmail");
const fClientCR = document.getElementById("fClientCR");
const fClientAddress = document.getElementById("fClientAddress");
const fClientRepName = document.getElementById("fClientRepName");
const fClientRepId = document.getElementById("fClientRepId");
const fClientEmail = document.getElementById("fClientEmail");
const fPaymentMethod = document.getElementById("fPaymentMethod");
const fWarrantyYears = document.getElementById("fWarrantyYears");
const fAdditionalClauses = document.getElementById("fAdditionalClauses");

const DEFAULT_TERMS = [
  "مدة التسليم: خلال 12 يوم عمل من تاريخ تعميد المواصفات والألوان والدفع",
  "طريقة الدفع: 100% عند التعميد",
  "مدة الضمان: ثلاث سنوات على عيوب التصنيع",
  "جاهزية الموقع مسؤولية العميل",
];

const tSubtotal = document.getElementById("tSubtotal");
const tDeliveryRow = document.getElementById("tDeliveryRow");
const tDelivery = document.getElementById("tDelivery");
const tTax = document.getElementById("tTax");
const tTotal = document.getElementById("tTotal");

fDelivery.addEventListener("change", () => {
  deliveryFields.hidden = !fDelivery.checked;
});

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

function currentDeliveryCost() {
  return fDelivery.checked ? Number(fDeliveryCost.value) || 0 : 0;
}

function recalcTotals() {
  const subtotal = currentItems.reduce((sum, it) => sum + itemTotal(it), 0);
  const deliveryCost = currentDeliveryCost();
  const taxBase = subtotal + deliveryCost;
  const tax = taxBase * 0.15;
  const total = taxBase + tax;
  tSubtotal.textContent = fmt(subtotal);
  tDeliveryRow.hidden = deliveryCost <= 0;
  tDelivery.textContent = fmt(deliveryCost);
  tTax.textContent = fmt(tax);
  tTotal.textContent = fmt(total);
}

fDeliveryCost.addEventListener("input", recalcTotals);

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
  deliveryFields.hidden = true;
  fDeliveryLocation.value = "";
  fDeliveryCost.value = "0";
  fTerms.value = "";
  fBankName.value = "";
  fBankAccountName.value = "";
  fBankAccountNumber.value = "";
  fBankIban.value = "";
  fSalesRepName.value = "";
  fSalesRepPhone.value = "";
  fCompanyName.value = "";
  fCompanyCR.value = "";
  fCompanyAddress.value = "";
  fCompanyRepName.value = "";
  fCompanyRepId.value = "";
  fCompanyPhone.value = "";
  fCompanyEmail.value = "";
  fClientCR.value = "";
  fClientAddress.value = "";
  fClientRepName.value = "";
  fClientRepId.value = "";
  fClientEmail.value = "";
  fPaymentMethod.value = "";
  fWarrantyYears.value = "";
  fAdditionalClauses.value = "";
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

function getBankRows() {
  return [
    ["اسم البنك", fBankName.value.trim()],
    ["إسم الحساب", fBankAccountName.value.trim()],
    ["رقم الحساب", fBankAccountNumber.value.trim()],
    ["رقم الآيبان", fBankIban.value.trim()],
  ].filter(([, value]) => value);
}

function bankDetailsSectionHtml() {
  const bankRows = getBankRows();
  if (!bankRows.length) return "";
  return `<div class="terms-section">
    <h3 class="section-title">تفاصيل الحساب البنكي</h3>
    <ul class="terms-list">${bankRows.map(([label, value]) => `<li>${escapeHtml(label)}: ${escapeHtml(value)}</li>`).join("")}</ul>
  </div>`;
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
  const deliveryCost = currentDeliveryCost();
  const taxBase = subtotal + deliveryCost;
  const tax = taxBase * 0.15;
  const total = taxBase + tax;

  const customTermsLines = fTerms.value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const termsLines = customTermsLines.length ? customTermsLines : DEFAULT_TERMS;

  const bankRows = getBankRows();
  const salesRepName = fSalesRepName.value.trim();
  const salesRepPhone = fSalesRepPhone.value.trim();

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
      ${
        deliveryCost > 0
          ? `<div class="summary-row"><span>قيمة التوصيل خارج الرياض${fDeliveryLocation.value.trim() ? ` (${escapeHtml(fDeliveryLocation.value.trim())})` : ""}:</span><span class="amount">${fmt(deliveryCost)} ريال</span></div>`
          : ""
      }
      <div class="summary-row"><span>ضريبة القيمة المضافة (15%):</span><span class="amount">${fmt(tax)} ريال</span></div>
      <div class="summary-row total"><span>المجموع الكلي:</span><span class="amount">${fmt(total)} ريال</span></div>
    </div>

    ${
      termsLines.length
        ? `<div class="terms-section">
            <h3 class="section-title">شروط وأحكام</h3>
            <ul class="terms-list">${termsLines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
          </div>`
        : ""
    }

    ${
      bankRows.length || salesRepName || salesRepPhone
        ? `<div class="quote-footer">
            ${
              bankRows.length
                ? `<div class="terms-section">
                    <h3 class="section-title">تفاصيل الحساب البنكي</h3>
                    <ul class="terms-list">${bankRows.map(([label, value]) => `<li>${escapeHtml(label)}: ${escapeHtml(value)}</li>`).join("")}</ul>
                  </div>`
                : ""
            }
            ${
              salesRepName || salesRepPhone
                ? `<div class="pricing-summary">
                    ${salesRepName ? `<div class="summary-row"><span>ممثل المبيعات:</span><span class="amount">${escapeHtml(salesRepName)}</span></div>` : ""}
                    ${salesRepPhone ? `<div class="summary-row"><span>الجوال:</span><span class="amount">${escapeHtml(salesRepPhone)}</span></div>` : ""}
                  </div>`
                : ""
            }
          </div>`
        : ""
    }
  `;
}

function buildDeliveryReportHtml() {
  const rows = currentItems
    .map((item, idx) => {
      const specFields = CATEGORY_FIELDS[item.category];
      const specsHtml = `
        <div class="spec-group"><span class="main-spec" style="font-size:14px;font-weight:bold;">نوع المنتج: ${escapeHtml(effectiveType(item) || "؟؟؟؟")}</span></div>
        ${specFields ? formatItemSpecsHtml(specFields, item.attributes, "") : ""}
      `;
      return `<tr>
        <td class="text-center">${idx + 1}</td>
        <td class="specs-cell">${specsHtml}</td>
        <td class="text-center">${item.qty}</td>
      </tr>`;
    })
    .join("");

  return `
    <div class="quote-pdf-header">
      <div class="pdf-header-top1">
        <div class="pdf-logo-box">
          <svg viewBox="0 0 48 48" width="40" height="40"><path d="M10 30V16a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><rect x="6" y="30" width="36" height="6" rx="2" fill="currentColor"/><path d="M9 36v4M39 36v4" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>
        </div>
        <div class="pdf-main-title">محضر تسليم — الأزمان الحديثة</div>
      </div>
      <div class="pdf-header-top2">
        <div class="pdf-client-box">
          <p class="pdf-intro-text">العميل: ${escapeHtml(fClientName.value.trim() || "-")}</p>
        </div>
        <div class="pdf-date-box">
          <span>التاريخ: </span><span>${new Date().toLocaleDateString("en-GB")}</span><br>
          <span>موقع التسليم: </span><span>${escapeHtml(fDeliveryLocation.value.trim() || "-")}</span>
        </div>
      </div>
    </div>

    <table class="products-table">
      <thead><tr><th>م</th><th>البيان</th><th>الكمية</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="3" class="text-center">لا توجد منتجات</td></tr>`}</tbody>
    </table>

    <p class="preview-note">البضاعة المذكورة أعلاه كاملة وبحالة ممتازة، وتمت مراجعتها وفحصها بدقة من قِبل العميل المستلم، وعليها جرى التوقيع.</p>
    <p class="preview-note">ملاحظات العميل: ....................................................................</p>

    <div class="quote-footer">
      <div class="pricing-summary">
        <h3 class="section-title">توقيع مستلم البضاعة (العميل)</h3>
        <div class="summary-row"><span>الاسم:</span><span class="amount">....................</span></div>
        <div class="summary-row"><span>التوقيع:</span><span class="amount">....................</span></div>
      </div>
      <div class="pricing-summary">
        <h3 class="section-title">توقيع مسؤول التركيبات</h3>
        <div class="summary-row"><span>الاسم:</span><span class="amount">....................</span></div>
        <div class="summary-row"><span>التوقيع:</span><span class="amount">....................</span></div>
      </div>
    </div>
  `;
}

function buildContractHtml() {
  const dots = "....................";
  const today = new Date().toLocaleDateString("en-GB");
  const companyName = fCompanyName.value.trim() || "الأزمان الحديثة";
  const companyCR = fCompanyCR.value.trim() || dots;
  const companyAddress = fCompanyAddress.value.trim() || dots;
  const companyRepName = fCompanyRepName.value.trim() || dots;
  const companyRepId = fCompanyRepId.value.trim() || dots;
  const companyPhone = fCompanyPhone.value.trim() || dots;
  const companyEmail = fCompanyEmail.value.trim() || dots;

  const clientName = fClientName.value.trim() || dots;
  const clientPhone = fClientPhone.value.trim() || dots;
  const clientCR = fClientCR.value.trim() || dots;
  const clientAddress = fClientAddress.value.trim() || fDeliveryLocation.value.trim() || dots;
  const clientRepName = fClientRepName.value.trim() || clientName;
  const clientRepId = fClientRepId.value.trim() || dots;
  const clientEmail = fClientEmail.value.trim() || dots;

  const location = fDeliveryLocation.value.trim() || "الرياض";
  const paymentMethod = fPaymentMethod.value.trim() || "100% عند التعميد";
  const warrantyYears = fWarrantyYears.value.trim() || "3";

  const subtotal = currentItems.reduce((sum, it) => sum + itemTotal(it), 0);
  const deliveryCost = currentDeliveryCost();
  const taxBase = subtotal + deliveryCost;
  const tax = taxBase * 0.15;
  const total = taxBase + tax;

  const additionalClauses = fAdditionalClauses.value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map(
      (clause, idx) => `
        <div class="aqd-clause">
          <div class="aqd-clause-title">بند إضافي ${idx + 1}</div>
          <div class="aqd-clause-content">${escapeHtml(clause)}</div>
        </div>`
    )
    .join("");

  return `
    <div class="quote-pdf-header">
      <div class="pdf-header-top1">
        <div class="pdf-logo-box">
          <svg viewBox="0 0 48 48" width="40" height="40"><path d="M10 30V16a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><rect x="6" y="30" width="36" height="6" rx="2" fill="currentColor"/><path d="M9 36v4M39 36v4" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>
        </div>
        <div class="pdf-main-title">عقد اتفاق</div>
      </div>
      <p style="margin-bottom:16px;"><strong>تاريخ العقد:</strong> ${today}</p>
    </div>

    <div class="pdf-header-top2" style="align-items:stretch;">
      <div class="pdf-highlight-box" style="flex:1;">
        <h3 class="pdf-client-name" style="font-size:1rem;">الطرف الأول</h3>
        <p class="pdf-intro-text">${escapeHtml(companyName)}<br>سجل تجاري: ${escapeHtml(companyCR)}<br>العنوان: ${escapeHtml(companyAddress)}<br>ممثل العقد: ${escapeHtml(companyRepName)}<br>هوية: ${escapeHtml(companyRepId)}</p>
      </div>
      <div class="pdf-highlight-box" style="flex:1;">
        <h3 class="pdf-client-name" style="font-size:1rem;">الطرف الثاني</h3>
        <p class="pdf-intro-text">${escapeHtml(clientName)}<br>سجل تجاري: ${escapeHtml(clientCR)}<br>المقر: ${escapeHtml(clientAddress)}<br>ممثل العقد: ${escapeHtml(clientRepName)}<br>هوية: ${escapeHtml(clientRepId)}</p>
      </div>
    </div>

    <div class="aqd-clause"><div class="aqd-clause-title">تمهيد</div><div class="aqd-clause-content">حيث أن الطرف الأول يعمل في مجال تصميم وتوريد وتركيب الأثاث المكتبي، فقد رغب الطرف الثاني بالحصول على خدمات ومنتجات الطرف الأول حسب ما سيتم إيضاحه في بنود هذا العقد، وبناءً عليه فقد اتفق الطرفان وهما بكامل أهليتهما الشرعية المعتبرة على الآتي:</div></div>
    <div class="aqd-clause"><div class="aqd-clause-title">أولاً</div><div class="aqd-clause-content">يعتبر التمهيد السابق جزءاً لا يتجزأ من هذا العقد.</div></div>
    <div class="aqd-clause"><div class="aqd-clause-title">ثانياً: نطاق العمل</div><div class="aqd-clause-content">يلتزم الطرف الأول بتصنيع وتوريد وتركيب <strong>${currentItems.length}</strong> بنود من الأثاث المكتبي المحددة في عرض السعر الخاص بهذا العقد، ويتم التركيب في مدينة <strong>${escapeHtml(location)}</strong>.</div></div>
    <div class="aqd-clause"><div class="aqd-clause-title">ثالثاً: مدة التوريد</div><div class="aqd-clause-content">خلال المدة المتفق عليها من تاريخ العقد واعتماد المواصفات والألوان واستلام الدفعة المقدمة.</div></div>
    <div class="aqd-clause"><div class="aqd-clause-title">رابعاً: التسليم والتركيب</div><div class="aqd-clause-content">يقوم الطرف الأول بتركيب الأثاث في موقع العميل بمدينة ${escapeHtml(location)}، وعلى الطرف الثاني استلام البضاعة والتوقيع على سند الاستلام فور الانتهاء من التركيب.</div></div>
    <div class="aqd-clause"><div class="aqd-clause-title">خامساً: طريقة السداد</div><div class="aqd-clause-content">
      <p>إجمالي قيمة العقد: <strong>${fmt(total)} ريال</strong>، شامل ضريبة القيمة المضافة، وشامل قيمة التركيب داخل مدينة ${escapeHtml(location)}.</p>
      <p>وتكون طريقة السداد: ${escapeHtml(paymentMethod)}.</p>
      ${getBankRows().length ? `<p>يتم تحويل الدفعات إلى الحساب البنكي التالي:</p>${bankDetailsSectionHtml()}` : ""}
    </div></div>
    <div class="aqd-clause"><div class="aqd-clause-title">سادساً: الضمان</div><div class="aqd-clause-content">يضمن الطرف الأول الأثاث ضد عيوب الصناعة لمدة <strong>${escapeHtml(warrantyYears)}</strong> سنوات من تاريخ التسليم، باستثناء سوء الاستخدام.</div></div>
    <div class="aqd-clause"><div class="aqd-clause-title">سابعاً: التأخير</div><div class="aqd-clause-content">في حال تأخر الطرف الأول عن المدة المتفق عليها، يحق للطرف الثاني خصم 1% من قيمة العقد عن كل أسبوع تأخير بحد أقصى 10%.</div></div>
    <div class="aqd-clause"><div class="aqd-clause-title">ثامناً: حل النزاعات</div><div class="aqd-clause-content">يتم حل أي خلاف بالتراضي، فإن تعذر فالتحكيم وفق نظام التحكيم السعودي، ثم المحاكم المختصة.</div></div>
    <div class="aqd-clause"><div class="aqd-clause-title">تاسعاً: نسخ العقد</div><div class="aqd-clause-content">تحرر العقد من نسختين أصليتين، بيد كل طرف نسخة.</div></div>
    ${additionalClauses}

    <div class="quote-footer">
      <div class="pricing-summary">
        <h3 class="section-title">الطرف الأول: ${escapeHtml(companyName)}</h3>
        <div class="summary-row"><span>رقم التواصل:</span><span class="amount">${escapeHtml(companyPhone)}</span></div>
        <div class="summary-row"><span>البريد:</span><span class="amount">${escapeHtml(companyEmail)}</span></div>
        <div class="summary-row"><span>التوقيع:</span><span class="amount">${dots}</span></div>
      </div>
      <div class="pricing-summary">
        <h3 class="section-title">الطرف الثاني: ${escapeHtml(clientName)}</h3>
        <div class="summary-row"><span>رقم التواصل:</span><span class="amount">${escapeHtml(clientPhone)}</span></div>
        <div class="summary-row"><span>البريد:</span><span class="amount">${escapeHtml(clientEmail)}</span></div>
        <div class="summary-row"><span>التوقيع:</span><span class="amount">${dots}</span></div>
      </div>
    </div>
  `;
}

function openPreview(html) {
  document.getElementById("previewDoc").innerHTML = html;
  document.getElementById("previewOverlay").hidden = false;
}

document.getElementById("previewBtn").addEventListener("click", () => openPreview(buildPreviewHtml()));
document.getElementById("contractBtn").addEventListener("click", () => {
  if (!fClientName.value.trim()) {
    alert("الرجاء إدخال اسم العميل قبل إنشاء العقد");
    return;
  }
  openPreview(buildContractHtml());
});
document.getElementById("deliveryReportBtn").addEventListener("click", () => {
  if (!fClientName.value.trim()) {
    alert("الرجاء إدخال اسم العميل قبل إنشاء محضر التسليم");
    return;
  }
  openPreview(buildDeliveryReportHtml());
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
      deliveryFields.hidden = !fDelivery.checked;
      fDeliveryLocation.value = q.deliveryLocation || "";
      fDeliveryCost.value = q.deliveryCost || 0;
      fTerms.value = q.terms || "";
      fBankName.value = (q.bankDetails && q.bankDetails.bankName) || "";
      fBankAccountName.value = (q.bankDetails && q.bankDetails.accountName) || "";
      fBankAccountNumber.value = (q.bankDetails && q.bankDetails.accountNumber) || "";
      fBankIban.value = (q.bankDetails && q.bankDetails.iban) || "";
      fSalesRepName.value = (q.salesRep && q.salesRep.name) || "";
      fSalesRepPhone.value = (q.salesRep && q.salesRep.phone) || "";
      const cd = q.contractDetails || {};
      fCompanyName.value = cd.companyName || "";
      fCompanyCR.value = cd.companyCR || "";
      fCompanyAddress.value = cd.companyAddress || "";
      fCompanyRepName.value = cd.companyRepName || "";
      fCompanyRepId.value = cd.companyRepId || "";
      fCompanyPhone.value = cd.companyPhone || "";
      fCompanyEmail.value = cd.companyEmail || "";
      fClientCR.value = cd.clientCR || "";
      fClientAddress.value = cd.clientAddress || "";
      fClientRepName.value = cd.clientRepName || "";
      fClientRepId.value = cd.clientRepId || "";
      fClientEmail.value = cd.clientEmail || "";
      fPaymentMethod.value = cd.paymentMethod || "";
      fWarrantyYears.value = cd.warrantyYears || "";
      fAdditionalClauses.value = cd.additionalClauses || "";
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
        deliveryLocation: fDelivery.checked ? fDeliveryLocation.value.trim() : "",
        deliveryCost: currentDeliveryCost(),
        terms: fTerms.value.trim(),
        bankDetails: {
          bankName: fBankName.value.trim(),
          accountName: fBankAccountName.value.trim(),
          accountNumber: fBankAccountNumber.value.trim(),
          iban: fBankIban.value.trim(),
        },
        salesRep: {
          name: fSalesRepName.value.trim(),
          phone: fSalesRepPhone.value.trim(),
        },
        contractDetails: {
          companyName: fCompanyName.value.trim(),
          companyCR: fCompanyCR.value.trim(),
          companyAddress: fCompanyAddress.value.trim(),
          companyRepName: fCompanyRepName.value.trim(),
          companyRepId: fCompanyRepId.value.trim(),
          companyPhone: fCompanyPhone.value.trim(),
          companyEmail: fCompanyEmail.value.trim(),
          clientCR: fClientCR.value.trim(),
          clientAddress: fClientAddress.value.trim(),
          clientRepName: fClientRepName.value.trim(),
          clientRepId: fClientRepId.value.trim(),
          clientEmail: fClientEmail.value.trim(),
          paymentMethod: fPaymentMethod.value.trim(),
          warrantyYears: fWarrantyYears.value.trim(),
          additionalClauses: fAdditionalClauses.value.trim(),
        },
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
