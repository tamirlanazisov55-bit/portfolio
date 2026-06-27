const clocks = document.querySelectorAll(".clock");
const periods = document.querySelectorAll(".period");
const languageOptions = document.querySelectorAll(".language-option");
const languageSwitch = document.querySelector(".language-switch");
const navPill = document.querySelector(".nav-pill");
const navLinks = document.querySelectorAll(".nav-pill a");
const aboutPanel = document.getElementById("about-panel");
const actionButtons = document.querySelectorAll(".action-list button");
const darkPillButtons = document.querySelectorAll(".nav-pill a, .language-option");
const logoLink = document.querySelector(".logo-pill");
const portraitStage = document.querySelector(".portrait-stage");
const softBlurTexts = document.querySelectorAll("[data-soft-blur]");
const i18nElements = document.querySelectorAll("[data-i18n]");
const aboutRevealElements = aboutPanel ? aboutPanel.querySelectorAll("h2, p, .action-list button") : [];
const aboutMotionMs = 420;
const aboutCloseMotionMs = 380;
let aboutCloseTimer;
let aboutHoverCloseTimer;
let currentLanguage = "ru";

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

const formatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Moscow",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

const copy = {
  ru: {
    "nav.about": "Обо мне",
    "nav.projects": "Проекты",
    "nav.malbert": "Мальберт",
    "hero.name": "Азисов Тамирлан",
    "about.hello.title": "Привет",
    "about.hello.body1":
      "Digital brand designer с 3+ годами опыта в digital. Занимаюсь айдентикой, сайтами и интерфейсами для продуктов, которым нужна ясная структура, характер и визуальная система.",
    "about.hello.body2":
      "Хорошо чувствую себя в новых контекстах: там, где нужно разобраться в задаче, найти подход и довести идею до рабочего дизайна.",
    "about.education.title": "Образование",
    "about.education.item1": "UpRock — Веб-дизайн",
    "about.education.item2": "Наука дизайна — Композиция и сетки",
    "about.education.item3": "videosmile — Супер Illustrator",
    "about.education.item4": "МГУ им. Н. П. Огарёва — высшее экономическое образование",
    "about.experience.title": "Опыт",
    "about.experience.item2": "Only digital — ui/ux designer",
    "about.contacts.title": "Контакты",
    "about.contacts.linkedin": "Linkedin",
    "footer.title": "Есть проект или вопрос?",
  },
  en: {
    "nav.about": "About me",
    "nav.projects": "Projects",
    "nav.malbert": "Malbert",
    "hero.name": "Azisov Tamirlan",
    "about.hello.title": "Hello",
    "about.hello.body1":
      "Digital brand designer with over 3 years of experience in digital. I work on branding, websites, and interfaces for products that need clear structure, character, and visual systems.",
    "about.hello.body2":
      "I feel comfortable in new contexts: where I need to understand the task, find an approach, and bring the idea to a working design.",
    "about.education.title": "Education",
    "about.education.item1": "UpRock — Web Design",
    "about.education.item2": "Science of Design — Composition and Grids",
    "about.education.item3": "videosmile — Super Illustrator",
    "about.education.item4": "Moscow State University named after N. P. Ogaryov — higher economic education",
    "about.experience.title": "Experience",
    "about.experience.item2": "Only digital — UI/UX designer",
    "about.contacts.title": "Contacts",
    "about.contacts.linkedin": "LinkedIn",
    "footer.title": "Do you have a project or question?",
  },
};

function updateClock() {
  const parts = formatter.formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  for (const clock of clocks) {
    clock.textContent = `${values.hour}:${values.minute}:${values.second}`;
  }

  for (const period of periods) {
    period.textContent = values.dayPeriod;
  }
}

updateClock();
setInterval(updateClock, 1000);

function renderSoftBlurText(element, value = element.textContent) {
  const text = value.replace(/\s+/g, " ").trim();
  const fragment = document.createDocumentFragment();

  element.setAttribute("aria-label", text);

  Array.from(text).forEach((char, index) => {
    const span = document.createElement("span");
    span.className = char === " " ? "soft-blur-char soft-blur-space" : "soft-blur-char";
    span.style.setProperty("--soft-blur-index", index);
    span.setAttribute("aria-hidden", "true");
    span.textContent = char === " " ? "\u00a0" : char;
    fragment.append(span);
  });

  element.textContent = "";
  element.append(fragment);
}

function setElementText(element, value) {
  if (element.matches("[data-soft-blur]")) {
    element.classList.remove("is-visible");
    renderSoftBlurText(element, value);
    return;
  }

  element.textContent = value;
}

function startSoftBlurText(element) {
  element.classList.remove("is-visible");

  requestAnimationFrame(() => {
    element.classList.add("is-visible");
  });
}

function applyLanguage(language) {
  currentLanguage = language;
  document.documentElement.lang = language;

  for (const element of i18nElements) {
    const key = element.dataset.i18n;
    const value = copy[language][key];
    if (!value) continue;

    setElementText(element, value);

    if (element.matches("[data-soft-blur]")) {
      startSoftBlurText(element);
    }
  }

  if (aboutPanel) {
    aboutPanel.setAttribute("aria-label", copy[language]["nav.about"]);
  }

  requestAnimationFrame(updateNavIndicator);
}

for (const element of softBlurTexts) {
  renderSoftBlurText(element);
}

aboutRevealElements.forEach((element, index) => {
  element.classList.add("about-reveal");
  element.style.setProperty("--about-reveal-index", index);
  element.style.setProperty("--about-reveal-reverse-index", aboutRevealElements.length - index - 1);
});

