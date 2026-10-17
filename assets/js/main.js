(() => {
  'use strict';

  const page = document.body.dataset.page || 'home';
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  let SITE = null;

  const esc = (v = '') => String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const safeUrl = (url = '#') => {
    const v = String(url || '').trim();
    if (!v || v === '#') return '#';
    if (/^#[a-z0-9_-]+$/i.test(v)) return v;
    if (/^(https?:|mailto:|tel:)/i.test(v)) return v;
    if (/^[./a-z0-9_-]+(\.[a-z0-9]+)?([?#].*)?$/i.test(v)) return v;
    return '#';
  };
  const icon = (name = 'bi-circle') => `<i class="bi ${esc(name)}"></i>`;
  const arr = value => Array.isArray(value) ? value : [];
  const extAttrs = url => safeUrl(url) !== '#' && /^https?:/i.test(String(url || '')) ? 'target="_blank" rel="noopener"' : '';
  const hasLink = url => safeUrl(url) !== '#';

  async function getJSON(path) {
    const r = await fetch(path, { cache: 'no-store' });
    if (!r.ok) throw new Error(`Could not load ${path} (${r.status})`);
    return r.json();
  }

  // ---------- Theme + metadata ----------
  function hexRgb(hex, fallback = '79,124,255') {
    const m = String(hex || '').trim().replace('#','').match(/^([0-9a-f]{6})$/i);
    if (!m) return fallback;
    const n = parseInt(m[1], 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  }

  function applyPalette(themeName) {
    if (!SITE?.theme) return;
    const palette = SITE.theme[themeName] || SITE.theme.dark || {};
    const ui = SITE.theme.ui || {};
    const root = document.documentElement;
    const surfaceRgb = hexRgb(palette.surface, '16,26,47');
    const borderRgb = hexRgb(palette.border, '203,213,225');
    const vars = {
      '--ink-950': palette.background,
      '--ink-900': palette.backgroundAlt,
      '--ink-850': palette.surface,
      '--ink-800': palette.surfaceAlt,
      '--surface': `rgba(${surfaceRgb},${themeName === 'light' ? '.90' : '.84'})`,
      '--surface-strong': palette.surface,
      '--surface-soft': `rgba(${borderRgb},${themeName === 'light' ? '.035' : '.045'})`,
      '--border': `rgba(${borderRgb},${themeName === 'light' ? '.09' : '.12'})`,
      '--border-strong': `rgba(${borderRgb},${themeName === 'light' ? '.16' : '.20'})`,
      '--text': palette.text,
      '--muted': palette.muted,
      '--primary': palette.primary,
      '--primary-2': palette.secondary,
      '--accent': palette.accent,
      '--gold': palette.highlight,
      '--white': palette.white || '#FFFFFF',
      '--primary-rgb': hexRgb(palette.primary),
      '--secondary-rgb': hexRgb(palette.secondary, '124,92,255'),
      '--accent-rgb': hexRgb(palette.accent, '45,212,191'),
      '--gold-rgb': hexRgb(palette.highlight, '245,184,75'),
      '--surface-rgb': hexRgb(palette.surface, '16,26,47'),
      '--background-rgb': hexRgb(palette.background, '7,16,31'),
      '--border-rgb': hexRgb(palette.border, '203,213,225'),
      '--radius-lg': ui.radiusLarge || '20px',
      '--radius-xl': ui.radiusXL || '28px',
      '--radius-md': ui.radiusMedium || '14px'
    };
    Object.entries(vars).forEach(([k,v]) => v && root.style.setProperty(k, v));
    root.dataset.theme = themeName;
    const metaTheme = $('meta[name="theme-color"]');
    if (metaTheme) metaTheme.content = palette.backgroundAlt || palette.background || '#0b1324';
  }

  function currentTheme() {
    const stored = localStorage.getItem('portfolio-theme');
    if (stored && SITE?.theme?.[stored]) return stored;
    return SITE?.settings?.defaultTheme || 'dark';
  }

  function updateThemeIcon() {
    const b = $('#themeToggle');
    if (!b) return;
    const light = document.documentElement.dataset.theme === 'light';
    b.innerHTML = `<i class="bi ${light ? 'bi-sun' : 'bi-moon-stars'}"></i>`;
    b.title = SITE?.navbar?.themeLabel || 'Toggle theme';
  }

  function initThemeToggle() {
    const b = $('#themeToggle');
    if (!b) return;
    updateThemeIcon();
    b.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      applyPalette(next);
      localStorage.setItem('portfolio-theme', next);
      updateThemeIcon();
    });
  }

  function applyMeta(pageData = null) {
    const meta = pageData?.meta || SITE?.meta || {};
    if (meta.title) document.title = meta.title;
    const d = $('meta[name="description"]');
    if (d && meta.description) d.content = meta.description;
    if (SITE?.meta?.favicon) {
      const f = $('link[rel="icon"]');
      if (f) f.href = SITE.meta.favicon;
    }
  }

  // ---------- Google Drive + universal media ----------
  function extractDriveId(url = '') {
    const value = String(url).trim();
    for (const pattern of [/\/file\/d\/([a-zA-Z0-9_-]+)/, /[?&]id=([a-zA-Z0-9_-]+)/, /\/d\/([a-zA-Z0-9_-]+)/]) {
      const m = value.match(pattern); if (m) return m[1];
    }
    return '';
  }
  const drivePreview = url => extractDriveId(url) ? `https://drive.google.com/file/d/${extractDriveId(url)}/preview` : '';
  const driveThumb = (url, width = 1600) => extractDriveId(url) ? `https://drive.google.com/thumbnail?id=${extractDriveId(url)}&sz=w${width}` : '';

  // Accept either a plain media URL or a copied <iframe ...> embed snippet.
  function normalizeMediaUrl(value = '') {
    let text = String(value || '').trim().replace(/&amp;/gi, '&');
    const cssUrl = text.match(/^url\(\s*(["']?)(.*?)\1\s*\)$/i);
    if (cssUrl) text = cssUrl[2].trim();
    const iframeSrc = text.match(/<iframe\b[^>]*?\bsrc\s*=\s*(["'])(.*?)\1/i);
    if (iframeSrc) text = iframeSrc[2].trim();
    return text;
  }

  const isYouTube = url => {
    const value = normalizeMediaUrl(url);
    return /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)/i.test(value);
  };

  function parseYouTubeTime(value = '') {
    const text = String(value || '').trim();
    if (/^\d+$/.test(text)) return Number(text);
    const m = text.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
    if (!m) return 0;
    return (Number(m[1] || 0) * 3600) + (Number(m[2] || 0) * 60) + Number(m[3] || 0);
  }

  function youtubeEmbed(url = '') {
    try {
      const raw = normalizeMediaUrl(url);
      const u = new URL(raw);
      const host = u.hostname.replace(/^www\./i, '').toLowerCase();
      if (!['youtube.com', 'youtube-nocookie.com', 'youtu.be'].includes(host)) return '';

      let id = '';
      if (host === 'youtu.be') id = u.pathname.split('/').filter(Boolean)[0] || '';
      else if (u.pathname.includes('/shorts/')) id = u.pathname.split('/shorts/')[1]?.split('/')[0] || '';
      else if (u.pathname.includes('/embed/')) id = u.pathname.split('/embed/')[1]?.split('/')[0] || '';
      else id = u.searchParams.get('v') || '';

      if (!/^[a-zA-Z0-9_-]{6,}$/.test(id)) return '';

      const params = new URLSearchParams();
      for (const key of ['start', 'list', 'index', 'si']) {
        const value = u.searchParams.get(key);
        if (value) params.set(key, value);
      }
      if (!params.has('start')) {
        const seconds = parseYouTubeTime(u.searchParams.get('t'));
        if (seconds > 0) params.set('start', String(seconds));
      }

      const query = params.toString();
      return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}${query ? `?${query}` : ''}`;
    } catch { return ''; }
  }
  const imageUrl = url => driveThumb(normalizeMediaUrl(url)) || safeUrl(normalizeMediaUrl(url));
  function mediaType(type = '', url = '') {
    const t = String(type).toLowerCase();
    if (['image','photo','picture'].includes(t)) return 'image';
    if (['audio','music','song'].includes(t)) return 'audio';
    if (['video','movie'].includes(t)) return 'video';
    const c = String(url).split('?')[0].toLowerCase();
    if (/\.(jpg|jpeg|png|gif|webp|avif|svg)$/.test(c)) return 'image';
    if (/\.(mp3|wav|ogg|m4a|aac|flac)$/.test(c)) return 'audio';
    if (/\.(mp4|webm|mov|m4v|ogv)$/.test(c) || isYouTube(url)) return 'video';
    return 'link';
  }
  function validMedia(media) { return arr(media).filter(x => x && String(x.url || x.link || '').trim()); }

  function mediaCard(item, compact = false) {
    const url = normalizeMediaUrl(item.url || item.link || '');
    const type = mediaType(item.type, url);
    const title = esc(item.title || type[0].toUpperCase() + type.slice(1));
    const caption = esc(item.caption || item.description || '');
    const preview = drivePreview(url), external = safeUrl(url), cls = compact ? 'media-card media-card-compact' : 'media-card';
    if (type === 'image') {
      const src = imageUrl(url), open = preview || external;
      return `<article class="${cls}"><button class="media-image-button" type="button" data-media-image="${esc(src)}" data-media-title="${title}"><img class="media-photo" src="${src}" alt="${title}" loading="lazy"><span class="media-zoom"><i class="bi bi-arrows-fullscreen"></i></span></button><div class="media-info"><div class="media-type"><i class="bi bi-image"></i> ${esc(item.typeLabel || SITE?.labels?.photo || 'Photo')}</div><h3>${title}</h3>${caption ? `<p>${caption}</p>` : ''}${open !== '#' ? `<a class="mini-link" href="${open}" target="_blank" rel="noopener"><i class="bi bi-box-arrow-up-right"></i> ${esc(item.openLabel || SITE?.labels?.openSource || 'Open source')}</a>` : ''}</div></article>`;
    }
    if (type === 'audio') {
      const player = preview ? `<iframe class="media-embed media-audio-embed" src="${preview}" title="${title}" allow="autoplay" loading="lazy"></iframe>` : `<audio class="media-audio" controls preload="metadata" src="${external}"></audio>`;
      return `<article class="${cls}"><div class="media-player-shell audio-shell"><div class="media-art"><i class="bi bi-music-note-beamed"></i></div>${player}</div><div class="media-info"><div class="media-type"><i class="bi bi-headphones"></i> ${esc(item.typeLabel || SITE?.labels?.audio || 'Audio')}</div><h3>${title}</h3>${caption ? `<p>${caption}</p>` : ''}</div></article>`;
    }
    if (type === 'video') {
      const yt = isYouTube(url) ? youtubeEmbed(url) : '';
      const player = preview || yt ? `<iframe class="media-embed media-video-embed" src="${preview || yt}" title="${title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>` : `<video class="media-video" controls preload="metadata" src="${external}"></video>`;
      return `<article class="${cls}"><div class="media-video-wrap">${player}</div><div class="media-info"><div class="media-type"><i class="bi bi-play-circle"></i> ${esc(item.typeLabel || SITE?.labels?.video || 'Video')}</div><h3>${title}</h3>${caption ? `<p>${caption}</p>` : ''}</div></article>`;
    }
    return `<article class="${cls}"><div class="media-info"><div class="media-type"><i class="bi bi-link-45deg"></i> ${esc(item.typeLabel || SITE?.labels?.link || 'Link')}</div><h3>${title}</h3>${caption ? `<p>${caption}</p>` : ''}<a class="link-arrow" href="${external}" ${extAttrs(external)}>${esc(item.openLabel || SITE?.labels?.openMedia || 'Open media')} <i class="bi bi-arrow-up-right"></i></a></div></article>`;
  }

  function inlineMedia(media) {
    const items = validMedia(media); if (!items.length) return '';
    return `<div class="inline-media mt-3">${items.map(x => mediaCard(x, true)).join('')}</div>`;
  }
  function mediaSection(media, cfg = {}) {
    const items = validMedia(media); if (!items.length) return '';
    return `<section class="section media-section"><div class="container"><div class="section-head reveal"><div class="eyebrow">${esc(cfg.eyebrow || 'Media')}</div><h2 class="section-title mt-2 mb-2">${esc(cfg.title || 'Media gallery')}</h2>${cfg.description ? `<p class="section-copy mb-0">${esc(cfg.description)}</p>` : ''}</div><div class="media-grid">${items.map(x => `<div class="reveal">${mediaCard(x)}</div>`).join('')}</div></div></section>`;
  }
  function ensureLightbox() {
    if ($('#mediaLightbox')) return;
    document.body.insertAdjacentHTML('beforeend', `<div class="modal fade" id="mediaLightbox" tabindex="-1" aria-hidden="true"><div class="modal-dialog modal-dialog-centered modal-xl"><div class="modal-content media-modal-content"><div class="modal-header border-0"><h5 class="modal-title" id="mediaLightboxTitle">Photo</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body pt-0"><img id="mediaLightboxImage" class="media-lightbox-image" src="" alt=""></div></div></div></div>`);
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-media-image]'); if (!b) return;
      $('#mediaLightboxImage').src = b.dataset.mediaImage || '';
      $('#mediaLightboxImage').alt = b.dataset.mediaTitle || 'Photo';
      $('#mediaLightboxTitle').textContent = b.dataset.mediaTitle || 'Photo';
      bootstrap.Modal.getOrCreateInstance($('#mediaLightbox')).show();
    });
  }

  // ---------- Shared shell ----------
  function renderNavbar() {
    const nav = $('#site-nav'); if (!nav) return;
    const s = SITE.settings || {}, n = SITE.navbar || {};
    nav.innerHTML = `<nav class="navbar navbar-expand-lg site-navbar fixed-top"><div class="container"><a class="navbar-brand" href="index.html">${esc(SITE.profile.shortName)}<span class="brand-dot">.</span></a><button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-label="Toggle navigation"><i class="bi bi-list fs-3 text-body-emphasis"></i></button><div class="collapse navbar-collapse" id="mainNav"><ul class="navbar-nav ms-auto align-items-lg-center">${arr(SITE.navigation).map(i => `<li class="nav-item"><a class="nav-link ${i.page === page ? 'active' : ''}" href="${safeUrl(i.href)}">${esc(i.label)}</a></li>`).join('')}</ul><div class="d-flex align-items-center gap-2 ms-lg-3 mt-3 mt-lg-0">${s.allowThemeSwitch !== false ? `<button class="theme-toggle" id="themeToggle" aria-label="${esc(n.themeLabel || 'Toggle theme')}"></button>` : ''}${s.showContactButton !== false ? `<a class="btn-brand" href="${safeUrl(n.contactHref || 'index.html#contact')}">${esc(n.contactLabel || 'Contact')} <i class="bi bi-arrow-up-right"></i></a>` : ''}</div></div></div></nav>`;
    initThemeToggle();
  }

  function renderFooter() {
    const f = $('#site-footer'); if (!f) return;
    const cfg = SITE.footer || {}, p = SITE.profile, year = new Date().getFullYear();
    const copy = String(cfg.copyrightTemplate || '© {year} {name}. All rights reserved.').replace('{year}', year).replace('{name}', p.name);
    const right = [cfg.showLocation !== false ? esc(p.location) : '', cfg.showEmail !== false && p.email ? `<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>` : '', SITE.settings?.showContentManagerLink ? `<a href="content-manager.html">${esc(cfg.editorLabel || 'Content Manager')}</a>` : ''].filter(Boolean).join(' · ');
    f.innerHTML = `<footer class="footer"><div class="container d-flex flex-column flex-md-row justify-content-between gap-2"><span>${esc(copy)}</span><span>${right}</span></div></footer>`;
  }

  function renderPageHero(data) {
    const h = $('#page-hero'); if (!h) return;
    const p = data.page || {};
    h.innerHTML = `<header class="page-hero"><div class="container reveal"><div class="page-hero-icon mb-4">${icon(p.icon)}</div><div class="eyebrow">${esc(p.eyebrow)}</div><h1 class="page-title">${esc(p.title)}</h1><p class="page-copy">${esc(p.description)}</p></div></header>`;
  }

  const sectionHead = cfg => `<div class="section-head reveal"><div class="eyebrow">${esc(cfg?.eyebrow || '')}</div><h2 class="section-title mt-2 mb-2">${esc(cfg?.title || '')}</h2>${cfg?.description ? `<p class="section-copy mb-0">${esc(cfg.description)}</p>` : ''}</div>`;
  const infoNote = text => text ? `<div class="source-note mt-4 reveal"><i class="bi bi-info-circle me-2"></i>${esc(text)}</div>` : '';
  const tags = list => arr(list).map(x => `<span class="skill-badge">${esc(x)}</span>`).join('');

  // ---------- Home ----------
  function renderHome() {
    const root = $('#page-content'), p = SITE.profile, h = SITE.home || {}, hero = h.hero || {}, about = h.about || {}, portfolio = h.portfolioSection || {};
    root.innerHTML = `<header class="hero"><div class="container"><div class="row align-items-center g-5"><div class="col-lg-7 reveal"><div class="eyebrow">${esc(hero.eyebrow || p.role)}</div><h1 class="hero-title">${esc(hero.titlePrefix || '')} <span class="gradient-text">${esc(hero.titleHighlight || p.name)}</span></h1><p class="hero-copy">${esc(p.headline)} ${esc(p.bio)}</p><div class="hero-actions">${hero.primaryButtonLabel ? `<a class="btn-brand" href="${safeUrl(hero.primaryButtonHref)}">${esc(hero.primaryButtonLabel)} <i class="bi bi-arrow-up-right"></i></a>` : ''}${hero.secondaryButtonLabel ? `<a class="btn-ghost" href="${safeUrl(hero.secondaryButtonHref)}">${esc(hero.secondaryButtonLabel)}</a>` : ''}</div><div class="row g-3 stat-grid">${arr(SITE.stats).map(s => `<div class="col-4"><div class="stat-item"><span class="stat-value">${esc(s.value)}</span><span class="stat-label">${esc(s.label)}</span></div></div>`).join('')}</div></div><div class="col-lg-5 reveal"><div class="profile-panel"><div class="profile-panel-inner"><img class="profile-avatar" src="${imageUrl(p.avatar)}" alt="${esc(p.name)}"><div class="profile-meta"><h2>${esc(p.name)}</h2><p>${esc(p.university)}</p><span class="profile-chip"><i class="bi bi-geo-alt"></i>${esc(p.location)}</span></div></div></div></div></div></div></header>
    <section id="about" class="section"><div class="container"><div class="row g-5 align-items-start"><div class="col-lg-5 reveal"><div class="eyebrow">${esc(about.eyebrow)}</div><h2 class="section-title mt-2">${esc(about.title)}</h2></div><div class="col-lg-7 reveal"><p class="section-copy fs-5">${esc(p.bio)}</p><p class="section-copy mb-0">${esc(p.availability)}</p></div></div></div></section>
    <section class="section pt-0"><div class="container">${sectionHead(portfolio)}<div class="row g-4 mt-1">${arr(SITE.portfolioAreas).map(a => `<div class="col-md-6 col-xl-4 reveal"><a href="${safeUrl(a.href)}" class="d-block h-100"><article class="feature-card"><div class="icon-box mb-4">${icon(a.icon)}</div><h3 class="card-title h4">${esc(a.title)}</h3><p class="card-copy">${esc(a.description)}</p><span class="link-arrow">${esc(portfolio.linkLabel || 'View page')} <i class="bi bi-arrow-right"></i></span>${inlineMedia(a.media)}</article></a></div>`).join('')}</div></div></section>
    ${mediaSection(SITE.media, h.mediaSection || {})}
    ${renderContact()}`;
  }

  function renderContact() {
    const c = SITE.contact || {}, p = SITE.profile;
    return `<section id="contact" class="section"><div class="container"><div class="row g-4 align-items-stretch"><div class="col-lg-5 reveal"><div class="eyebrow">${esc(c.eyebrow || 'Contact')}</div><h2 class="section-title mt-2">${esc(c.title || '')}</h2><p class="section-copy">${esc(c.description || '')}</p></div><div class="col-lg-7 reveal"><div class="contact-card">${p.email ? `<div class="contact-item"><div class="contact-icon"><i class="bi bi-envelope"></i></div><div><strong>${esc(c.emailLabel || 'Email')}</strong><br><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></div></div>` : ''}${p.phone ? `<div class="contact-item"><div class="contact-icon"><i class="bi bi-telephone"></i></div><div><strong>${esc(c.phoneLabel || 'Phone')}</strong><br><a href="tel:${esc(p.phone)}">${esc(p.phone)}</a></div></div>` : ''}<div class="contact-item"><div class="contact-icon"><i class="bi bi-geo-alt"></i></div><div><strong>${esc(c.locationLabel || 'Location')}</strong><br><span class="card-copy">${esc(p.location)}</span></div></div><div class="contact-item"><div class="contact-icon"><i class="bi bi-share"></i></div><div><strong>${esc(c.socialLabel || 'Social profiles')}</strong><div class="social-list mt-2">${arr(SITE.socials).filter(s => hasLink(s.url)).map(s => `<a class="social-link" aria-label="${esc(s.label)}" href="${safeUrl(s.url)}" ${extAttrs(s.url)}>${icon(s.icon)}</a>`).join('')}</div></div></div></div></div></div></div></section>`;
  }

  // ---------- Pages ----------
  function projectCard(p) {
    return `<div class="col-md-6 col-xl-4 reveal" data-category="${esc(p.category)}"><article class="content-card project-card p-0"><img class="project-image" src="${imageUrl(p.image)}" alt="${esc(p.title)}"><div class="project-body"><div class="eyebrow">${esc(p.category)}</div><h3 class="card-title h4 mt-2">${esc(p.title)}</h3><p class="card-copy">${esc(p.description)}</p><div>${tags(p.stack)}</div><div class="project-actions">${hasLink(p.github) ? `<a class="mini-link" href="${safeUrl(p.github)}" ${extAttrs(p.github)}><i class="bi bi-github"></i> ${esc(p.codeLabel || SITE?.labels?.code || 'Code')}</a>` : ''}${hasLink(p.live) ? `<a class="mini-link" href="${safeUrl(p.live)}" ${extAttrs(p.live)}><i class="bi bi-box-arrow-up-right"></i> ${esc(p.liveLabel || SITE?.labels?.live || 'Live')}</a>` : ''}</div>${inlineMedia(p.media)}</div></article></div>`;
  }

  function renderSoftware(d) {
    const s = d.sections || {};
    $('#page-content').innerHTML = `<section class="section"><div class="container">${sectionHead(s.focus)}<div class="row g-4 mb-5 mt-1">${arr(d.focusAreas).map(i => `<div class="col-lg-4 reveal"><article class="content-card"><div class="icon-box mb-4">${icon(i.icon)}</div><h3 class="card-title h4">${esc(i.title)}</h3><p class="card-copy">${esc(i.description)}</p><div>${tags(i.skills)}</div>${inlineMedia(i.media)}</article></div>`).join('')}</div><div class="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4 reveal"><div><div class="eyebrow">${esc(s.projects?.eyebrow)}</div><h2 class="section-title mt-2 mb-1">${esc(s.projects?.title)}</h2>${s.projects?.description ? `<p class="section-copy mb-0">${esc(s.projects.description)}</p>`:''}</div><div class="filter-bar" id="projectFilters">${arr(d.filters).map((f,i)=>`<button class="filter-btn ${i===0?'active':''}" data-filter="${i===0?'*':esc(f)}">${esc(f)}</button>`).join('')}</div></div><div class="row g-4" id="projectGrid">${arr(d.projects).map(projectCard).join('')}</div>${infoNote(s.projects?.info)}</div></section>${mediaSection(d.media,s.media)}`;
    initFilters('#projectFilters','#projectGrid','[data-category]');
  }

  function renderPhotography(d) {
    const s=d.sections||{};
    $('#page-content').innerHTML=`<section class="section"><div class="container"><div class="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4 reveal"><div><div class="eyebrow">${esc(s.gallery?.eyebrow)}</div><h2 class="section-title mt-2 mb-1">${esc(s.gallery?.title)}</h2>${s.gallery?.description?`<p class="section-copy mb-0">${esc(s.gallery.description)}</p>`:''}</div><div class="filter-bar" id="photoFilters">${arr(d.filters).map((f,i)=>`<button class="filter-btn ${i===0?'active':''}" data-filter="${i===0?'*':esc(f)}">${esc(f)}</button>`).join('')}</div></div><div class="row g-4" id="photoGrid">${arr(d.items).map(i=>`<div class="col-md-6 col-xl-4 reveal" data-category="${esc(i.category)}"><article class="gallery-card"><button class="media-image-button gallery-button" type="button" data-media-image="${esc(imageUrl(i.image))}" data-media-title="${esc(i.title)}"><img class="gallery-image" src="${imageUrl(i.image)}" alt="${esc(i.title)}"><div class="gallery-overlay"><small>${esc(i.category)}</small><h3>${esc(i.title)}</h3><p>${esc(i.location)}${i.device?` · ${esc(i.device)}`:''}</p></div></button>${inlineMedia(i.media)}</article></div>`).join('')}</div>${infoNote(s.gallery?.info)}</div></section>${mediaSection(d.media,s.media)}`;
    initFilters('#photoFilters','#photoGrid','[data-category]');
  }

  function renderResearch(d) {
    const s=d.sections||{};
    $('#page-content').innerHTML=`<section class="section"><div class="container">${sectionHead(s.interests)}<div class="row g-4 mb-5 mt-1">${arr(d.interests).map(i=>`<div class="col-md-4 reveal"><article class="feature-card"><div class="icon-box mb-4">${icon(i.icon)}</div><h3 class="card-title h4">${esc(i.title)}</h3><p class="card-copy mb-0">${esc(i.description)}</p>${inlineMedia(i.media)}</article></div>`).join('')}</div><div class="row g-5 align-items-start"><div class="col-lg-8"><div class="eyebrow reveal">${esc(s.publications?.eyebrow)}</div><h2 class="section-title mt-2 mb-2 reveal">${esc(s.publications?.title)}</h2>${s.publications?.description?`<p class="section-copy mb-4 reveal">${esc(s.publications.description)}</p>`:''}${arr(d.publications).map(p=>`<article class="publication-card mb-3 reveal"><div class="publication-meta"><span><i class="bi bi-calendar3 me-1"></i>${esc(p.year)}</span><span><i class="bi bi-building me-1"></i>${esc(p.venue)}</span></div><h3 class="publication-title">${esc(p.title)}</h3><p class="card-copy mb-2">${esc(p.authors)}</p><p class="card-copy">${esc(p.description)}</p><div class="mb-3">${arr(p.tags).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>${p.link?`<a class="link-arrow" href="${safeUrl(p.link)}" ${extAttrs(p.link)}>${esc(s.publications?.linkLabel||'View public entry')} <i class="bi bi-arrow-up-right"></i></a>`:''}${inlineMedia(p.media)}</article>`).join('')}</div><div class="col-lg-4 reveal"><div class="content-card"><div class="eyebrow">${esc(s.workflow?.eyebrow)}</div><h2 class="card-title h4 mt-2">${esc(s.workflow?.title)}</h2>${arr(d.workflow).map(w=>`<div class="workflow-step"><div class="step-no">${esc(w.step)}</div><strong>${esc(w.title)}</strong><p class="card-copy mb-0">${esc(w.description)}</p></div>`).join('')}</div></div></div></div></section>${mediaSection(d.media,s.media)}`;
  }

  function renderMusic(d) {
    const s=d.sections||{};
    $('#page-content').innerHTML=`<section class="section"><div class="container">${sectionHead(s.works)}<div class="row g-4 mt-1">${arr(d.works).map(w=>`<div class="col-md-6 col-xl-4 reveal"><article class="feature-card"><div class="icon-box mb-4">${icon(w.icon)}</div><div class="eyebrow">${esc(w.type)}</div><h3 class="card-title h4 mt-2">${esc(w.title)}</h3><p class="card-copy">${esc(w.description)}</p>${w.link&&w.link!=='#'?`<a class="link-arrow" href="${safeUrl(w.link)}" ${extAttrs(w.link)}>${esc(s.works?.linkLabel||'Open work')} <i class="bi bi-arrow-up-right"></i></a>`:''}${inlineMedia(w.media)}</article></div>`).join('')}</div>${infoNote(s.works?.info)}</div></section>${mediaSection(d.media,s.media)}`;
  }

  function renderFitness(d) {
    const s=d.sections||{};
    $('#page-content').innerHTML=`<section class="section"><div class="container">${sectionHead(s.activities)}<div class="row g-4 mb-5 mt-1">${arr(d.activities).map(a=>`<div class="col-md-4 reveal"><article class="feature-card"><div class="icon-box mb-4">${icon(a.icon)}</div><h3 class="card-title h4">${esc(a.title)}</h3><p class="card-copy mb-0">${esc(a.description)}</p>${inlineMedia(a.media)}</article></div>`).join('')}</div>${sectionHead(s.records)}<div class="row g-4 mt-1">${arr(d.records).map(r=>`<div class="col-md-4 reveal"><article class="metric-card"><div class="metric-label">${esc(r.label)}</div><div class="metric-value gradient-text">${esc(r.value)}</div><div class="metric-note">${esc(r.note)}</div>${inlineMedia(r.media)}</article></div>`).join('')}</div>${infoNote(s.records?.info)}</div></section>${mediaSection(d.media,s.media)}`;
  }

  function renderEducation(d) {
    const s = d.sections || {};
    const timeline = arr(d.timeline).filter(i => i && (i.title || i.organization || i.description || i.date || validMedia(i.media).length));
    const skills = arr(d.skills).filter(Boolean);
    const qualifications = arr(d.qualifications).filter(q => q && (q.title || q.description || q.link || validMedia(q.media).length));

    const timelineHtml = timeline.length
      ? `<div class="timeline education-timeline">${timeline.map(i => `<div class="timeline-item reveal"><span class="timeline-dot" aria-hidden="true"></span><article class="timeline-card"><div class="timeline-date">${esc(i.date)}</div><h3 class="card-title h4 mt-2">${esc(i.title)}</h3>${i.organization ? `<div class="timeline-org mb-2">${esc(i.organization)}</div>` : ''}${i.description ? `<p class="card-copy mb-0">${esc(i.description)}</p>` : ''}${inlineMedia(i.media)}</article></div>`).join('')}</div>`
      : `<div class="content-card reveal"><p class="card-copy mb-0">No education entries have been added yet.</p></div>`;

    const skillsHtml = skills.length
      ? `<div class="content-card education-skills-card reveal"><div class="eyebrow">${esc(s.skills?.eyebrow || 'Skills')}</div><h2 class="card-title h4 mt-2">${esc(s.skills?.title || 'Technical toolkit')}</h2><div class="mt-3">${tags(skills)}</div></div>`
      : '';

    const qualificationCards = qualifications.map(q => {
      const link = safeUrl(q.link || '');
      const linkHtml = link !== '#' ? `<a class="mini-link mt-3" href="${link}" ${extAttrs(link)}><i class="bi bi-box-arrow-up-right"></i> ${esc(q.linkLabel || SITE?.labels?.openSource || 'View details')}</a>` : '';
      return `<div class="col-12 reveal"><article class="content-card education-qualification-card"><div class="d-flex gap-3 align-items-start"><div class="icon-box flex-shrink-0">${icon(q.icon || 'bi-patch-check')}</div><div class="education-qualification-body flex-grow-1"><h3 class="card-title h5">${esc(q.title)}</h3>${q.description ? `<p class="card-copy mb-0">${esc(q.description)}</p>` : ''}${linkHtml}${inlineMedia(q.media)}</div></div></article></div>`;
    }).join('');

    const qualificationsHtml = qualifications.length
      ? `<div class="education-qualifications ${skills.length ? 'mt-4' : ''}"><div class="eyebrow reveal">${esc(s.qualifications?.eyebrow || 'Qualifications')}</div><h2 class="card-title h4 mt-2 mb-3 reveal">${esc(s.qualifications?.title || 'Certificates, awards, and courses.')}</h2><div class="row g-3">${qualificationCards}</div></div>`
      : '';

    $('#page-content').innerHTML = `<section class="section"><div class="container">${sectionHead(s.timeline)}<div class="row g-5 mt-1 align-items-start"><div class="col-lg-7">${timelineHtml}</div><div class="col-lg-5 education-sidebar">${skillsHtml}${qualificationsHtml}</div></div></div></section>${mediaSection(d.media, s.media)}`;
  }

  function initFilters(barSel, gridSel, itemSel) {
    const bar=$(barSel), grid=$(gridSel); if(!bar||!grid) return;
    bar.addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;$$('.filter-btn',bar).forEach(x=>x.classList.remove('active'));b.classList.add('active');const f=b.dataset.filter;$$(itemSel,grid).forEach(i=>i.style.display=f==='*'||i.dataset.category===f?'':'none');});
  }

  function initReveal() {
    const items=$$('.reveal');
    if (SITE?.settings?.animations === false || !('IntersectionObserver' in window)) { items.forEach(x=>x.classList.add('show')); return; }
    const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');o.unobserve(e.target);}}),{threshold:.1}); items.forEach(x=>o.observe(x));
  }

  async function start() {
    try {
      SITE = await getJSON('data/site.json');
      applyPalette(currentTheme());
      renderNavbar(); renderFooter();
      if (page === 'home') { applyMeta(); renderHome(); }
      else {
        const data = await getJSON(`data/${page}.json`);
        applyMeta(data); renderPageHero(data);
        ({software:renderSoftware,photography:renderPhotography,research:renderResearch,music:renderMusic,fitness:renderFitness,education:renderEducation})[page]?.(data);
      }
      ensureLightbox(); initReveal();
    } catch (error) {
      console.error(error);
      const root=$('#page-content')||document.body;
      root.innerHTML=`<div class="container" style="padding-top:10rem"><div class="error-state"><strong>Portfolio data could not be loaded.</strong><br>${esc(error.message)}<br><br>Run the project through VS Code Live Server or another local web server.</div></div>`;
    }
  }
  start();
})();
