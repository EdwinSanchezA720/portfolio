(function attachScrollAnimations(global) {
  "use strict";

  let revealObserver = null;
  let domObserver = null;

  const OBSERVER_CONFIG = {
    root: null,
    // Keep threshold low so large containers can still reveal.
    threshold: 0.01,
    // Start reveal shortly before the element fully enters viewport.
    rootMargin: "0px 0px -8% 0px",
  };

  function forceReveal(elements, reason) {
    for (const el of elements) {
      el.classList.add("reveal-visible");
      el.dataset.revealDone = "true";
    }
    if (elements.length) {
      console.warn(`[portfolio] Scroll reveal fallback applied (${reason}) to ${elements.length} element(s).`);
    }
  }

  function revealNow(el) {
    el.classList.add("reveal-visible");
    el.dataset.revealDone = "true";
  }

  function buildObserver() {
    if (!("IntersectionObserver" in global)) return null;

    return new IntersectionObserver((entries, io) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        revealNow(entry.target);
        io.unobserve(entry.target);
      }
    }, OBSERVER_CONFIG);
  }

  function getPendingRevealElements() {
    return Array.from(document.querySelectorAll(".reveal:not(.reveal-visible)"));
  }

  function observePendingElements() {
    const pending = getPendingRevealElements();
    if (!pending.length) return;

    if (!revealObserver) {
      revealObserver = buildObserver();
    }

    if (!revealObserver) {
      forceReveal(pending, "IntersectionObserver unavailable");
      return;
    }

    for (const el of pending) {
      if (el.dataset.revealObserved === "true") continue;
      revealObserver.observe(el);
      el.dataset.revealObserved = "true";
    }
  }

  function runObserver() {
    observePendingElements();
  }

  function installDomWatcher() {
    if (!("MutationObserver" in global)) return;
    if (domObserver) domObserver.disconnect();

    domObserver = new MutationObserver((mutations) => {
      const hasRelevantNodes = mutations.some((mutation) => {
        if (mutation.type !== "childList") return false;
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.classList?.contains("reveal") || node.querySelector?.(".reveal")) return true;
        }
        return false;
      });

      if (hasRelevantNodes) {
        observePendingElements();
      }
    });

    domObserver.observe(document.body, { childList: true, subtree: true });
  }

  function warnIfStuckHidden() {
    global.setTimeout(() => {
      const hidden = getPendingRevealElements();
      if (!hidden.length) return;

      const inViewport = hidden.filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top < global.innerHeight && rect.bottom > 0;
      });

      if (inViewport.length) {
        console.warn(`[portfolio] ${inViewport.length} reveal element(s) are visible in viewport but still hidden. Re-observing now.`);
        observePendingElements();
      }
    }, 1800);
  }

  function initScrollAnimations() {
    runObserver();
    installDomWatcher();
    warnIfStuckHidden();
  }

  global.initScrollAnimations = initScrollAnimations;

  document.addEventListener("portfolio:components-loaded", () => {
    initScrollAnimations();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScrollAnimations, { once: true });
  } else {
    initScrollAnimations();
  }

})(typeof window !== "undefined" ? window : globalThis);