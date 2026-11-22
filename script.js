const clocks = document.querySelectorAll(".clock");
const periods = document.querySelectorAll(".period");
const languageOptions = document.querySelectorAll(".language-option");
const languageSwitch = document.querySelector(".language-switch");
const navPill = document.querySelector(".nav-pill");
const navLinks = document.querySelectorAll(".nav-pill a");
const aboutPanel = document.getElementById("about-panel");
const menuToggle = document.querySelector(".menu-toggle");
const aboutCloseButton = document.querySelector(".about-close");
const mobileNavQuery = window.matchMedia("(max-width: 760px)");
const isMobileNav = () => mobileNavQuery.matches;
const actionButtons = document.querySelectorAll(".action-list button, .action-list a");
const darkPillButtons = document.querySelectorAll(".nav-pill a, .language-option");
const logoLink = document.querySelector(".logo-pill");
const portraitStage = document.querySelector(".portrait-stage");
const footerScreen = document.querySelector(".footer-screen");
const footerArtifactsLayer = document.querySelector(".footer-artifacts");
const footerMessage = document.querySelector(".footer-message");
const workSections = document.querySelectorAll("[data-work-section]");
const softBlurTexts = document.querySelectorAll("[data-soft-blur]");
const i18nElements = document.querySelectorAll("[data-i18n]");
const aboutRevealElements = aboutPanel ? aboutPanel.querySelectorAll("h2, p, .action-list button, .action-list a") : [];
const aboutMotionMs = 1000;
const aboutCloseMotionMs = 700;
const workMetaMotionMs = 1800;
const workSnapDelayMs = 130;
const workSnapMotionMs = 520;
const displayReferenceWidth = 1440;
const displayReferenceHeight = 810;
const displayMaxScale = 1.5;
const heroWideOffsetMinWidth = 1920;
const heroWideOffsetMinHeight = 1080;
const footerArtifactCount = 34;
const footerArtifactMaxActive = 7;
const footerArtifactIntervalMs = 180;
const footerArtifactRepeatGap = 7;
const footerArtifactSizeMultiplier = 1.05;
const footerArtifactPopScale = 1.2;
let aboutCloseTimer;
let aboutHoverCloseTimer;
let currentLanguage = "ru";
let lastFooterArtifactAt = 0;
let footerArtifactIndex = 0;
let navLanguageTimer;
let workScrollFrame;
const recentFooterArtifacts = [];
const workCarouselState = new WeakMap();
const footerArtifactImages = new Map();
const isHomePage = location.pathname.endsWith("/") || location.pathname.endsWith("/index.html");
const languageStorageKey = "portfolio-language";

function getFooterArtifactSrc(artifactNumber) {
  return `./assets/footer-artifacts/artifact-${String(artifactNumber).padStart(2, "0")}.png`;
}

function preloadFooterArtifacts() {
  for (let index = 1; index <= footerArtifactCount; index += 1) {
    const image = document.createElement("img");
    image.decoding = "async";
    image.loading = "eager";
    image.src = getFooterArtifactSrc(index);
    footerArtifactImages.set(index, image);
  }
}

preloadFooterArtifacts();

function getDisplayScale() {
  return Math.max(
    1,
    Math.min(window.innerWidth / displayReferenceWidth, window.innerHeight / displayReferenceHeight, displayMaxScale),
  );
}

function isWideHeroViewport() {
  const screenWidth = window.screen?.width;
  const screenHeight = window.screen?.height;

  return (
    Boolean(screenWidth && screenHeight) &&
    window.innerWidth > heroWideOffsetMinWidth &&
    window.innerHeight > heroWideOffsetMinHeight &&
    screenWidth > heroWideOffsetMinWidth &&
    screenHeight > heroWideOffsetMinHeight
  );
}

function updateDisplayScale() {
  const scale = getDisplayScale();
  const shouldOffsetHero = isWideHeroViewport();
  document.documentElement.style.setProperty("--display-scale", scale.toFixed(4));
  document.documentElement.style.setProperty("--hero-top", shouldOffsetHero ? "50%" : `${181 * scale}px`);
  document.documentElement.style.setProperty("--hero-translate-y", shouldOffsetHero ? "-50%" : "0px");
  document.documentElement.style.setProperty("--hero-transform-origin", shouldOffsetHero ? "center" : "top center");
  document.documentElement.style.setProperty("--work-card-width-scaled", `${796 * scale}px`);
  document.documentElement.style.setProperty("--work-card-height-scaled", `${450 * scale}px`);
  document.documentElement.style.setProperty("--work-card-gap-scaled", `${10 * scale}px`);
}

