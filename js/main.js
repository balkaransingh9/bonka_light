/* BONKA — interactions */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- nav ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 12);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* highlight the section currently in view */
  const navAnchors = [...document.querySelectorAll(".nav-links a[href^='#']")];
  const navSections = navAnchors
    .map((anchor) => document.querySelector(anchor.getAttribute("href")))
    .filter(Boolean);
  if (navSections.length) {
    const sectionIO = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        navAnchors.forEach((anchor) => {
          const active = anchor.getAttribute("href") === `#${visible.target.id}`;
          anchor.classList.toggle("active", active);
          if (active) anchor.setAttribute("aria-current", "location");
          else anchor.removeAttribute("aria-current");
        });
      },
      { rootMargin: "-28% 0px -58% 0px", threshold: [0, 0.2, 0.5] }
    );
    navSections.forEach((section) => sectionIO.observe(section));
  }

  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.hidden = !open;
    menu.classList.toggle("open", open);
  };
  toggle.addEventListener("click", () =>
    setMenu(toggle.getAttribute("aria-expanded") !== "true")
  );
  menu.addEventListener("click", (e) => {
    if (e.target.matches("a")) setMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) {
      setMenu(false);
      toggle.focus();
    }
  });
  const wideNav = window.matchMedia("(min-width: 801px)");
  const closeMenuOnWideScreen = () => {
    if (wideNav.matches && !menu.hidden) setMenu(false);
  };
  wideNav.addEventListener("change", closeMenuOnWideScreen);
  window.addEventListener("resize", closeMenuOnWideScreen, { passive: true });

  /* ---------- scroll reveals ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (reduceMotion) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* flow line pulse activates with its section */
  const flow = document.querySelector(".flow");
  if (flow) {
    new IntersectionObserver(
      (entries, obs) => {
        if (entries[0].isIntersecting) {
          flow.classList.add("in");
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    ).observe(flow);
  }

  /* ---------- count-up numbers ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const runCount = (el) => {
    const target = parseFloat(el.dataset.target || el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    if (reduceMotion) {
      el.textContent = target.toFixed(decimals);
      return;
    }
    const dur = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const countIO = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          runCount(entry.target);
          countIO.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => countIO.observe(el));

  /* ---------- integrations marquee (clone for seamless loop) ---------- */
  const marqueeTrack = document.querySelector(".marquee-track");
  if (marqueeTrack) {
    marqueeTrack.querySelectorAll(".tool").forEach((el) => {
      const clone = el.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      marqueeTrack.appendChild(clone);
    });
  }

  /* ---------- board ticker ---------- */
  const ticker = document.getElementById("tickerText");
  if (ticker && !reduceMotion) {
    const feed = [
      "Marcus R. accepted dispatch — 02:49 AM",
      "New P1 qualified — kitchen flood, cafe (07:11)",
      "Follow-up scheduled — mould quote, Ascot",
      "Caller confirmed booking — job #4187",
      "Overflow call absorbed — office line busy",
    ];
    let f = 0;
    setInterval(() => {
      ticker.classList.add("fading");
      setTimeout(() => {
        f = (f + 1) % feed.length;
        ticker.textContent = feed[f];
        ticker.classList.remove("fading");
      }, 400);
    }, 4200);
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-q").forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute("aria-controls"));
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      if (reduceMotion) {
        panel.hidden = open;
        return;
      }
      if (open) {
        /* collapse */
        panel.style.height = panel.scrollHeight + "px";
        requestAnimationFrame(() => (panel.style.height = "0px"));
        panel.addEventListener(
          "transitionend",
          () => {
            panel.hidden = true;
            panel.style.height = "";
          },
          { once: true }
        );
      } else {
        /* expand */
        panel.hidden = false;
        panel.style.height = "0px";
        requestAnimationFrame(() => (panel.style.height = panel.scrollHeight + "px"));
        panel.addEventListener(
          "transitionend",
          () => (panel.style.height = ""),
          { once: true }
        );
      }
    });
  });

  /* ---------- hero blueprint draws itself in ---------- */
  const blueprint = document.querySelector(".hero-blueprint");
  if (blueprint) {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => blueprint.classList.add("draw"))
    );
  }

  /* ---------- spotlight hover on use-case cards ---------- */
  if (window.matchMedia("(hover: hover)").matches && !reduceMotion) {
    document.querySelectorAll(".case").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
