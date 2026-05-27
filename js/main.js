/**
 * main.js
 * - Loads modular HTML partials from ./components into index.html placeholders
 * - Smooth in-page navigation (works with fixed navbar + scroll-padding)
 * - Active navbar highlighting via IntersectionObserver
 * - Contact form: Bootstrap-friendly validation + demo submit handling (no backend)
 */

(function () {
  "use strict";

  const COMPONENT_BASE = "./components/";

  /** @type {{ selector: string, file: string }[]} */
  const LOAD_ORDER = [
    { selector: "#site-navbar", file: "navbar.html" },
    { selector: "#site-hero", file: "hero.html" },
    { selector: "#site-about", file: "about.html" },
    { selector: "#site-projects", file: "projects.html" },
    { selector: "#site-skills", file: "skills.html" },
    { selector: "#site-contact", file: "contact.html" },
  ];

  /**
   * Fetch an HTML partial and inject it into a container.
   * @param {string} targetSelector
   * @param {string} fileName
   */
  async function loadComponent(targetSelector, fileName) {
    const el = document.querySelector(targetSelector);
    if (!el) {
      console.warn(`[portfolio] Missing container: ${targetSelector}`);
      return;
    }

    const url = `${COMPONENT_BASE}${fileName}`;
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      el.innerHTML = await res.text();
    } catch (err) {
      console.error(`[portfolio] Failed to load ${url}`, err);
      el.innerHTML = `
        <div class="container py-4">
          <div class="alert alert-danger border-0 rounded-4" role="alert">
            <strong>Could not load UI partial:</strong> <span class="font-mono">${fileName}</span>.
            <div class="small mt-2 opacity-75">
              If you opened <span class="font-mono">index.html</span> via <span class="font-mono">file://</span>,
              use a static local server (e.g. Live Server) so <span class="font-mono">fetch()</span> works.
            </div>
          </div>
        </div>
      `;
    }
  }

  function setActiveNav(sectionId) {
    const links = document.querySelectorAll('.nav-pill[data-nav-target]');
    for (const a of links) {
      const target = a.getAttribute("data-nav-target");
      a.classList.toggle("active", target === sectionId);
    }
  }

  function initActiveNav() {
    const sectionIds = ["hero", "about", "projects", "skills", "contact"];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
        if (!visible?.target?.id) return;
        setActiveNav(visible.target.id);
      },
      { root: null, threshold: [0.18, 0.28, 0.45], rootMargin: "-5.25rem 0px -58% 0px" }
    );

    for (const s of sections) io.observe(s);
    setActiveNav("hero");
  }

  /**
   * Intercept same-page navigation clicks for predictable behavior across browsers.
   */
  function initSmoothAnchors() {
    document.addEventListener(
      "click",
      (e) => {
        const target = e.target;
        if (!(target instanceof Element)) return;
        const a = target.closest?.("a[href^='#']");
        if (!a) return;
        const href = a.getAttribute("href");
        if (!href || href === "#") return;

        const id = href.slice(1);
        const dest = document.getElementById(id);
        if (!dest) return;

        // Let the browser handle modified clicks / new tabs.
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        e.preventDefault();
        const navHeight = parseFloat(getComputedStyle(document.documentElement)
          .getPropertyValue("--nav-height")) || 0;

        const offset = navHeight + 32; // 2rem ≈ 32px

        const top = dest.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
          top,
          behavior: "smooth"
        });

        // Close Bootstrap collapse on mobile after navigation
        const nav = document.getElementById("primaryNav");
        if (nav?.classList.contains("show") && globalThis.bootstrap?.Collapse) {
          const c = globalThis.bootstrap.Collapse.getOrCreateInstance(nav, { toggle: false });
          c.hide();
        }
      },
      { capture: true }
    );
  }

  function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!(form instanceof HTMLFormElement)) return;

    const status = document.getElementById("contact-form-status");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      form.classList.add("was-validated");
      if (!form.checkValidity()) return;

      if (status) {
        status.textContent = "Thanks — this is a demo form (no data was sent).";
        status.classList.remove("d-none");
      }

      // Demo-only: reset after short delay (remove if wiring to a backend)
      form.reset();
      form.classList.remove("was-validated");
    });
  }

  async function boot() {
    for (const item of LOAD_ORDER) {
      await loadComponent(item.selector, item.file);
    }

    document.dispatchEvent(new CustomEvent("portfolio:components-loaded"));

    initSmoothAnchors();
    initActiveNav();
    initContactForm();

  if (typeof globalThis.initScrollAnimations === "function") {
    globalThis.initScrollAnimations();
  } else {
    console.warn("[portfolio] initScrollAnimations() not found — check animations.js load order.");
  }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