updateDisplayScale();

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
    "nav.malbert": "Холст",
    "nav.contact": "Связь со мной",
    "hero.name": "Азисов Тамирлан",
    "about.hello.title": "Привет",
    "about.hello.body1":
      "Бренд-дизайнер с 4+ годами в digital. Делаю айдентику, сайты и интерфейсы для tech-продуктов — от визуальной идеи до гайдлайнов и дизайн-систем, с которыми команды и AI-инструменты развивают продукт дальше.",
    "about.education.title": "Образование",
    "about.education.item1": "UpRock — веб-дизайн",
    "about.education.item2": "Наука дизайна — композиция и сетки",
    "about.education.item3": "videosmile — Adobe Illustrator",
    "about.education.item4": "МГУ им. Н. П. Огарёва — высшее экономическое",
    "about.experience.title": "Опыт",
    "about.experience.item2": "Only — UX/UI designer",
    "about.contacts.title": "Контакты",
    "about.contacts.linkedin": "Linkedin",
    "footer.title": "Есть проект или вопрос?",
  },
  en: {
    "nav.about": "About",
    "nav.projects": "Projects",
    "nav.malbert": "Canvas",
    "nav.contact": "Contacts",
    "hero.name": "Azisov Tamirlan",
    "about.hello.title": "Hello",
    "about.hello.body1":
      "Brand designer with 4+ years in digital. I create identities, websites and interfaces for tech products — from the visual idea to guidelines and design systems that teams and AI tools use to grow the product.",
    "about.education.title": "Education",
    "about.education.item1": "UpRock — web design",
    "about.education.item2": "Science of Design — composition and grids",
    "about.education.item3": "videosmile — Adobe Illustrator",
    "about.education.item4": "Ogarev Mordovia State University — degree in economics",
    "about.experience.title": "Experience",
    "about.experience.item2": "Only — UX/UI designer",
    "about.contacts.title": "Contacts",
    "about.contacts.linkedin": "LinkedIn",
    "footer.title": "Do you have a project or question?",
  },
};

function getSavedLanguage() {
  try {
    const savedLanguage = localStorage.getItem(languageStorageKey);
    return copy[savedLanguage] ? savedLanguage : "ru";
  } catch {
    return "ru";
  }
}

function saveLanguage(language) {
  try {
    localStorage.setItem(languageStorageKey, language);
  } catch {
    // Ignore storage failures and keep the in-page language switch working.
  }
}

function setLanguageControls(language) {
  if (languageSwitch) {
    languageSwitch.dataset.active = language;
  }

  for (const item of languageOptions) {
    const isActive = item.textContent.trim().toLowerCase() === language;
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-pressed", String(isActive));
  }
}

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

// Мягкая смена текста при переключении языка — только для видимых элементов
function softSwap(element) {
  if (!element.animate || element.closest(".nav-pill, .language-switch")) return;
  const rect = element.getBoundingClientRect();
  if (!rect.width || rect.bottom < 0 || rect.top > window.innerHeight) return;
  if (Number(getComputedStyle(element).opacity) === 0) return;
  element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
}

function applyLanguage(language, { persist = false } = {}) {
  if (!copy[language]) return;

  currentLanguage = language;
  document.documentElement.lang = language;
  setLanguageControls(language);

  if (persist) {
    saveLanguage(language);
  }

  for (const element of i18nElements) {
    const key = element.dataset.i18n;
    const value = copy[language][key];
    if (!value) continue;

    const changed = element.textContent !== value;
    setElementText(element, value);
    if (changed && !element.matches("[data-soft-blur]")) softSwap(element);

    if (element.matches("[data-soft-blur]")) {
      startSoftBlurText(element);
    }
  }

  for (const element of document.querySelectorAll("[data-ru]")) {
    const next = element.dataset[language] || element.dataset.ru;
    if (element.textContent === next) continue;
    element.textContent = next;
    softSwap(element);
  }

  if (aboutPanel) {
    aboutPanel.setAttribute("aria-label", copy[language]["nav.about"]);
  }

  for (const section of workSections) {
    const state = workCarouselState.get(section);
    updateWorkSection(section, state?.activeIndex || getWorkActiveIndex(section), { animate: false });
  }

  requestAnimationFrame(updateNavIndicator);
}

