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

  const isVideoFile = (src) => /\.mp4$/i.test(src);
  const posterOf = (src) => src.replace(/\.mp4$/i, ".jpg");

  const videoObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const video = entry.target;
          if (entry.isIntersecting) {
            if (!video.src) video.src = video.dataset.src;
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      }, { rootMargin: "200px 0px" })
    : null;

  function mediaFile(src) {
    const video = el("video", "case-media-file", { poster: resolveSrc(posterOf(src)), preload: "none", "aria-hidden": "true" });
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.dataset.src = resolveSrc(src);
    if (videoObserver) videoObserver.observe(video);
    else { video.src = video.dataset.src; video.autoplay = true; }
    return video;
  }

  function mediaSlider(item) {
    const root = el("div", "case-slider");
    const track = el("div", "case-slider-track");
    item.items.forEach((src) => {
      const slide = el("div", "case-slider-slide");
      slide.append(mediaImage(src, { alt: "" }));
      track.append(slide);
    });
    const bar = el("div", "case-slider-bar");
    if (item.title) bar.append(i18n("span", "case-slider-title", item.title));
    const controls = el("div", "case-slider-controls");
    const prev = el("button", "case-slider-btn", { type: "button", "aria-label": "Previous" });
    prev.textContent = "←";
    const counter = el("span", "case-slider-count");
    const next = el("button", "case-slider-btn", { type: "button", "aria-label": "Next" });
    next.textContent = "→";
    controls.append(prev, counter, next);
    bar.append(controls);
    root.append(track, bar);

    const total = item.items.length;
    const pad = (n) => String(n).padStart(2, "0");
    const current = () => Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    const update = () => {
      const i = current();
      counter.textContent = `${pad(i + 1)} / ${pad(total)}`;
      prev.disabled = i <= 0;
      next.disabled = i >= total - 1;
    };
    const go = (step) => track.scrollTo({ left: (current() + step) * track.clientWidth, behavior: "smooth" });
    prev.addEventListener("click", () => go(-1));
    next.addEventListener("click", () => go(1));
    track.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
    root.tabIndex = 0;
    root.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") { event.preventDefault(); go(-1); }
      if (event.key === "ArrowRight") { event.preventDefault(); go(1); }
    });
    update();
    return root;
  }

  function renderMediaItem(item, index, title) {
    if (typeof item === "object" && item.type === "slider") return mediaSlider(item);
    if (typeof item === "object" && item.type === "pair") {
      const row = el("div", "case-media-pair");
      item.items.forEach((src) => row.append(mediaImage(src, { alt: title })));
      return row;
    }
    if (isVideoFile(item)) return mediaFile(item);
    if (item.startsWith("v:")) return mediaVideo(item);
    return mediaImage(item, { eager: index < 2, alt: index === 0 ? title : "" });
  }

  // Сетка небольших картинок с увеличением по клику и слайдером
  function renderGrid3(entry) {
    const grid = el("section", "case-grid" + (entry.variant ? ` case-grid-${entry.variant}` : ""));
    if (entry.cols) grid.style.setProperty("--grid-cols", entry.cols);
    entry.items.forEach((src, index) => {
      const button = el("button", "case-grid-item", { type: "button", "aria-label": `${index + 1} / ${entry.items.length}` });
      button.append(mediaImage(src, { alt: "" }));
      button.addEventListener("click", () => openLightbox(entry.items, index));
      grid.append(button);
    });
    return grid;
  }

  // Personal films: posters only until a visitor explicitly opens the player.
  function renderFilmGrid(entry) {
    const grid = el("section", "case-film-grid", { "aria-label": "Video diary" });
    entry.items.forEach((film, index) => {
      const button = el("button", "case-film-tile" + (film.portrait ? " is-portrait" : "") + (index === 0 ? " is-featured" : ""), { type: "button" });
      const image = mediaImage(film.poster, { eager: index === 0, alt: "" });
      image.sizes = "(max-width: 560px) 100vw, (max-width: 1000px) 50vw, 65vw";
      const play = el("span", "case-film-play", { "aria-hidden": "true" });
      play.textContent = "▶";
      const label = i18n("span", "film-visually-hidden", { ru: `Воспроизвести видео: ${film.title.ru}`, en: `Play video: ${film.title.en}` });
      button.append(image, play, label);
      button.addEventListener("click", () => openFilmPlayer(entry.items, index, button));
      grid.append(button);
    });
    return grid;
  }

  function openFilmPlayer(films, start, trigger) {
    const lang = document.documentElement.lang === "en" ? "en" : "ru";
    const copy = (ru, en) => lang === "en" ? en : ru;
    const dialog = el("dialog", "film-player", { "aria-labelledby": "film-player-title" });
    const title = el("h2", "film-player-title film-visually-hidden", { id: "film-player-title" });
    const close = el("button", "film-player-button film-player-close", { type: "button", autofocus: "autofocus", "aria-label": copy("Закрыть", "Close") });
    close.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15"/></svg>';
    const stage = el("div", "film-player-media");
    const video = el("video", "film-player-video", { playsinline: "playsinline", preload: "none" });
    const toggle = el("button", "film-player-toggle", { type: "button", "aria-label": copy("Пауза", "Pause") });
    toggle.innerHTML = '<span aria-hidden="true">▶</span>';
    stage.append(video, toggle);
    const error = el("p", "film-player-error", { role: "status" });
    error.hidden = true;
    error.append(document.createTextNode(copy("Не удалось воспроизвести видео. ", "The video could not be played. ")));
    const direct = el("a", "", { target: "_blank", rel: "noopener" });
    direct.textContent = copy("Открыть файл", "Open video file");
    error.append(direct);
    const prev = el("button", "film-player-button film-player-prev", { type: "button", "aria-label": copy("Предыдущее", "Previous") });
    prev.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12 5-5 5 5 5"/></svg>';
    const next = el("button", "film-player-button film-player-next", { type: "button", "aria-label": copy("Следующее", "Next") });
    next.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m8 5 5 5-5 5"/></svg>';
    dialog.append(title, stage, close, prev, next, error);
    const syncPlayback = () => {
      stage.classList.toggle("is-playing", !video.paused && !video.ended);
      toggle.setAttribute("aria-label", video.paused || video.ended ? copy("Воспроизвести", "Play") : copy("Пауза", "Pause"));
    };
    toggle.addEventListener("click", () => {
      if (video.paused || video.ended) video.play().catch(syncPlayback);
      else video.pause();
    });
    ["play", "pause", "ended"].forEach((event) => video.addEventListener(event, syncPlayback));
    let current = start;
    const show = (index) => {
      current = (index + films.length) % films.length;
      const film = films[current];
      video.pause();
      error.hidden = true;
      title.textContent = pick(film.title, lang);
      dialog.classList.toggle("is-portrait", !!film.portrait);
      video.setAttribute("aria-label", title.textContent);
      video.poster = resolveSrc(film.poster);
      video.src = resolveSrc(film.src);
      direct.href = video.src;
      video.play().catch(syncPlayback);
    };
    close.addEventListener("click", () => dialog.close());
    prev.addEventListener("click", () => show(current - 1));
    next.addEventListener("click", () => show(current + 1));
    video.addEventListener("error", () => { error.hidden = false; });
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") { event.preventDefault(); show(current - 1); }
      if (event.key === "ArrowRight") { event.preventDefault(); show(current + 1); }
    });
    const previousOverflow = document.body.style.overflow;
    dialog.addEventListener("close", () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
      dialog.remove();
      document.body.style.overflow = previousOverflow;
      trigger.focus({ preventScroll: true });
    }, { once: true });
    document.body.append(dialog);
    document.body.style.overflow = "hidden";
    dialog.showModal();
    show(start);
  }

  function openLightbox(items, start = 0) {
    const list = Array.isArray(items) ? items : [items];
    let current = start;
    const box = el("div", "case-lightbox", { role: "dialog", "aria-modal": "true" });
    const stage = el("div", "case-lightbox-stage");
    const img = el("img", "", { src: resolveSrc(list[current]), alt: "" });
    stage.append(img);
    box.append(stage);
    const multi = list.length > 1;
    let counter;
    const show = (next) => {
      current = (next + list.length) % list.length;
      img.classList.remove("is-in");
      img.src = resolveSrc(list[current]);
      requestAnimationFrame(() => img.classList.add("is-in"));
      if (counter) counter.textContent = `${current + 1} / ${list.length}`;
      // предзагрузка соседей
      [current + 1, current - 1].forEach((i) => { const p = new Image(); p.src = resolveSrc(list[(i + list.length) % list.length]); });
    };
    if (multi) {
      const prev = el("button", "case-lightbox-btn case-lightbox-prev", { type: "button", "aria-label": "Previous" });
      prev.textContent = "←";
      const next = el("button", "case-lightbox-btn case-lightbox-next", { type: "button", "aria-label": "Next" });
      next.textContent = "→";
      counter = el("span", "case-lightbox-count");
      prev.addEventListener("click", (e) => { e.stopPropagation(); show(current - 1); });
      next.addEventListener("click", (e) => { e.stopPropagation(); show(current + 1); });
      box.append(prev, next, counter);
      let x0 = null;
      box.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
      box.addEventListener("touchend", (e) => {
        if (x0 === null) return;
        const dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
        x0 = null;
      });
    }
    const close = () => {
      box.classList.remove("is-open");
      document.removeEventListener("keydown", onKey);
      setTimeout(() => box.remove(), 250);
    };
    const onKey = (event) => {
      if (event.key === "Escape") close();
      if (multi && event.key === "ArrowRight") show(current + 1);
      if (multi && event.key === "ArrowLeft") show(current - 1);
    };
    img.addEventListener("click", (e) => { if (multi) { e.stopPropagation(); show(current + 1); } });
    box.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    document.body.append(box);
    show(current);
    requestAnimationFrame(() => box.classList.add("is-open"));
  }

  function renderArticle(item) {
    const wrap = el("section", "case-article");
    for (const block of item.article) {
      if (block.img) {
        const fig = el("figure", "case-article-figure");
        fig.append(isVideoFile(block.img) ? mediaFile(block.img) : mediaImage(block.img, { alt: "" }));
        if (block.cap) fig.append(i18n("figcaption", "type-body-s", block.cap));
        wrap.append(fig);
      } else if (block.h) {
        wrap.append(i18n("h2", "case-article-h", block.h));
      } else if (block.p) {
        wrap.append(i18n("p", "case-article-p", block.p));
      } else if (block.list) {
        const list = el("ul", "case-article-list");
        block.list.ru.forEach((text, i) => list.append(i18n("li", "", { ru: text, en: block.list.en[i] || text })));
        wrap.append(list);
      } else if (block.quote) {
        const quote = el("blockquote", "case-article-quote");
        quote.append(i18n("p", "", block.quote));
        if (block.by) quote.append(i18n("cite", "type-body-s", block.by));
        wrap.append(quote);
      }
    }
    return wrap;
  }

  /* ---------- Страница «Проекты» ---------- */

  /* ---------- Ленточки Behance ---------- */

  const RIBBONS = {
    "ui-ux": { color: "#ad9058", text: "UI", label: { ru: "Польз. интерфейс", en: "UI/UX" } },
    best: { color: "#004fff", text: "Bē", label: { ru: "Лучшее из Behance", en: "Best of Behance" } },
  };

  function ribbonBadges(item, className) {
    const keys = (item.ribbons || []).filter((key) => RIBBONS[key]);
    if (!keys.length) return null;
    const wrap = el("span", `ribbons ${className}`);
    for (const key of keys) {
      const ribbon = RIBBONS[key];
      const badge = el("span", "ribbon", { title: ribbon.label.ru, "aria-label": ribbon.label.ru });
      badge.style.setProperty("--ribbon-color", ribbon.color);
      badge.textContent = ribbon.text;
      wrap.append(badge);
    }
    return wrap;
  }

  function renderGrid(root) {
    const section = root.dataset.casesGrid || "projects";
    const list = cases.filter((item) => (item.sections || ["projects"]).includes(section));
    const count = document.querySelector(`[data-cases-count="${section}"]`) || document.querySelector("[data-cases-count]");
    if (count) count.textContent = String(list.length).padStart(2, "0");

    for (const item of list) {
      const card = el("a", "project-card", { href: `./cases/${item.slug}` });

      const media = el("div", "project-card-media");
      media.append(el("img", "project-card-cover", { src: resolveSrc(item.cover), alt: item.title, loading: "lazy", decoding: "async" }));
      if (item.hover && isVideoFile(item.hover)) {
        media.classList.add("has-hover");
        const video = el("video", "project-card-hover", { poster: resolveSrc(item.hoverPoster || posterOf(item.hover)), preload: "none", "aria-hidden": "true" });
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        media.append(video);
        card.addEventListener("pointerenter", () => {
          if (!video.src) video.src = resolveSrc(item.hover);
          video.play().catch(() => {});
        });
        card.addEventListener("pointerleave", () => video.pause());
      } else if (item.hover) {
        media.classList.add("has-hover");
        media.append(el("img", "project-card-hover", { src: resolveSrc(item.hover), alt: "", loading: "lazy", decoding: "async", "aria-hidden": "true" }));
      }
      const badges = ribbonBadges(item, "project-card-ribbons");
      if (badges) media.append(badges);
      if (item.chips && item.chips.ru.length) {
        const tags = el("div", "project-card-tags");
        item.chips.ru.forEach((label, i) => {
          const tag = i18n("span", "project-card-tag type-button", { ru: label, en: item.chips.en[i] || label });
          tag.style.setProperty("--tag-index", i);
          tags.append(tag);
        });
        media.append(tags);
      }

      const head = el("div", "project-card-head");
      const name = i18n("h2", "type-body-s", item.titleEn ? { ru: item.title, en: item.titleEn } : item.title);
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
    const back = el("a", "case-back type-button", { href: inProjects ? "./#projects" : "./#canvas" });
    const arrow = el("span", "case-back-arrow", { "aria-hidden": "true" });
    arrow.textContent = "←";
    back.append(arrow, i18n("span", "", inProjects ? ui.back : ui.backCanvas));
    const title = item.titleEn ? i18n("h1", "case-title", { ru: item.title, en: item.titleEn }) : el("h1", "case-title");
    if (!item.titleEn) title.textContent = item.title;
    const titleBadges = ribbonBadges(item, "case-title-ribbons");
    if (titleBadges) title.append(titleBadges);
    hero.append(back, title, i18n("p", "type-body-l case-subtitle", item.subtitle));

    // Info: summary + meta
    const info = el("section", "case-info");
    const summary = el("div", "case-summary");
    summary.append(i18n("p", "type-body-l", item.summary));
    if (!item.article && item.media.length <= 1 && item.website) summary.append(i18n("p", "type-body-s case-note", ui.soon));

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
    if (item.medium) {
      const a = el("a", "case-link", { href: item.medium, target: "_blank", rel: "noopener" });
      a.textContent = "Medium ↗";
      links.append(a);
    }
    if (item.telegram) {
      const a = el("a", "case-link", { href: item.telegram, target: "_blank", rel: "noopener" });
      a.textContent = "Telegram ↗";
      links.append(a);
    }
    if (links.childNodes.length) meta.append(metaRow(ui.links, links));
    const ribbonKeys = (item.ribbons || []).filter((key) => RIBBONS[key]);
    if (ribbonKeys.length) {
      const list = el("span", "case-ribbon-list");
      for (const key of ribbonKeys) {
        const row = el("span", "case-ribbon-item");
        const dot = el("span", "case-ribbon-dot", { "aria-hidden": "true" });
        dot.style.setProperty("--ribbon-color", RIBBONS[key].color);
        row.append(dot, i18n("span", "", RIBBONS[key].label));
        list.append(row);
      }
      meta.append(metaRow({ ru: "Behance", en: "Behance" }, list));
    }
    info.append(summary, meta);

    // Media
    const media = el("section", "case-media");
    const grids = [];
    item.media.forEach((entry, i) => {
      if (typeof entry === "object" && entry.type === "film-grid") grids.push(renderFilmGrid(entry));
      else if (typeof entry === "object" && entry.type === "grid") grids.push(renderGrid3(entry));
      else media.append(renderMediaItem(entry, i, item.title));
    });

    root.append(hero, info);
    if (item.article) root.append(renderArticle(item));
    else if (media.childNodes.length) root.append(media);
    root.append(...grids);

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
      const card = el("a", "case-next-card", { href: `./cases/${next.slug}` });
      const text = el("div", "case-next-text");
      const nextTitle = i18n("span", "case-next-title", next.titleEn ? { ru: next.title, en: next.titleEn } : next.title);
      text.append(nextTitle, i18n("span", "type-body-l case-next-subtitle", next.subtitle));
      const thumb = el("div", "case-next-thumb");
      thumb.append(el("img", "", { src: resolveSrc(next.cover), alt: next.title, loading: "lazy", decoding: "async" }));
      card.append(text, thumb);
      nav.append(card);
      root.append(nav);
    }

    // Кнопка в меню: «Сайт», если у проекта есть сайт, иначе «Кейс» (Behance / Medium)
    const navPill = document.querySelector(".nav-pill");
    const extraHref = item.website || item.behance || item.medium || item.telegram;
    if (navPill && extraHref) {
      const extra = i18n("a", "type-button nav-extra", item.website ? ui.website : ui.case);
      extra.href = extraHref;
      extra.target = "_blank";
      extra.rel = "noopener";
      navPill.append(extra);
    }

    const updateTitle = () => { document.title = `${document.documentElement.lang === "en" && item.titleEn ? item.titleEn : item.title} — Азисов Тамирлан`; };
    updateTitle();
    if (item.titleEn) new MutationObserver(updateTitle).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

    // Чистый адрес без .html
    if (location.protocol !== "file:" && location.pathname.endsWith(".html")) {
      history.replaceState(null, "", location.pathname.slice(0, -5) + location.search + location.hash);
    }
  }

  document.querySelectorAll("[data-cases-grid]").forEach(renderGrid);

  const caseRoot = document.querySelector("[data-case-root]");
  if (caseRoot) renderCase(caseRoot, document.body.dataset.case);
})();