if ("IntersectionObserver" in window) {
  const softBlurObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        startSoftBlurText(entry.target);
        softBlurObserver.unobserve(entry.target);
      }
    },
    { threshold: 0.62 },
  );

  for (const element of softBlurTexts) {
    softBlurObserver.observe(element);
  }
} else {
  for (const element of softBlurTexts) {
    startSoftBlurText(element);
  }
}

function resetHomeState() {
  closeAboutPanel({ immediate: true });

  for (const item of navLinks) {
    item.classList.remove("is-active");
  }
  updateNavIndicator();

  history.replaceState(null, "", location.pathname);
  window.scrollTo(0, 0);
}

window.addEventListener("pageshow", resetHomeState);

if (logoLink) {
  logoLink.addEventListener("click", (event) => {
    event.preventDefault();
    resetHomeState();
    location.reload();
  });
}

function isAboutPanelOpen() {
  return Boolean(aboutPanel && !aboutPanel.hidden && aboutPanel.classList.contains("is-visible"));
}

function openAboutPanel() {
  if (!aboutPanel) return;

  clearTimeout(aboutCloseTimer);
  aboutPanel.hidden = false;
  aboutPanel.classList.remove("is-visible", "is-opening", "is-closing");

  requestAnimationFrame(() => {
    aboutPanel.classList.add("is-visible", "is-opening");
    aboutCloseTimer = setTimeout(() => {
      aboutPanel.classList.remove("is-opening");
    }, aboutMotionMs);
  });
}

function closeAboutPanel({ immediate = false } = {}) {
  if (!aboutPanel) return;

  clearTimeout(aboutCloseTimer);

  if (immediate || aboutPanel.hidden) {
    aboutPanel.hidden = true;
    aboutPanel.classList.remove("is-visible", "is-opening", "is-closing");
    return;
  }

  aboutPanel.classList.remove("is-opening");
  aboutPanel.classList.add("is-closing");
  aboutCloseTimer = setTimeout(() => {
    aboutPanel.hidden = true;
    aboutPanel.classList.remove("is-visible", "is-closing");
  }, aboutCloseMotionMs);
}

function updateNavIndicator() {
  if (!navPill) return;

  const activeLink = navPill.querySelector("a.is-active");
  navPill.classList.toggle("has-active", Boolean(activeLink));

  if (!activeLink) return;

  const navRect = navPill.getBoundingClientRect();
  const linkRect = activeLink.getBoundingClientRect();
  const activeX = linkRect.left - navRect.left + navPill.scrollLeft;

  navPill.style.setProperty("--nav-active-x", `${activeX}px`);
  navPill.style.setProperty("--nav-active-width", `${linkRect.width}px`);
}

function setAboutNavActive(isActive) {
  for (const item of navLinks) {
    item.classList.toggle("is-active", isActive && item.dataset.panel === "about");
  }
  updateNavIndicator();
}

function scheduleAboutClose() {
  clearTimeout(aboutHoverCloseTimer);
  aboutHoverCloseTimer = setTimeout(() => {
    closeAboutPanel();
    setAboutNavActive(false);
    history.replaceState(null, "", location.pathname);
  }, 120);
}

function cancelAboutClose() {
  clearTimeout(aboutHoverCloseTimer);
}

function openAboutFromHover() {
  cancelAboutClose();
  setAboutNavActive(true);
  openAboutPanel();
  history.replaceState(null, "", "#about");
}

for (const option of languageOptions) {
  option.addEventListener("click", () => {
    const language = option.textContent.trim();

    if (languageSwitch) {
      languageSwitch.dataset.active = language;
    }

    for (const item of languageOptions) {
      const isActive = item === option;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    }

    applyLanguage(language);
  });
}

for (const link of navLinks) {
  if (link.dataset.panel === "about") {
    link.addEventListener("pointerenter", openAboutFromHover);
    link.addEventListener("pointerleave", scheduleAboutClose);
  }

  link.addEventListener("click", (event) => {
    const opensAbout = link.dataset.panel === "about";

    if (opensAbout) {
      event.preventDefault();
    } else {
      closeAboutPanel();
      for (const item of navLinks) {
        item.classList.toggle("is-active", item === link);
      }
      updateNavIndicator();
    }
  });
}

if (aboutPanel) {
  aboutPanel.addEventListener("pointerenter", cancelAboutClose);
  aboutPanel.addEventListener("pointerleave", scheduleAboutClose);
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !aboutPanel || aboutPanel.hidden) return;

  closeAboutPanel();
  for (const item of navLinks) {
    item.classList.remove("is-active");
  }
  updateNavIndicator();
});

document.addEventListener("pointerdown", (event) => {
  if (!aboutPanel || aboutPanel.hidden) return;
  if (aboutPanel.contains(event.target)) return;
  if (event.target.closest(".nav-pill")) return;

  closeAboutPanel();
  for (const item of navLinks) {
    item.classList.remove("is-active");
  }
  updateNavIndicator();
});

window.addEventListener("resize", updateNavIndicator);

if (portraitStage) {
  portraitStage.addEventListener("pointerenter", () => {
    portraitStage.classList.add("is-hovered");
  });

  portraitStage.addEventListener("pointerleave", () => {
    portraitStage.classList.remove("is-hovered");
  });
}

for (const button of actionButtons) {
  button.addEventListener("pointerenter", () => {
    button.classList.add("is-hovered");
  });

  button.addEventListener("pointerleave", () => {
    button.classList.remove("is-hovered");
  });
}

for (const button of darkPillButtons) {
  button.addEventListener("pointerenter", () => {
    button.classList.add("is-hovered");
  });

  button.addEventListener("pointerleave", () => {
    button.classList.remove("is-hovered");
  });
}