function animateNavLanguageChange(language) {
  clearTimeout(navLanguageTimer);

  if (!navPill || isMobileNav() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    applyLanguage(language, { persist: true });
    return;
  }

  const initialWidth = navPill.offsetWidth;
  const collapsedWidth = Math.max(132, initialWidth * 0.66);

  navPill.classList.remove("is-language-expanding");
  navPill.style.width = `${initialWidth}px`;
  navPill.offsetWidth;
  navPill.classList.add("is-language-collapsing");
  navPill.style.width = `${collapsedWidth}px`;

  navLanguageTimer = window.setTimeout(() => {
    applyLanguage(language, { persist: true });
    const targetWidth = navPill.scrollWidth;

    navPill.classList.remove("is-language-collapsing");
    navPill.classList.add("is-language-expanding");
    navPill.style.width = `${targetWidth}px`;
    updateNavIndicator();

    navLanguageTimer = window.setTimeout(() => {
      navPill.classList.remove("is-language-expanding");
      navPill.style.width = "";
      updateNavIndicator();
    }, 520);
  }, 240);
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

applyLanguage(getSavedLanguage());
requestAnimationFrame(() => {
  languageSwitch?.classList.add("is-ready");
});

function resetHomeState() {
  updateDisplayScale();
  closeAboutPanel({ immediate: true });

  for (const item of navLinks) {
    item.classList.remove("is-active");
  }
  updateNavIndicator();

  history.replaceState(null, "", location.pathname);
  window.scrollTo(0, 0);
}

window.addEventListener("pageshow", () => {
  if (isHomePage && location.hash) {
    updateDisplayScale();
    const target = document.querySelector(location.hash);
    if (target) requestAnimationFrame(() => target.scrollIntoView());
    return;
  }

  if (isHomePage) {
    resetHomeState();
    return;
  }

  updateDisplayScale();
  setRouteNavActive();
});

if (logoLink) {
  logoLink.addEventListener("pointerenter", () => {
    logoLink.classList.add("is-hovered");
  });

  logoLink.addEventListener("pointerleave", () => {
    logoLink.classList.remove("is-hovered");
  });

  logoLink.addEventListener("click", (event) => {
    event.preventDefault();
    if (isHomePage) {
      resetHomeState();
      location.reload();
      return;
    }

    location.href = "./";
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
  setAboutRevealPositions();

  requestAnimationFrame(() => {
    aboutPanel.classList.add("is-visible", "is-opening");
    aboutCloseTimer = setTimeout(() => {
      aboutPanel.classList.remove("is-opening");
    }, aboutMotionMs);
  });
}

// Положение каждого блока по высоте панели (0 — верх, 1 — низ),
// чтобы текст появлялся и исчезал вместе с краем раскрывающейся панели.
function setAboutRevealPositions() {
  const panelRect = aboutPanel.getBoundingClientRect();
  const height = panelRect.height || 1;
  for (const element of aboutRevealElements) {
    const rect = element.getBoundingClientRect();
    const pos = Math.min(1, Math.max(0, (rect.top + rect.height / 2 - panelRect.top) / height));
    element.style.setProperty("--about-pos", pos.toFixed(3));
  }
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
  const wasActive = navPill.classList.contains("has-active");
  navPill.classList.toggle("has-active", Boolean(activeLink));

  if (!activeLink) {
    navPill.classList.add("is-ready");
    return;
  }

  const navRect = navPill.getBoundingClientRect();
  const linkRect = activeLink.getBoundingClientRect();
  const scale = getDisplayScale();
  const activeX = (linkRect.left - navRect.left + navPill.scrollLeft) / scale;

  navPill.style.setProperty("--nav-active-x", `${activeX}px`);
  if (!wasActive) navPill.classList.add("is-indicator-entering");
  navPill.style.setProperty("--nav-active-width", `${linkRect.width / scale}px`);
  navPill.classList.add("is-ready");
  if (!wasActive) {
    requestAnimationFrame(() => requestAnimationFrame(() => navPill.classList.remove("is-indicator-entering")));
  }
}

const homeSections = isHomePage ? [...document.querySelectorAll(".home-projects[id], .footer-screen[id]")] : [];

for (const link of navLinks) {
  if (!link.getAttribute("href").endsWith("#contact")) continue;
  link.addEventListener("click", (event) => {
    const target = document.getElementById("contact");
    if (!target || isHomePage) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
  });
}

function getHomeSectionHref() {
  const line = window.innerHeight * 0.4;
  const current = homeSections.find((section) => {
    const rect = section.getBoundingClientRect();
    return rect.top <= line && rect.bottom > line;
  });
  return current ? `./#${current.id}` : "";
}

function getRouteActiveHref() {
  if (isHomePage) return getHomeSectionHref();
  const route = document.body.dataset.route;
  if (route === "projects" || route === "canvas") return `./#${route}`;
  if (route === "cv") return "./cv";
  return "";
}

let homeSpyFrame;
window.addEventListener("scroll", () => {
  if (!homeSections.length || homeSpyFrame) return;
  homeSpyFrame = requestAnimationFrame(() => {
    homeSpyFrame = null;
    if (aboutPanel && !aboutPanel.hidden) return;
    setRouteNavActive();
  });
});

function setRouteNavActive() {
  const routeHref = getRouteActiveHref();

  for (const item of navLinks) {
    item.classList.toggle("is-active", Boolean(routeHref) && item.getAttribute("href") === routeHref);
  }

  updateNavIndicator();
}

function scheduleAboutClose() {
  clearTimeout(aboutHoverCloseTimer);
  aboutHoverCloseTimer = setTimeout(() => {
    closeAboutPanel();
    setRouteNavActive();
  }, 120);
}

function cancelAboutClose() {
  clearTimeout(aboutHoverCloseTimer);
}

function openAboutFromHover() {
  if (!aboutPanel) return;

  cancelAboutClose();
  setRouteNavActive();
  openAboutPanel();
}

for (const option of languageOptions) {
  option.addEventListener("click", () => {
    const language = option.textContent.trim().toLowerCase();
    if (language === currentLanguage) return;

    if (languageSwitch) {
      languageSwitch.dataset.active = language;
    }

    for (const item of languageOptions) {
      const isActive = item === option;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    }

    animateNavLanguageChange(language);
  });
}

function setMenuOpen(open) {
  document.body.classList.toggle("is-menu-open", open);
  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? (currentLanguage === "en" ? "Close menu" : "Закрыть меню") : (currentLanguage === "en" ? "Menu" : "Меню"));
  }
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const open = !document.body.classList.contains("is-menu-open");
    if (open) closeAboutPanel();
    setMenuOpen(open);
  });
}

