(function attachScrollAnimations(global) {
  "use strict";

  function runObserver() {
    const elements = Array.from(document.querySelectorAll(".reveal"));
    if (!elements.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("reveal-visible");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.12 }
    );

    for (const el of elements) io.observe(el);
  }

  function waitForComponents() {
    const check = setInterval(() => {
      const elements = document.querySelectorAll(".reveal");
      if (elements.length > 0) {
        clearInterval(check);
        runObserver();
      }
    }, 100);
  }

  global.initScrollAnimations = runObserver;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForComponents);
  } else {
    waitForComponents();
  }

})(typeof window !== "undefined" ? window : globalThis);