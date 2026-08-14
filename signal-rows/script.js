/* =========================================================================
   Signal — theme toggle and reveal on scroll.

   No library, no dependency. The page is complete and readable without any of
   this: if the script never runs, is blocked by a policy, or the reader
   prefers reduced motion, the page simply stays in its finished state at the
   theme the profile chose, and the toggle never appears rather than appearing
   and doing nothing.

   Loaded from <head> without defer, on purpose. Both the stored theme and the
   motion flag have to be on the root element before first paint, or the page
   flashes the wrong colours and then corrects itself.
   ========================================================================= */

(function () {
  "use strict";

  var root = document.documentElement;
  var KEY = "canonical-page-theme";

  /* ------------------------------------------------------------- theme --- */

  // Private browsing and blocked storage both throw on access rather than
  // returning null, so every touch of localStorage is guarded.
  function readStored() {
    try {
      var v = window.localStorage.getItem(KEY);
      return v === "light" || v === "dark" ? v : null;
    } catch (e) {
      return null;
    }
  }

  function writeStored(value) {
    try {
      window.localStorage.setItem(KEY, value);
    } catch (e) {
      /* Preference lasts for this page view only. Nothing else breaks. */
    }
  }

  // The profile sets the starting theme. A returning reader's own choice wins.
  var stored = readStored();
  if (stored) root.setAttribute("data-theme", stored);

  // Anything other than an explicit light is dark: dark is this template's
  // default, and `auto` resolves to it rather than to the system setting.
  function isLight() {
    return root.getAttribute("data-theme") === "light";
  }

  function syncToggle(button) {
    button.setAttribute(
      "aria-label",
      isLight() ? "Switch to dark theme" : "Switch to light theme",
    );
  }

  // Tells CSS the control can actually do something, so it becomes visible.
  root.setAttribute("data-js", "on");

  /* ------------------------------------------------------------ motion --- */

  var motion =
    !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) &&
    "IntersectionObserver" in window;

  if (motion) root.setAttribute("data-motion", "on");

  function startReveal() {
    var sections = document.querySelectorAll("[data-reveal]");

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute("data-revealed", "");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    for (var i = 0; i < sections.length; i++) {
      // Anything already on screen at load reveals immediately rather than
      // waiting for a scroll that may never come on a short viewport.
      if (sections[i].getBoundingClientRect().top < window.innerHeight * 0.9) {
        sections[i].setAttribute("data-revealed", "");
      } else {
        observer.observe(sections[i]);
      }
    }
  }

  /* --------------------------------------------------------------- go --- */

  function start() {
    var button = document.querySelector("[data-theme-toggle]");

    if (button) {
      syncToggle(button);
      button.addEventListener("click", function () {
        var next = isLight() ? "dark" : "light";
        root.setAttribute("data-theme", next);
        writeStored(next);
        syncToggle(button);
      });
    }

    if (motion) startReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