mobileNavQuery.addEventListener?.("change", () => setMenuOpen(false));

if (aboutCloseButton) {
  aboutCloseButton.addEventListener("click", () => {
    closeAboutPanel();
    setRouteNavActive();
  });
}

function setAboutNavActive() {
  for (const item of navLinks) {
    item.classList.toggle("is-active", item.dataset.panel === "about");
  }
  updateNavIndicator();
}

for (const link of navLinks) {
  link.addEventListener("click", (event) => {
    if (isMobileNav()) setMenuOpen(false);
    if (link.target === "_blank") return;
    const opensAbout = link.dataset.panel === "about";

    if (opensAbout) {
      event.preventDefault();
      cancelAboutClose();
      if (isAboutPanelOpen() && !aboutPanel.classList.contains("is-closing")) {
        closeAboutPanel();
        setRouteNavActive();
      } else {
        openAboutPanel();
        setAboutNavActive();
      }
    } else {
      closeAboutPanel();
      for (const item of navLinks) {
        item.classList.toggle("is-active", item === link);
      }
      updateNavIndicator();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("is-menu-open")) setMenuOpen(false);
  if (event.key !== "Escape" || !aboutPanel || aboutPanel.hidden) return;

  closeAboutPanel();
  setRouteNavActive();
});

document.addEventListener("pointerdown", (event) => {
  if (
    document.body.classList.contains("is-menu-open") &&
    !event.target.closest(".nav-pill, .menu-toggle")
  ) {
    setMenuOpen(false);
  }
  if (!aboutPanel || aboutPanel.hidden) return;
  if (aboutPanel.contains(event.target)) return;
  if (event.target.closest(".nav-pill")) return;

  closeAboutPanel();
  setRouteNavActive();
});

window.addEventListener("resize", () => {
  updateDisplayScale();
  for (const section of workSections) {
    const state = workCarouselState.get(section);
    updateWorkSection(section, state?.activeIndex || 0, { animate: false });
  }
  updateNavIndicator();
});

window.addEventListener("scroll", () => {
  if (workScrollFrame) return;

  workScrollFrame = requestAnimationFrame(() => {
    for (const section of workSections) {
      const rect = section.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const state = workCarouselState.get(section);
        updateWorkSection(section, state?.activeIndex || 0, { animate: false });
      }
    }

    workScrollFrame = null;
  });
});

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

