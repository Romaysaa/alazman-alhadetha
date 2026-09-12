document.getElementById("year").textContent = new Date().getFullYear();

const header = document.querySelector(".site-header");
const menuToggle = document.getElementById("menuToggle");

menuToggle.addEventListener("click", () => {
  const isOpen = header.classList.toggle("nav-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("nav-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});
