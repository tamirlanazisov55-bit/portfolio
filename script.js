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
const footerScreen = document.querySelector(".footer-screen");
const footerArtifactsLayer = document.querySelector(".footer-artifacts");
const footerMessage = document.querySelector(".footer-message");
const softBlurTexts = document.querySelectorAll("[data-soft-blur]");
const i18nElements = document.querySelectorAll("[data-i18n]");
const aboutRevealElements = aboutPanel ? aboutPanel.querySelectorAll("h2, p, .action-list button") : [];
const aboutMotionMs = 420;
const aboutCloseMotionMs = 380;
const displayReferenceWidth = 1440;
const displayReferenceHeight = 810;
const displayMaxScale = 2;
const heroWideOffsetMinWidth = 1920;
const heroWideOffsetMinHeight = 1080;
const heroWideOffset = 100;
const footerArtifactCount = 18;
const footerArtifactMaxActive = 7;
const footerArtifactIntervalMs = 180;
const footerArtifactRepeatGap = 7;
const footerArtifactSizeMultiplier = 1.5;
const footerArtifactPopScale = 1.2;
let aboutCloseTimer;
let aboutHoverCloseTimer;
let currentLanguage = "ru";
let lastFooterArtifactAt = 0;
let footerArtifactIndex = 0;
const recentFooterArtifacts = [];

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
  document.documentElement.style.setProperty(
    "--hero-translate-y",
    shouldOffsetHero ? `calc(-50% + ${heroWideOffset}px)` : "0px",
  );
  document.documentElement.style.setProperty("--hero-transform-origin", shouldOffsetHero ? "center" : "top center");
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
  updateDisplayScale();
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
  const scale = getDisplayScale();
  const activeX = (linkRect.left - navRect.left + navPill.scrollLeft) / scale;

  navPill.style.setProperty("--nav-active-x", `${activeX}px`);
  navPill.style.setProperty("--nav-active-width", `${linkRect.width / scale}px`);
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

window.addEventListener("resize", () => {
  updateDisplayScale();
  updateNavIndicator();
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
    if (!blockedArtifacts.has(index)) {
      allowedArtifacts.push(index);
    }
  }

  const pool = allowedArtifacts.length ? allowedArtifacts : Array.from({ length: footerArtifactCount }, (_, index) => index + 1);
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
  const scale = getDisplayScale();
  const horizontalPadding = 260 * scale;
  const verticalPadding = 180 * scale;

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
  image.src = `./assets/footer-artifacts/artifact-${String(artifactNumber).padStart(2, "0")}.png`;
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