function getWorkStep(section) {
  const firstCard = section.querySelector(".work-card");
  const styles = getComputedStyle(section);
  const gap = Number.parseFloat(styles.getPropertyValue("--work-card-gap")) || 10;

  return firstCard ? firstCard.offsetHeight + gap : 460;
}

function getWorkCardText(card, key) {
  const languageKey = currentLanguage === "en" ? `${key}En` : key;
  return card.dataset[languageKey] || card.dataset[key] || "";
}

function updateWorkMeta(section, activeCard) {
  const title = section.querySelector("[data-work-title]");
  const subtitle = section.querySelector("[data-work-subtitle]");
  const primary = section.querySelector("[data-work-primary]");
  const secondary = section.querySelector("[data-work-secondary]");

  if (title) title.textContent = getWorkCardText(activeCard, "title");

  if (subtitle) {
    const subtitleText = getWorkCardText(activeCard, "subtitle");
    subtitle.textContent = subtitleText;
    subtitle.hidden = !subtitleText;
  }

  if (primary) {
    const primaryText = getWorkCardText(activeCard, "primaryLabel");
    primary.textContent = primaryText;
    primary.hidden = !primaryText;
    primary.setAttribute("href", activeCard.dataset.primaryHref || "#");
  }

  if (secondary) {
    const secondaryText = getWorkCardText(activeCard, "secondaryLabel");
    secondary.textContent = secondaryText;
    secondary.hidden = !secondaryText;
    secondary.setAttribute("href", activeCard.dataset.secondaryHref || "#");
  }

  if (primary?.parentElement) {
    const hasPrimaryAction = !primary.hidden && Boolean(primary.textContent);
    const hasSecondaryAction = Boolean(secondary && !secondary.hidden && secondary.textContent);
    primary.parentElement.classList.toggle("has-single-action", hasPrimaryAction && !hasSecondaryAction);
  }
}

function getWorkCards(section) {
  return Array.from(section.querySelectorAll(".work-card"));
}

function getWorkActiveIndex(section) {
  const carousel = section.querySelector("[data-work-carousel]");
  if (!carousel) return 0;

  return Math.round(carousel.scrollTop / getWorkStep(section));
}

function clampWorkIndex(section, index) {
  const cards = getWorkCards(section);
  return Math.min(cards.length - 1, Math.max(0, index));
}

function getWorkSnapTop(section, index) {
  return clampWorkIndex(section, index) * getWorkStep(section);
}

function updateWorkSection(section, activeIndex = getWorkActiveIndex(section), { animate = true } = {}) {
  const carousel = section.querySelector("[data-work-carousel]");
  const cards = getWorkCards(section);
  const state = workCarouselState.get(section);
  const safeActiveIndex = clampWorkIndex(section, activeIndex);
  const activeCard = cards[safeActiveIndex];
  const shouldAnimateMeta = animate && state?.renderedActiveIndex !== safeActiveIndex;

  if (!cards.length || !activeCard) return;

  if (carousel && !animate) {
    carousel.scrollTop = getWorkSnapTop(section, safeActiveIndex);
  }

  cards.forEach((card, index) => {
    const depthDirection = Math.sign(index - safeActiveIndex);
    const depthDistance = Math.abs(index - safeActiveIndex);
    const depthFactor = depthDirection < 0 ? 0.07 : 0.09;
    const depthStackCompensation = depthDirection < 0 ? 0.02 : 0.029;
    const depthOffset =
      card.offsetHeight *
      (depthDistance * depthFactor + depthDistance * Math.max(0, depthDistance - 1) * depthStackCompensation);

    card.classList.toggle("is-active", index === safeActiveIndex);
    card.classList.toggle("is-before", index < safeActiveIndex);
    card.classList.toggle("is-after", index > safeActiveIndex);
    card.style.setProperty("--work-depth-offset", `${depthOffset}px`);
  });

  updateWorkMeta(section, activeCard);

  if (state) {
    state.renderedActiveIndex = safeActiveIndex;
  }

  if (shouldAnimateMeta) {
    clearTimeout(state?.metaTimer);
    section.classList.remove("is-updating");
    requestAnimationFrame(() => {
      section.classList.add("is-updating");
    });

    const metaTimer = window.setTimeout(() => {
      section.classList.remove("is-updating");
      if (state) state.metaTimer = 0;
    }, workMetaMotionMs);

    if (state) state.metaTimer = metaTimer;
  }
}

