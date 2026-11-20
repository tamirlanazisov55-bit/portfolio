(() => {
  const cases = window.CASES || [];
  const BEHANCE = "https://mir-s3-cdn-cf.behance.net/project_modules/";

  const ui = {
    case: { ru: "Кейс", en: "Case" },
    back: { ru: "Проекты", en: "Projects" },
    backCanvas: { ru: "Холст", en: "Canvas" },
    year: { ru: "Год", en: "Year" },
    role: { ru: "Роль", en: "Role" },
    client: { ru: "Клиент", en: "Client" },
    scope: { ru: "Задачи", en: "Scope" },
    links: { ru: "Ссылки", en: "Links" },
    website: { ru: "Сайт", en: "Website" },
    team: { ru: "Команда", en: "Team" },
    next: { ru: "Следующий проект", en: "Next project" },
    soon: {
      ru: "Подробный кейс готовится — пока можно посмотреть живой сайт.",
      en: "A detailed case study is on the way — meanwhile, check out the live website.",
    },
  };

  const pick = (value, lang = "ru") => (value && typeof value === "object" && !Array.isArray(value) ? value[lang] : value) || "";

  function el(tag, className, attrs = {}) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    for (const [key, value] of Object.entries(attrs)) {
      if (value !== undefined && value !== null && value !== "") node.setAttribute(key, value);
    }
    return node;
  }

  // Текст с переводом: script.js переключает data-ru / data-en при смене языка.
  function i18n(tag, className, value) {
    const node = el(tag, className);
    const ru = pick(value, "ru");
    const en = pick(value, "en") || ru;
    node.dataset.ru = ru;
    node.dataset.en = en;
    node.textContent = ru;
    return node;
  }

  function resolveSrc(src) {
    if (/^(https?:)?\/\//.test(src) || src.startsWith("./") || src.startsWith("/")) return src;
    return BEHANCE + src;
  }

  function behanceSrcset(src) {
    const match = src.match(/^max_3840_webp\/(.+)$/);
    if (!match) return "";
    return `${BEHANCE}fs_webp/${match[1]} 1920w, ${BEHANCE}max_3840_webp/${match[1]} 3840w`;
  }

  function mediaImage(src, { eager = false, alt = "" } = {}) {
    const img = el("img", "case-media-img", {
      src: resolveSrc(src),
      srcset: behanceSrcset(src),
      sizes: "(max-width: 760px) 100vw, 92vw",
      alt,
      loading: eager ? "eager" : "lazy",
      decoding: "async",
    });
    const markLoaded = () => img.classList.add("is-loaded");
    if (img.complete && img.naturalWidth) markLoaded();
    else img.addEventListener("load", markLoaded, { once: true });
    return img;
  }

  function mediaVideo(item) {
    const [, id, ratio = "1.778"] = item.split(":");
    const wrap = el("div", "case-media-video");
    wrap.style.aspectRatio = ratio;
    const iframe = el("iframe", "", {
      src: `https://player.vimeo.com/video/${id}?background=1&autoplay=1&loop=1&muted=1&dnt=1`,
      allow: "autoplay; fullscreen; picture-in-picture",
      loading: "lazy",
      title: "Video",
    });
    wrap.append(iframe);
    return wrap;
  }

  function renderMediaItem(item, index, title) {
    if (typeof item === "object" && item.type === "pair") {
      const row = el("div", "case-media-pair");
      item.items.forEach((src) => row.append(mediaImage(src, { alt: title })));
      return row;
    }
    if (item.startsWith("v:")) return mediaVideo(item);
    return mediaImage(item, { eager: index < 2, alt: index === 0 ? title : "" });
  }

  /* ---------- Страница «Проекты» ---------- */

  function renderGrid(root) {
    const section = root.dataset.casesGrid || "projects";
    const list = cases.filter((item) => (item.sections || ["projects"]).includes(section));
    const count = document.querySelector(`[data-cases-count="${section}"]`) || document.querySelector("[data-cases-count]");
    if (count) count.textContent = String(list.length).padStart(2, "0");

    for (const item of list) {
      const card = el("a", "project-card", { href: `./cases/${item.slug}.html` });

      const media = el("div", "project-card-media");
      media.append(el("img", "project-card-cover", { src: item.cover, alt: item.title, loading: "lazy", decoding: "async" }));
      if (item.hover) {
        media.classList.add("has-hover");
        media.append(el("img", "project-card-hover", { src: resolveSrc(item.hover), alt: "", loading: "lazy", decoding: "async", "aria-hidden": "true" }));
      }
      media.append(i18n("span", "project-card-cta type-button", ui.case));

      const head = el("div", "project-card-head");
      const name = el("h2", "type-body-s");
      name.textContent = item.title;
      const year = el("span", "type-body-s project-card-year");
      year.textContent = item.year;
      head.append(name, year);

      card.append(media, head, i18n("p", "type-body-s project-card-subtitle", item.subtitle));
      root.append(card);
    }
  }

  /* ---------- Страница кейса ---------- */

  function metaRow(label, valueNode) {
    const row = el("div", "case-meta-row");
    row.append(i18n("dt", "type-body-s", label));
    const dd = el("dd", "type-body-s");
    dd.append(valueNode);
    row.append(dd);
    return row;
  }

  function textNode(value) {
    return typeof value === "object" ? i18n("span", "", value) : document.createTextNode(value);
  }

  function renderCase(root, slug) {
    const index = cases.findIndex((item) => item.slug === slug);
    const item = cases[index];
    if (!item) {
      root.textContent = "Case not found";
      return;
    }

    // Hero
    const hero = el("section", "case-hero");
    const inProjects = (item.sections || ["projects"]).includes("projects");
    const back = el("a", "case-back type-button", { href: inProjects ? "./index.html#projects" : "./index.html#canvas" });
    const arrow = el("span", "case-back-arrow", { "aria-hidden": "true" });
    arrow.textContent = "←";
    back.append(arrow, i18n("span", "", inProjects ? ui.back : ui.backCanvas));
    const title = el("h1", "case-title");
    title.textContent = item.title;
    hero.append(back, title, i18n("p", "type-body-l case-subtitle", item.subtitle));

    // Info: summary + meta
    const info = el("section", "case-info");
    const summary = el("div", "case-summary");
    summary.append(i18n("p", "type-body-l", item.summary));
    if (item.media.length <= 1 && item.website) summary.append(i18n("p", "type-body-s case-note", ui.soon));

    const meta = el("dl", "case-meta");
    if (item.year) meta.append(metaRow(ui.year, document.createTextNode(item.year)));
    meta.append(metaRow(ui.role, textNode(item.role)));
    meta.append(metaRow(ui.client, textNode(item.client)));
    meta.append(
      metaRow(ui.scope, i18n("span", "", { ru: item.tags.ru.join(", "), en: item.tags.en.join(", ") }))
    );

    const links = el("span", "case-links");
    if (item.website) {
      const a = el("a", "case-link", { href: item.website, target: "_blank", rel: "noopener" });
      a.append(i18n("span", "", ui.website), document.createTextNode(" ↗"));
      links.append(a);
    }
    if (item.behance) {
      const a = el("a", "case-link", { href: item.behance, target: "_blank", rel: "noopener" });
      a.textContent = "Behance ↗";
      links.append(a);
    }
    if (links.childNodes.length) meta.append(metaRow(ui.links, links));
    info.append(summary, meta);

    // Media
    const media = el("section", "case-media");
    item.media.forEach((entry, i) => media.append(renderMediaItem(entry, i, item.title)));

    root.append(hero, info, media);

    // Credits
    if (item.credits && item.credits.length) {
      const credits = el("section", "case-credits");
      credits.append(i18n("h2", "type-body-l", ui.team));
      const list = el("dl", "case-credits-list");
      for (const [role, names] of item.credits) {
        const row = el("div", "case-meta-row");
        const dt = el("dt", "type-body-s");
        dt.textContent = role;
        const dd = el("dd", "type-body-s");
        dd.textContent = names;
        row.append(dt, dd);
        list.append(row);
      }
      credits.append(list);
      root.append(credits);
    }

    // Next project
    const group = cases.filter((entry) => (entry.sections || ["projects"]).includes(inProjects ? "projects" : "canvas"));
    const next = group[(group.indexOf(item) + 1) % group.length];
    if (next && next !== item) {
      const nav = el("nav", "case-next", { "aria-label": "Next project" });
      nav.append(i18n("p", "type-body-s case-next-label", ui.next));
      const card = el("a", "case-next-card", { href: `./cases/${next.slug}.html` });
      const text = el("div", "case-next-text");
      const nextTitle = el("span", "case-next-title");
      nextTitle.textContent = next.title;
      text.append(nextTitle, i18n("span", "type-body-l case-next-subtitle", next.subtitle));
      const thumb = el("div", "case-next-thumb");
      thumb.append(el("img", "", { src: next.cover, alt: next.title, loading: "lazy", decoding: "async" }));
      card.append(text, thumb);
      nav.append(card);
      root.append(nav);
    }

    document.title = `${item.title} — Азисов Тамирлан`;
  }

  document.querySelectorAll("[data-cases-grid]").forEach(renderGrid);

  const caseRoot = document.querySelector("[data-case-root]");
  if (caseRoot) renderCase(caseRoot, document.body.dataset.case);
})();
