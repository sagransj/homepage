const tabs = [...document.querySelectorAll(".tab")];
const panels = [...document.querySelectorAll(".panel")];
const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".tabs");

function showTab(tabName) {
  tabs.forEach((tab) => {
    const isActive = tab.dataset.tab === tabName;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-current", isActive ? "page" : "false");
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === tabName);
  });

  nav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
  history.replaceState(null, "", `#${tabName}`);
  window.scrollTo(0, 0);
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => showTab(tab.dataset.tab));
});

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => showTab(button.dataset.go));
});

menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

const initialTab = location.hash.slice(1);
if (panels.some((panel) => panel.dataset.panel === initialTab)) {
  showTab(initialTab);
} else {
  showTab("home");
}

window.addEventListener("hashchange", () => {
  const tabName = location.hash.slice(1);
  if (panels.some((panel) => panel.dataset.panel === tabName)) {
    showTab(tabName);
  }
});