function setWorkActive(section, nextIndex, { smooth = true } = {}) {
  const carousel = section.querySelector("[data-work-carousel]");
  const state = workCarouselState.get(section);
  if (!carousel || !state) return;

  const activeIndex = clampWorkIndex(section, nextIndex);
  const top = getWorkSnapTop(section, activeIndex);

  state.activeIndex = activeIndex;
  state.isSnapping = smooth;
  window.clearTimeout(state.snapTimer);
  window.clearTimeout(state.snapEndTimer);
  carousel.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
  updateWorkSection(section, activeIndex);

  if (smooth) {
    state.snapEndTimer = window.setTimeout(() => {
      state.isSnapping = false;
    }, workSnapMotionMs);
  }
}

function snapWorkToNearest(section, { smooth = true } = {}) {
  const carousel = section.querySelector("[data-work-carousel]");
  const state = workCarouselState.get(section);
  if (!carousel || !state) return;

  const activeIndex = clampWorkIndex(section, getWorkActiveIndex(section));
  const targetTop = getWorkSnapTop(section, activeIndex);

  state.activeIndex = activeIndex;
  updateWorkSection(section, activeIndex);

  if (Math.abs(carousel.scrollTop - targetTop) <= 1) return;

  state.isSnapping = true;
  carousel.scrollTo({ top: targetTop, behavior: smooth ? "smooth" : "auto" });
  window.clearTimeout(state.snapEndTimer);
  state.snapEndTimer = window.setTimeout(() => {
    state.isSnapping = false;
  }, workSnapMotionMs);
}

function scheduleWorkSnap(section) {
  const state = workCarouselState.get(section);
  if (!state || state.isDragging || state.isSnapping) return;

  window.clearTimeout(state.snapTimer);
  state.snapTimer = window.setTimeout(() => {
    snapWorkToNearest(section);
  }, workSnapDelayMs);
}

function startWorkDrag(section, event) {
  const carousel = section.querySelector("[data-work-carousel]");
  const state = workCarouselState.get(section);
  if (!carousel || !state || event.button !== 0) return;

  state.isDragging = true;
  state.hasDragged = false;
  state.dragStartY = event.clientY;
  state.dragStartScrollTop = carousel.scrollTop;
  window.clearTimeout(state.snapTimer);
  carousel.classList.add("is-dragging");
  carousel.setPointerCapture?.(event.pointerId);
}

function moveWorkDrag(section, event) {
  const carousel = section.querySelector("[data-work-carousel]");
  const state = workCarouselState.get(section);
  if (!carousel || !state?.isDragging) return;

  const deltaY = state.dragStartY - event.clientY;

  if (Math.abs(deltaY) > 3) {
    state.hasDragged = true;
  }

  carousel.scrollTop = state.dragStartScrollTop + deltaY;
  event.preventDefault();
}

function endWorkDrag(section, event) {
  const carousel = section.querySelector("[data-work-carousel]");
  const state = workCarouselState.get(section);
  if (!carousel || !state?.isDragging) return;

  state.isDragging = false;
  carousel.classList.remove("is-dragging");
  carousel.releasePointerCapture?.(event.pointerId);

  if (state.hasDragged) {
    state.suppressClick = true;
    window.setTimeout(() => {
      state.suppressClick = false;
    }, 120);
  }

  snapWorkToNearest(section);
}

