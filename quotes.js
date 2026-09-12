const loggedOutEl = document.getElementById("loggedOut");
const loggedInEl = document.getElementById("loggedIn");
const userEmailEl = document.getElementById("userEmail");
const quoteListEl = document.getElementById("quoteList");
const newForm = document.getElementById("newForm");
const loadErrorEl = document.getElementById("loadError");

// TEMPORARY: TEST_MODE skips the login gate entirely so the dashboard is
// usable while Netlify Identity email is being set up. Set to false (and
// restore the login-gate line at the bottom of this file) before real use.
const TEST_MODE = true;

function showLoggedIn(user) {
  loggedOutEl.hidden = true;
  loggedInEl.hidden = false;
  userEmailEl.textContent = user ? user.email : "وضع الاختبار (بدون تسجيل دخول)";
  loadQuotes();
}

function showLoggedOut() {
  loggedOutEl.hidden = false;
  loggedInEl.hidden = true;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function authFetch(url, options = {}) {
  const user = netlifyIdentity.currentUser();
  const token = user ? await user.jwt() : null;
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

function renderQuotes(list) {
  quoteListEl.innerHTML = "";
  if (!list.length) {
    quoteListEl.innerHTML = '<li class="quote-empty">لا توجد عروض بعد. اضغط "جديد" لإضافة أول عرض.</li>';
    return;
  }
  for (const q of list) {
    const li = document.createElement("li");
    li.className = "quote-item";
    li.innerHTML = `
      <div class="quote-item-top">
        <strong>${escapeHtml(q.client)}</strong>
        <span class="quote-plan">${escapeHtml(q.plan)}</span>
      </div>
      ${q.notes ? `<p>${escapeHtml(q.notes)}</p>` : ""}
      <small>${new Date(q.createdAt).toLocaleString("ar-SA")} — ${escapeHtml(q.createdBy)}</small>
    `;
    quoteListEl.appendChild(li);
  }
}

async function loadQuotes() {
  loadErrorEl.hidden = true;
  try {
    const res = await authFetch("/.netlify/functions/quotes");
    if (!res.ok) throw new Error("failed to load");
    renderQuotes(await res.json());
  } catch {
    loadErrorEl.textContent = "تعذّر تحميل العروض. هذه الميزة تعمل فقط بعد نشر الموقع على Netlify مع تفعيل Identity.";
    loadErrorEl.hidden = false;
  }
}

document.getElementById("loginBtn").addEventListener("click", () => netlifyIdentity.open("login"));
document.getElementById("logoutBtn").addEventListener("click", () => netlifyIdentity.logout());
document.getElementById("newBtn").addEventListener("click", () => {
  newForm.hidden = !newForm.hidden;
});
document.getElementById("cancelBtn").addEventListener("click", () => {
  newForm.hidden = true;
});

document.getElementById("saveBtn").addEventListener("click", async () => {
  const client = document.getElementById("fClient").value.trim();
  const plan = document.getElementById("fPlan").value;
  const notes = document.getElementById("fNotes").value.trim();

  if (!client) {
    alert("الرجاء إدخال اسم العميل");
    return;
  }

  try {
    const res = await authFetch("/.netlify/functions/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client, plan, notes }),
    });
    if (!res.ok) throw new Error("failed to save");
    document.getElementById("fClient").value = "";
    document.getElementById("fNotes").value = "";
    newForm.hidden = true;
    loadQuotes();
  } catch {
    alert("حدث خطأ أثناء حفظ العرض. تأكد من نشر الموقع على Netlify مع تفعيل Identity.");
  }
});

netlifyIdentity.on("init", (user) => (TEST_MODE || user ? showLoggedIn(user) : showLoggedOut()));
netlifyIdentity.on("login", (user) => {
  showLoggedIn(user);
  netlifyIdentity.close();
});
netlifyIdentity.on("logout", () => showLoggedOut());

netlifyIdentity.init();
