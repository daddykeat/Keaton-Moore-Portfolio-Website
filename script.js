// Mobile menu
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");

toggle?.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle?.setAttribute("aria-expanded", String(open));
});

// ✅ Optional polish: close menu when tapping/clicking outside
document.addEventListener("click", (e) => {
  if (!links || !toggle) return;
  const isOpen = links.classList.contains("open");
  if (!isOpen) return;

  const clickedInsideMenu = links.contains(e.target);
  const clickedToggle = toggle.contains(e.target);

  if (!clickedInsideMenu && !clickedToggle) {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
});

// Theme toggle (dark/light)
const themeBtn = document.querySelector(".theme-toggle");
const root = document.documentElement;

function setTheme(mode){
  if(!themeBtn) return;

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
const yearEl = document.getElementById("year");
if(yearEl) yearEl.textContent = new Date().getFullYear();

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
  links?.classList.remove("open");
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