function initWorkSections() {
  if (!workSections.length) return;

  for (const section of workSections) {
    const cards = getWorkCards(section);
    const carousel = section.querySelector("[data-work-carousel]");
    const state = { activeIndex: 0, scrollFrame: 0, snapTimer: 0, snapEndTimer: 0, isDragging: false };

    workCarouselState.set(section, state);
    updateWorkSection(section, 0, { animate: false });

    cards.forEach((card, index) => {
      card.addEventListener("click", () => {
        setWorkActive(section, index);
      });
    });

    carousel?.addEventListener(
      "click",
      (event) => {
        if (!state.suppressClick) return;
        event.preventDefault();
        event.stopPropagation();
      },
      true,
    );

    carousel?.addEventListener("pointerdown", (event) => startWorkDrag(section, event));
    carousel?.addEventListener("pointermove", (event) => moveWorkDrag(section, event));
    carousel?.addEventListener("pointerup", (event) => endWorkDrag(section, event));
    carousel?.addEventListener("pointercancel", (event) => endWorkDrag(section, event));
    carousel?.addEventListener("lostpointercapture", (event) => endWorkDrag(section, event));

    carousel?.addEventListener("scroll", () => {
      if (state.scrollFrame) return;

      state.scrollFrame = requestAnimationFrame(() => {
        const activeIndex = clampWorkIndex(section, getWorkActiveIndex(section));

        if (activeIndex !== state.activeIndex) {
          state.activeIndex = activeIndex;
          updateWorkSection(section, activeIndex);
        }

        scheduleWorkSnap(section);
        state.scrollFrame = 0;
      });
    });
  }
}

initWorkSections();

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function pickFooterArtifactSize() {
  const viewportScale = Math.min(2, Math.max(0.72, getDisplayScale()));
  const sizes = [132, 156, 184, 216, 252, 292, 328];
  return sizes[Math.floor(Math.random() * sizes.length)] * viewportScale * footerArtifactSizeMultiplier;
}

function pickFooterArtifactNumber() {
  const visibleArtifacts = Array.from(footerArtifactsLayer?.querySelectorAll("img") || [])
    .map((image) => Number(image.getAttribute("src")?.match(/artifact-(\d+)/)?.[1]))
    .filter(Boolean)
    .slice(-footerArtifactRepeatGap);
  const blockedArtifacts = new Set([...recentFooterArtifacts, ...visibleArtifacts]);
  const allowedArtifacts = [];

  for (let index = 1; index <= footerArtifactCount; index += 1) {
    const preloadedImage = footerArtifactImages.get(index);

    if (!blockedArtifacts.has(index) && preloadedImage?.complete && preloadedImage.naturalWidth > 0) {
      allowedArtifacts.push(index);
    }
  }

  if (!allowedArtifacts.length) return null;

  const pool = allowedArtifacts;
  const artifactNumber = pool[Math.floor(Math.random() * pool.length)];

  recentFooterArtifacts.push(artifactNumber);
  while (recentFooterArtifacts.length > footerArtifactRepeatGap) {
    recentFooterArtifacts.shift();
  }

  return artifactNumber;
}

function getFooterArtifactSafeZone(footerRect) {
  if (!footerMessage) return null;

  const messageRect = footerMessage.getBoundingClientRect();
  const horizontalPadding = messageRect.width * 0.1;
  const verticalPadding = messageRect.height * 0.1;

  return {
    left: messageRect.left - footerRect.left - horizontalPadding,
    right: messageRect.right - footerRect.left + horizontalPadding,
    top: messageRect.top - footerRect.top - verticalPadding,
    bottom: messageRect.bottom - footerRect.top + verticalPadding,
  };
}

