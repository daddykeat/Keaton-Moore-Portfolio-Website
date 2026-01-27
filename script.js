// Mobile menu
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");

toggle?.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});

// Theme toggle (dark/light)
const themeBtn = document.querySelector(".theme-toggle");
const root = document.documentElement;

function setTheme(mode){
  if(mode === "light"){
    root.setAttribute("data-theme", "light");
    themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }else{
    root.removeAttribute("data-theme");
    themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
  }
  localStorage.setItem("theme", mode);
}

const saved = localStorage.getItem("theme");
if(saved) setTheme(saved);

themeBtn?.addEventListener("click", () => {
  const isLight = root.getAttribute("data-theme") === "light";
  setTheme(isLight ? "dark" : "light");
});

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Scrollspy active nav link
const sections = ["about","skills","projects","experience","contact"]
  .map(id => document.getElementById(id))
  .filter(Boolean);

const navLinks = Array.from(document.querySelectorAll(".nav-link"));

const spy = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      navLinks.forEach(a => a.classList.remove("active"));
      const active = navLinks.find(a => a.getAttribute("href") === `#${entry.target.id}`);
      active?.classList.add("active");
    }
  });
}, { rootMargin: "-40% 0px -55% 0px" });

sections.forEach(sec => spy.observe(sec));

// Reveal on scroll
const revealEls = document.querySelectorAll(".reveal");
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add("in");
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObs.observe(el));

// Close menu when clicking a link (mobile)
navLinks.forEach(a => a.addEventListener("click", () => {
  links.classList.remove("open");
  toggle?.setAttribute("aria-expanded", "false");
}));

// Subtle parallax background shift
const parallax = document.querySelector(".parallax-layer");

if (parallax && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let latestY = 0;
  let ticking = false;

  const onScroll = () => {
    latestY = window.scrollY || 0;

    if (!ticking) {
      window.requestAnimationFrame(() => {
        const move = latestY * 0.06;   // vertical drift
        const drift = latestY * 0.01;  // tiny diagonal drift
        parallax.style.transform = `translate3d(${drift}px, ${move}px, 0)`;
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// ---------------------------
// Stackable filtering + FLIP
// Category (all/design/web/motion) + Tool (photoshop/html/aftereffects/etc.)
// ---------------------------
const filterBtns = document.querySelectorAll(".filter-btn");
const projectCards = Array.from(document.querySelectorAll(".cards .card"));

let activeCategory = "all";
let activeTool = null;

// Pills
const pillCategory = document.getElementById("pillCategory");
const pillTool = document.getElementById("pillTool");
const clearAllBtn = document.querySelector(".filter-clear");

function setPill(btn, label){
  if(!btn) return;
  const text = btn.querySelector(".pill-text");
  if(!label){
    btn.hidden = true;
    if(text) text.textContent = "";
  }else{
    btn.hidden = false;
    if(text) text.textContent = label;
  }
}

function updatePills(){
  setPill(pillCategory, activeCategory === "all" ? "" : `Category: ${activeCategory}`);
  setPill(pillTool, activeTool ? `Tool: ${activeTool}` : "");

  const any = activeCategory !== "all" || !!activeTool;
  if(clearAllBtn) clearAllBtn.hidden = !any;
}

function getRects() {
  return new Map(projectCards.map(el => [el, el.getBoundingClientRect()]));
}

function animateFLIP(firstRects) {
  const lastRects = new Map(projectCards.map(el => [el, el.getBoundingClientRect()]));

  projectCards.forEach(el => {
    if(el.classList.contains("hidden")) return;

    const first = firstRects.get(el);
    const last = lastRects.get(el);
    if (!first || !last) return;

    const dx = first.left - last.left;
    const dy = first.top - last.top;

    if (dx || dy) {
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      el.style.transition = "transform 0s";
      requestAnimationFrame(() => {
        el.style.transition = "transform .35s cubic-bezier(.2,.9,.2,1)";
        el.style.transform = "";
      });
    }
  });
}

function matchesFilters(card){
  const category = (card.dataset.category || "").trim();
  const tools = (card.dataset.tools || "").split(/\s+/).filter(Boolean);

  const catOk = (activeCategory === "all") || (category === activeCategory);
  const toolOk = (!activeTool) || tools.includes(activeTool);

  return catOk && toolOk;
}

function applyFilters(){
  const firstRects = getRects();

  projectCards.forEach(card => {
    const show = matchesFilters(card);
    card.classList.toggle("hidden", !show);
  });

  requestAnimationFrame(() => animateFLIP(firstRects));
  updatePills();
}

// Category button clicks
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    activeCategory = (btn.dataset.filter || "all").trim();
    applyFilters();
  });
});

// Tool tag clicks (event delegation)
document.addEventListener("click", (e) => {
  const tag = e.target.closest(".tag-btn");
  if(!tag) return;

  const tool = (tag.dataset.tool || "").trim();
  if(!tool) return;

  // Toggle tool
  activeTool = (activeTool === tool) ? null : tool;

  // Active state styling for tags
  document.querySelectorAll(".tag-btn").forEach(t => {
    t.classList.toggle("active", activeTool && t.dataset.tool === activeTool);
  });

  applyFilters();
});

// Clicking pills clears only that filter
pillCategory?.addEventListener("click", () => {
  activeCategory = "all";
  filterBtns.forEach(b => b.classList.toggle("active", b.dataset.filter === "all"));
  applyFilters();
});

pillTool?.addEventListener("click", () => {
  activeTool = null;
  document.querySelectorAll(".tag-btn").forEach(t => t.classList.remove("active"));
  applyFilters();
});

// Clear all
clearAllBtn?.addEventListener("click", () => {
  activeCategory = "all";
  activeTool = null;

  filterBtns.forEach(b => b.classList.toggle("active", b.dataset.filter === "all"));
  document.querySelectorAll(".tag-btn").forEach(t => t.classList.remove("active"));

  applyFilters();
});

// Initialize pills on load
updatePills();
