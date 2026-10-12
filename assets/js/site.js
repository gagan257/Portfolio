/*
 * Portfolio interactions: theme toggle, the hero's rotating word, card
 * spotlight, mobile menu, section highlighting, project search and "View
 * more", the mobile apps showcase, scroll reveal, stat counters, the contact
 * form, and the scroll progress bar with its back-to-top button.
 * No dependencies. The page stays fully readable without this file.
 */
(function () {
  "use strict";

  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------------------------------------------------------------- Theme */

  /** --theme-duration in site.css, plus a frame so the colour fade can finish. */
  const THEME_TRANSITION_MS = 220;

  /** How long the new theme takes to open out from the toggle, where view transitions exist. */
  const THEME_REVEAL_MS = 560;

  const themeToggle = document.querySelector("[data-theme-toggle]");

  function currentTheme() {
    return root.classList.contains("dark") ? "dark" : "light";
  }

  function updateThemeToggleLabel() {
    if (!themeToggle) return;
    themeToggle.setAttribute(
      "aria-label",
      currentTheme() === "light" ? "Switch to dark mode" : "Switch to light mode",
    );
  }

  function applyTheme(theme) {
    const update = () => {
      root.classList.toggle("dark", theme === "dark");
      root.style.colorScheme = theme;
      updateThemeToggleLabel();
    };

    if (reducedMotion.matches) {
      update();
      return;
    }

    root.classList.add("theme-switching");

    // Preferred: the new theme opens in a circle from the toggle out to the farthest corner.
    if (themeToggle && typeof document.startViewTransition === "function") {
      const box = themeToggle.getBoundingClientRect();
      const x = box.left + box.width / 2;
      const y = box.top + box.height / 2;
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );

      root.classList.add("theme-reveal");
      const transition = document.startViewTransition(update);

      transition.ready
        .then(() => {
          root.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${radius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: THEME_REVEAL_MS,
              easing: "cubic-bezier(0.25, 1, 0.5, 1)",
              pseudoElement: "::view-transition-new(root)",
            },
          );
        })
        .catch(() => {
          // The transition was skipped (for example by a second click); the theme has still changed.
        });

      transition.finished.finally(() => {
        root.classList.remove("theme-reveal", "theme-switching");
      });
      return;
    }

    // Otherwise the colour tokens fade from one theme to the other.
    update();
    window.setTimeout(() => {
      root.classList.remove("theme-switching");
    }, THEME_TRANSITION_MS);
  }

  if (themeToggle) {
    updateThemeToggleLabel();
    themeToggle.addEventListener("click", () => {
      const next = currentTheme() === "light" ? "dark" : "light";
      try {
        localStorage.setItem("theme", next);
      } catch {
        // Storage can be blocked (private mode); the theme still applies for this visit.
      }
      applyTheme(next);
    });
  }

  /* ---------------------------------------------------------- Hero reveal */

  // The script in <head> reads this flag and skips the reveal on later loads.
  try {
    sessionStorage.setItem("hero-seen", "1");
  } catch {
    // Storage can be blocked; the reveal then plays once per page load.
  }

  /* -------------------------------------------------- Hero: rotating word */

  /** How long each word stays before the next takes its place. */
  const ROTATOR_INTERVAL_MS = 2400;

  /** The `.rotator-word` transition in site.css, plus a frame. */
  const ROTATOR_SWAP_MS = 400;

  const rotator = document.querySelector("[data-rotator]");

  if (rotator && !reducedMotion.matches) {
    // Screen readers keep the full sentence; the moving words are for the eye only.
    const spoken = document.createElement("span");
    spoken.className = "visually-hidden";
    spoken.textContent = rotator.textContent;

    const words = rotator.dataset.rotator.split("|").map((text) => {
      const word = document.createElement("span");
      word.className = "rotator-word";
      word.textContent = text;
      word.setAttribute("aria-hidden", "true");
      return word;
    });

    rotator.replaceChildren(spoken, ...words);
    rotator.classList.add("is-ready");

    let current = 0;

    /** The line box takes the current word's width, so the sentence closes up around it. */
    const fit = () => {
      rotator.style.width = `${words[current].offsetWidth}px`;
    };

    words[current].classList.add("is-active");
    fit();

    // The web font changes every word's width once it has loaded.
    if (document.fonts) document.fonts.ready.then(fit);
    window.addEventListener("resize", fit);

    window.setInterval(() => {
      if (document.hidden) return;

      const leaving = words[current];
      leaving.classList.replace("is-active", "is-leaving");
      window.setTimeout(() => leaving.classList.remove("is-leaving"), ROTATOR_SWAP_MS);

      current = (current + 1) % words.length;
      words[current].classList.add("is-active");
      fit();
    }, ROTATOR_INTERVAL_MS);
  }

  /* ------------------------------------------------------- Card spotlight */

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  // Keeps each card's glow (`.glass-card::before` in site.css) under the pointer.
  if (finePointer.matches) {
    let frame = 0;

    document.addEventListener(
      "pointermove",
      (event) => {
        if (frame) return;

        frame = window.requestAnimationFrame(() => {
          frame = 0;
          const card = event.target instanceof Element ? event.target.closest(".glass-card") : null;
          if (!card) return;

          const box = card.getBoundingClientRect();
          card.style.setProperty("--mx", `${event.clientX - box.left}px`);
          card.style.setProperty("--my", `${event.clientY - box.top}px`);
        });
      },
      { passive: true },
    );
  }

  /* ---------------------------------------------------------- Mobile menu */

  /** Matches the `.mobile-menu-root[data-state="closed"]` transitions in site.css. */
  const MENU_EXIT_MS = 160;

  const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const menu = document.getElementById("mobile-menu");
  const menuButton = document.querySelector("[data-menu-open]");

  if (menu && menuButton) {
    const panel = menu.querySelector(".mobile-menu-panel");
    let closeTimer = 0;
    let savedOverflow = "";

    /** Keeps Tab and Shift+Tab cycling inside the panel while the menu is open. */
    const trapFocus = (event) => {
      const focusable = Array.from(panel.querySelectorAll(FOCUSABLE)).filter(
        (element) => element.getClientRects().length > 0,
      );

      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const outside = !panel.contains(active);

      if (event.shiftKey && (outside || active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (outside || active === last)) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      } else if (event.key === "Tab") {
        trapFocus(event);
      }
    };

    const isOpen = () => menu.dataset.state === "open";

    function openMenu() {
      window.clearTimeout(closeTimer);
      menu.inert = false;
      menu.dataset.state = "open";
      menu.hidden = false;
      menuButton.setAttribute("aria-expanded", "true");

      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
      window.requestAnimationFrame(() => panel.focus());
    }

    /** `restoreFocus` is off when a menu link is taking the visitor elsewhere on the page. */
    function closeMenu({ restoreFocus = true } = {}) {
      if (!isOpen()) return;

      menu.dataset.state = "closed";
      menu.inert = true;
      menuButton.setAttribute("aria-expanded", "false");

      document.body.style.overflow = savedOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      if (restoreFocus) menuButton.focus();

      // Stay rendered until the exit transition has played.
      closeTimer = window.setTimeout(
        () => {
          menu.hidden = true;
        },
        reducedMotion.matches ? 0 : MENU_EXIT_MS,
      );
    }

    menuButton.addEventListener("click", () => (isOpen() ? closeMenu() : openMenu()));

    menu.querySelectorAll("[data-menu-close]").forEach((button) => {
      button.addEventListener("click", () => closeMenu());
    });

    menu.querySelectorAll("a[href^='#']").forEach((link) => {
      link.addEventListener("click", () => closeMenu({ restoreFocus: false }));
    });

    // The menu button is hidden on wide screens, so the menu must not outlive it.
    window.matchMedia("(min-width: 1024px)").addEventListener("change", (event) => {
      if (event.matches) closeMenu({ restoreFocus: false });
    });
  }

  /* --------------------------------------------------- Section highlighting */

  const navLinks = new Map();
  document.querySelectorAll(".site-nav a[href^='#']").forEach((link) => {
    navLinks.set(link.getAttribute("href").slice(1), link);
  });

  if (navLinks.size > 0 && "IntersectionObserver" in window) {
    // A thin band just above the middle of the viewport: the section crossing it is "current".
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = navLinks.get(entry.target.id);
          if (!link) return;

          if (entry.isIntersecting) {
            navLinks.forEach((other) => other.removeAttribute("aria-current"));
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );

    navLinks.forEach((_link, id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* ------------------------------------------------------------- Projects */

  const PROJECTS_PER_LOAD = 6;

  const projects = document.getElementById("projects");

  if (projects) {
    const moreButton = projects.querySelector("[data-projects-more]");
    const moreRow = moreButton.parentElement;
    const search = projects.querySelector("[data-project-search]");
    const liveToggle = projects.querySelector("[data-project-live]");
    const count = projects.querySelector("[data-project-count]");
    const emptyState = projects.querySelector("[data-project-empty]");
    const groups = Array.from(projects.querySelectorAll("[data-project-group]"));
    const items = Array.from(projects.querySelectorAll("[data-project-list] > li"));

    /** What a search looks through, read once: each project's title, description and tags. */
    const searchText = new Map(items.map((item) => [item, item.textContent.toLowerCase()]));

    const hiddenExtras = () =>
      Array.from(projects.querySelectorAll(".project-extra:not(.is-shown)"));

    const liveOnly = () => liveToggle.getAttribute("aria-pressed") === "true";

    function update() {
      const terms = search.value.toLowerCase().split(/\s+/).filter(Boolean);
      const filtering = terms.length > 0 || liveOnly();
      let matches = 0;

      items.forEach((item) => {
        const text = searchText.get(item);
        const match =
          terms.every((term) => text.includes(term)) &&
          (!liveOnly() || item.querySelector("a[href^='http']") !== null);

        item.hidden = filtering && !match;
        if (match) matches += 1;
      });

      // A search looks through every project, so "View more" paging steps aside while it is active.
      projects.classList.toggle("is-filtering", filtering);
      moreRow.hidden = filtering || hiddenExtras().length === 0;
      groups.forEach((group) => {
        group.hidden =
          filtering && group.querySelector("[data-project-list] > li:not([hidden])") === null;
      });
      emptyState.hidden = matches > 0;
      count.textContent = filtering
        ? `${matches} of ${items.length}`
        : `${items.length} projects`;
    }

    moreButton.addEventListener("click", () => {
      const batch = hiddenExtras().slice(0, PROJECTS_PER_LOAD);

      batch.forEach((item, index) => {
        item.style.setProperty("--i", index);
        item.classList.add("is-shown", "list-enter");
      });

      // Keyboard and screen-reader users continue from the first newly shown project.
      const firstTarget = batch[0] && batch[0].querySelector("a, .project-card");
      if (firstTarget) {
        if (!firstTarget.matches("a")) firstTarget.tabIndex = -1;
        firstTarget.focus({ preventScroll: true });
      }

      update();
    });

    search.addEventListener("input", update);

    liveToggle.addEventListener("click", () => {
      liveToggle.setAttribute("aria-pressed", String(!liveOnly()));
      update();
    });

    projects.querySelector("[data-project-clear]").addEventListener("click", () => {
      search.value = "";
      liveToggle.setAttribute("aria-pressed", "false");
      update();
      search.focus();
    });

    update();
  }

  /* ------------------------------------------------- Mobile apps showcase */

  /** How long each app stays on the phone while the showcase cycles by itself. */
  const APP_CYCLE_MS = 4200;

  const showcase = document.querySelector("[data-app-showcase]");

  if (showcase) {
    const tabs = Array.from(showcase.querySelectorAll("[data-app-tab]"));
    // Everything that follows the selection: the card, the phone's screen and the floating icon.
    const followers = Array.from(
      showcase.querySelectorAll("[data-app-panel], [data-app-screen], [data-app-float]"),
    );
    const appOf = (element) =>
      element.dataset.appPanel || element.dataset.appScreen || element.dataset.appFloat;

    let active = tabs[0].dataset.appTab;

    // The cards become tab panels only now that the tabs can drive them.
    tabs.forEach((tab) => {
      const panel = document.getElementById(tab.getAttribute("aria-controls"));
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tab.id);
    });

    function select(name, { focus = false } = {}) {
      active = name;

      tabs.forEach((tab) => {
        const selected = tab.dataset.appTab === name;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        if (selected && focus) tab.focus();
      });

      followers.forEach((element) => {
        element.classList.toggle("is-active", appOf(element) === name);
      });
    }

    const step = (offset) => {
      const index = tabs.findIndex((tab) => tab.dataset.appTab === active);
      return tabs[(index + offset + tabs.length) % tabs.length].dataset.appTab;
    };

    // Cycles through the apps while the showcase is on screen, until the visitor picks one.
    let cycle = 0;
    let visitorChose = false;
    let paused = false;

    const stopCycle = () => {
      window.clearInterval(cycle);
      cycle = 0;
    };

    const takeOver = () => {
      visitorChose = true;
      stopCycle();
    };

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        takeOver();
        select(tab.dataset.appTab);
      });

      tab.addEventListener("keydown", (event) => {
        const offset = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
        if (!offset) return;

        event.preventDefault();
        takeOver();
        select(step(offset), { focus: true });
      });
    });

    if ("IntersectionObserver" in window && !reducedMotion.matches) {
      new IntersectionObserver(
        ([entry]) => {
          stopCycle();
          if (!entry.isIntersecting || visitorChose) return;

          cycle = window.setInterval(() => {
            if (!document.hidden && !paused) select(step(1));
          }, APP_CYCLE_MS);
        },
        { threshold: 0.35 },
      ).observe(showcase);

      // Reading or interacting holds the current app in place.
      showcase.addEventListener("pointerenter", () => (paused = true));
      showcase.addEventListener("pointerleave", () => (paused = false));
      showcase.addEventListener("focusin", () => (paused = true));
      showcase.addEventListener("focusout", () => (paused = false));
    }
  }

  /* -------------------------------------------------------- Scroll reveal */

  const REVEAL_SELECTOR =
    ".section-head, .section .glass-card, .profile-panel, .contact-option, .project-toolbar, .phone-stage, .app-tabs";

  /** Delay between items that come into view together, for up to this many of them. */
  const REVEAL_STAGGER_MS = 70;
  const REVEAL_STAGGER_MAX = 5;

  /** The `.reveal.is-revealed` transition in site.css, after the longest stagger. */
  const REVEAL_SETTLE_MS = 480 + REVEAL_STAGGER_MS * REVEAL_STAGGER_MAX + 50;

  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .forEach((entry, index) => {
            const element = entry.target;
            const delay = Math.min(index, REVEAL_STAGGER_MAX) * REVEAL_STAGGER_MS;

            revealObserver.unobserve(element);
            element.style.setProperty("--reveal-delay", `${delay}ms`);
            element.classList.add("is-revealed");

            // Back to its own styles once it has arrived, so its hover and press transitions apply again.
            window.setTimeout(() => {
              element.classList.remove("reveal", "is-revealed");
              element.style.removeProperty("--reveal-delay");
            }, REVEAL_SETTLE_MS);
          });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
    );

    document.querySelectorAll(REVEAL_SELECTOR).forEach((element) => {
      // Leave alone what is hidden, what "View more" pages in, the app cards (the
      // showcase shows one at a time) and what is already on screen.
      if (element.closest("[hidden], .project-extra, .app-panels")) return;
      if (element.getBoundingClientRect().top < window.innerHeight) return;

      element.classList.add("reveal");
      revealObserver.observe(element);
    });

    // Skill tags follow their card in, one after another.
    const skillList = document.querySelector(".skill-list");

    if (skillList && skillList.getBoundingClientRect().top >= window.innerHeight) {
      skillList.querySelectorAll(".chip").forEach((chip, index) => {
        chip.style.setProperty("--n", index);
      });
      skillList.classList.add("chips-pending");

      const chipObserver = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;

          chipObserver.disconnect();
          skillList.classList.replace("chips-pending", "chips-in");
        },
        { threshold: 0.15 },
      );
      chipObserver.observe(skillList);
    }
  }

  /* -------------------------------------------------------- Stat counters */

  /** How long a number takes to count up to its value. */
  const COUNT_DURATION_MS = 1100;

  const counters = Array.from(document.querySelectorAll("[data-count]"));

  if (counters.length > 0 && "IntersectionObserver" in window && !reducedMotion.matches) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .forEach((entry) => {
            const element = entry.target;
            const target = Number(element.dataset.count);
            const startedAt = performance.now();

            countObserver.unobserve(element);

            const step = (now) => {
              const progress = Math.min((now - startedAt) / COUNT_DURATION_MS, 1);
              // Ease out: quick at first, settling onto the final value.
              const eased = 1 - (1 - progress) ** 3;

              element.textContent = String(Math.round(target * eased));
              if (progress < 1) window.requestAnimationFrame(step);
            };
            window.requestAnimationFrame(step);
          });
      },
      { threshold: 0.6 },
    );

    counters.forEach((element) => countObserver.observe(element));
  }

  /* --------------------------------------------------------- Contact form */

  const NAME_MIN = 2;
  const NAME_MAX = 80;
  const MESSAGE_MIN = 10;
  const MESSAGE_MAX = 2000;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const validators = {
    name(value) {
      const trimmed = value.trim();
      if (!trimmed) return "Name is required.";
      if (trimmed.length < NAME_MIN) return `Name must be at least ${NAME_MIN} characters.`;
      if (trimmed.length > NAME_MAX) return `Name must be ${NAME_MAX} characters or fewer.`;
      return "";
    },
    email(value) {
      const trimmed = value.trim();
      if (!trimmed) return "Email address is required.";
      if (!EMAIL_PATTERN.test(trimmed)) return "Enter a valid email address.";
      return "";
    },
    message(value) {
      const trimmed = value.trim();
      if (!trimmed) return "Message is required.";
      if (trimmed.length < MESSAGE_MIN) {
        return `Message must be at least ${MESSAGE_MIN} characters.`;
      }
      if (trimmed.length > MESSAGE_MAX) {
        return `Message must be ${MESSAGE_MAX} characters or fewer.`;
      }
      return "";
    },
  };

  const form = document.querySelector("[data-contact-form]");

  if (form) {
    const fieldNames = Object.keys(validators);
    const submitButton = form.querySelector("[type='submit']");
    const submitLabel = submitButton.textContent;
    const errorBanner = form.querySelector("[data-form-error]");
    const errorBannerText = form.querySelector("[data-form-error-text]");
    const successCard = document.querySelector("[data-form-success]");
    const messageCount = form.querySelector("[data-message-count]");
    const touched = new Set();

    const input = (name) => form.elements.namedItem(name);

    // Validation and its messages are handled here instead of by the browser.
    form.noValidate = true;

    function showFieldError(name, message) {
      const field = input(name);
      const error = document.getElementById(`${field.id}-error`);

      field.classList.toggle("form-input-invalid", Boolean(message));
      error.textContent = message;
      error.hidden = !message;

      if (message) {
        field.setAttribute("aria-invalid", "true");
        field.setAttribute("aria-describedby", error.id);
      } else {
        field.removeAttribute("aria-invalid");
        field.removeAttribute("aria-describedby");
      }
    }

    /** Returns true when the field is valid. */
    function validateField(name) {
      const message = validators[name](input(name).value);
      showFieldError(name, message);
      return !message;
    }

    function showFormError(message) {
      errorBannerText.textContent = message;
      errorBanner.hidden = false;
      errorBanner.classList.add("form-status-enter");
      errorBanner.focus();
    }

    function setSubmitting(submitting) {
      form.setAttribute("aria-busy", String(submitting));
      submitButton.disabled = submitting;
      submitButton.textContent = submitting ? "Sending…" : submitLabel;
      fieldNames.forEach((name) => {
        input(name).disabled = submitting;
      });
    }

    function updateMessageCount() {
      messageCount.textContent = `${input("message").value.trim().length}/${MESSAGE_MAX}`;
    }

    messageCount.hidden = false;
    updateMessageCount();

    fieldNames.forEach((name) => {
      const field = input(name);

      field.addEventListener("blur", () => {
        touched.add(name);
        validateField(name);
      });

      field.addEventListener("input", () => {
        errorBanner.hidden = true;
        if (name === "message") updateMessageCount();
        if (touched.has(name)) validateField(name);
      });
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      errorBanner.hidden = true;

      fieldNames.forEach((name) => touched.add(name));
      const invalid = fieldNames.filter((name) => !validateField(name));
      if (invalid.length > 0) {
        input(invalid[0]).focus();
        return;
      }

      // Netlify adds this field with its reCAPTCHA widget on the deployed site.
      const captcha = form.querySelector("[name='g-recaptcha-response']");
      if (captcha && !captcha.value) {
        showFormError("Please complete the reCAPTCHA check, then send your message again.");
        return;
      }

      input("name").value = input("name").value.trim();
      input("email").value = input("email").value.trim();
      input("message").value = input("message").value.trim();

      // Read the fields before they are disabled: disabled fields are left out of FormData.
      const body = new URLSearchParams(new FormData(form)).toString();
      setSubmitting(true);

      try {
        // Netlify intercepts form POSTs on any path of the site.
        const response = await fetch(window.location.pathname, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        });

        if (!response.ok) throw new Error(`Form submission failed: ${response.status}`);

        form.reset();
        form.hidden = true;
        successCard.hidden = false;
        successCard.classList.add("form-status-enter");
        successCard.querySelector("h3").focus();
      } catch {
        setSubmitting(false);
        showFormError(
          "Something went wrong while submitting the form. Please check your connection and try again.",
        );
      }
    });
  }

  /* ------------------------------------ Scroll: progress bar and back to top */

  /** How far the page scrolls before the back-to-top button appears. */
  const BACK_TO_TOP_OFFSET = 600;

  const backToTop = document.querySelector("[data-back-to-top]");
  const progressBar = document.querySelector("[data-scroll-progress]");

  if (backToTop || progressBar) {
    let ticking = false;

    const update = () => {
      ticking = false;

      if (backToTop) backToTop.dataset.visible = String(window.scrollY > BACK_TO_TOP_OFFSET);

      if (progressBar) {
        const scrollable = root.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
        progressBar.style.transform = `scaleX(${progress.toFixed(4)})`;
      }
    };

    const schedule = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    // The page's height changes with its width.
    window.addEventListener("resize", schedule);

    update();
  }

  /* ----------------------------------------------------------------- Year */

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