function rectanglesOverlap(first, second) {
  return first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getFooterArtifactBounds(x, y, size, driftX = 0, driftY = 0) {
  const popOverflow = ((footerArtifactPopScale - 1) * size) / 2;

  return {
    left: Math.min(x, x + driftX) - popOverflow,
    right: Math.max(x + size, x + driftX + size) + popOverflow,
    top: Math.min(y, y + driftY) - popOverflow,
    bottom: Math.max(y + size, y + driftY + size) + popOverflow,
  };
}

function pickFooterArtifactPosition(event, footerRect, size) {
  const safeZone = getFooterArtifactSafeZone(footerRect);
  const baseX = event.clientX - footerRect.left - size / 2;
  const baseY = event.clientY - footerRect.top - size / 2;
  const minX = -size * 0.58;
  const maxX = footerRect.width - size * 0.42;
  const minY = -size * 0.58;
  const maxY = footerRect.height - size * 0.42;

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const spread = attempt < 10 ? 1 : 2.3;
    const x = clamp(baseX + randomBetween(-220 * spread, 220 * spread), minX, maxX);
    const y = clamp(baseY + randomBetween(-180 * spread, 180 * spread), minY, maxY);
    const driftX = randomBetween(-42, 42);
    const driftY = randomBetween(-50, 34);
    const bounds = getFooterArtifactBounds(x, y, size, driftX, driftY);

    if (!safeZone || !rectanglesOverlap(bounds, safeZone)) {
      return { x, y, driftX, driftY };
    }
  }

  if (safeZone) {
    const verticalCandidates = [
      { x: clamp(baseX, minX, maxX), y: safeZone.top - size - 24 },
      { x: clamp(baseX, minX, maxX), y: safeZone.bottom + 24 },
    ].filter((position) => position.y >= minY && position.y <= maxY);
    const horizontalCandidates = [
      { x: safeZone.left - size - 24, y: clamp(baseY, minY, maxY) },
      { x: safeZone.right + 24, y: clamp(baseY, minY, maxY) },
    ].filter((position) => position.x >= minX && position.x <= maxX);
    const candidates = [...verticalCandidates, ...horizontalCandidates];

    if (candidates.length) {
      candidates.sort((first, second) => {
        const firstDistance = Math.hypot(first.x - baseX, first.y - baseY);
        const secondDistance = Math.hypot(second.x - baseX, second.y - baseY);
        return firstDistance - secondDistance;
      });

      for (const candidate of candidates) {
        const driftX = randomBetween(-42, 42);
        const driftY = randomBetween(-50, 34);
        const bounds = getFooterArtifactBounds(candidate.x, candidate.y, size, driftX, driftY);

        if (!rectanglesOverlap(bounds, safeZone)) {
          return { ...candidate, driftX, driftY };
        }
      }
    }
  }

  return null;
}

function createFooterArtifact(event) {
  if (!footerScreen || !footerArtifactsLayer) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const now = Date.now();
  if (now - lastFooterArtifactAt < footerArtifactIntervalMs) return;
  lastFooterArtifactAt = now;

  const rect = footerScreen.getBoundingClientRect();
  const size = pickFooterArtifactSize();
  const position = pickFooterArtifactPosition(event, rect, size);
  if (!position) return;

  const { x, y, driftX, driftY } = position;
  const artifactNumber = pickFooterArtifactNumber();
  if (!artifactNumber) return;

  const duration = Math.round(randomBetween(1450, 2300));
  const rotation = randomBetween(-13, 13);

  const artifact = document.createElement("figure");
  artifact.className = "footer-artifact";
  artifact.style.setProperty("--artifact-size", `${size}px`);
  artifact.style.setProperty("--artifact-x", `${x}px`);
  artifact.style.setProperty("--artifact-y", `${y}px`);
  artifact.style.setProperty("--artifact-drift-x", `${driftX}px`);
  artifact.style.setProperty("--artifact-drift-y", `${driftY}px`);
  artifact.style.setProperty("--artifact-rotate", `${rotation}deg`);
  artifact.style.setProperty("--artifact-duration", `${duration}ms`);
  artifact.style.zIndex = String((footerArtifactIndex % 5) + 1);

  const image = document.createElement("img");
  image.src = getFooterArtifactSrc(artifactNumber);
  image.alt = "";
  image.decoding = "async";
  image.draggable = false;

  artifact.append(image);
  footerArtifactsLayer.append(artifact);
  footerArtifactIndex += 1;

  while (footerArtifactsLayer.children.length > footerArtifactMaxActive) {
    footerArtifactsLayer.firstElementChild.remove();
  }

  window.setTimeout(() => {
    artifact.remove();
  }, duration + 120);
}

if (footerScreen && footerArtifactsLayer) {
  footerScreen.addEventListener("pointermove", createFooterArtifact);
}

// Hero logo marquee width follows the nav pill
(() => {
  const marquee = document.querySelector(".logo-marquee");
  const pill = document.querySelector(".nav-pill");
  if (!marquee || !pill) return;
  const sync = () => {
    const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--display-scale")) || 1;
    marquee.style.setProperty("--marquee-w", `${Math.round(pill.offsetWidth / scale)}px`);
  };
  sync();
  window.addEventListener("resize", sync);
  if ("ResizeObserver" in window) new ResizeObserver(sync).observe(pill);
})();
