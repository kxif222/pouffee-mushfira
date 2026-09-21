/* ============================================================
   POUFFÉE — Main Script (v3 clean)
   ============================================================ */

/* ---- Determine if mobile ---- */
const isMobile = window.matchMedia('(max-width: 640px)').matches;

/* ---- Dark / light theme ---- */
(function () {
  const navEl = document.querySelector('.nav');
  if (!navEl) return;

  const btn = document.createElement('button');
  btn.className = 'theme-toggle';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Toggle colour theme');
  navEl.appendChild(btn);

  const saved = localStorage.getItem('pouffee-theme');
  if (saved === 'dark') document.body.classList.add('dark-mode');

  function paint() {
    btn.textContent = document.body.classList.contains('dark-mode') ? '☀' : '☾';
  }
  paint();

  btn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem(
      'pouffee-theme',
      document.body.classList.contains('dark-mode') ? 'dark' : 'light'
    );
    paint();
  });
})();

/* ---- Update process & detail images ---- */
(function () {
  const pImgs = document.querySelectorAll('.process-rail article img');
  if (pImgs.length >= 5) {
    pImgs[2].src = 'public/images/pouffee-stage-form.jpg';
    pImgs[2].alt = 'Foam and batting layered across the POUFFÉE frame';
    pImgs[3].src = 'public/images/pouffee-27.jpg';
    pImgs[3].alt = 'Batting wrapped around the softened form';
    pImgs[4].src = 'public/images/pouffee-final-03.jpg';
    pImgs[4].alt = 'Finished POUFFÉE in bouclé upholstery';
  }
  const dImgs = document.querySelectorAll('.detail-strip img');
  if (dImgs.length >= 5) {
    dImgs[3].src = 'public/images/pouffee-final-05.jpg';
    dImgs[3].alt = 'Close view of the finished bouclé upholstery';
  }
})();

/* ---- Hero — triptych video panels ---- */
(function () {
  const heroAsset = document.querySelector('.hero-asset');
  if (!heroAsset) return;

  heroAsset.classList.add('triptych');

  // Remove elements we no longer use
  document.querySelector('.hero-count')?.remove();
  document.querySelector('.glass-card')?.remove();

  // On mobile: use a single lightweight hero video instead of 3 heavy panels
  if (isMobile) {
    const singleVideo = document.createElement('video');
    singleVideo.className = 'hero-panel-video';
    singleVideo.autoplay = true;
    singleVideo.muted = true;
    singleVideo.defaultMuted = true;
    singleVideo.loop = true;
    singleVideo.playsInline = true;
    singleVideo.setAttribute('playsinline', '');
    singleVideo.setAttribute('webkit-playsinline', '');
    singleVideo.setAttribute('muted', '');
    singleVideo.preload = 'metadata';
    singleVideo.style.cssText = 'width:100%;height:100%;object-fit:cover;grid-column:1/-1;';

    const src = document.createElement('source');
    src.src = 'public/videos/pouffee-final-04.mp4';
    src.type = 'video/mp4';
    singleVideo.appendChild(src);

    // Override triptych grid for single panel
    heroAsset.style.gridTemplateColumns = '1fr';

    function tryPlay() {
      singleVideo.muted = true;
      singleVideo.play().catch(() => {});
    }
    singleVideo.addEventListener('canplay', tryPlay, { once: true });
    singleVideo.addEventListener('loadeddata', tryPlay, { once: true });
    singleVideo.load();
    tryPlay();

    heroAsset.appendChild(singleVideo);

  } else {
    // Desktop: 3 cinematic panels — all loop simultaneously
    ['01', '02', '03'].forEach((n) => {
      const clip = document.createElement('video');
      clip.className = 'hero-panel-video';
      clip.muted = true;
      clip.defaultMuted = true;
      clip.loop = true;           // ← loop each independently
      clip.playsInline = true;
      clip.preload = 'auto';
      clip.setAttribute('muted', '');
      clip.setAttribute('playsinline', '');
      clip.setAttribute('webkit-playsinline', '');

      const src = document.createElement('source');
      src.src = `public/videos/pouffee-hero-panel-${n}.mp4`;
      src.type = 'video/mp4';
      clip.appendChild(src);

      function start() {
        clip.muted = true;
        clip.play().catch(() => {});
      }

      // Start playing as soon as any data is available
      clip.addEventListener('canplay', start);
      clip.addEventListener('loadeddata', start);

      clip.addEventListener('error', () => clip.classList.add('is-fallback'));

      heroAsset.appendChild(clip);
    });

    // Resume panels after tab becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        document.querySelectorAll('.hero-panel-video').forEach(c => c.play().catch(() => {}));
      }
    });
  }
})();

/* ---- Navigation scroll + hamburger ---- */
(function () {
  const nav  = document.querySelector('.nav');
  const menu = document.querySelector('.menu');
  if (!nav || !menu) return;

  addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 8), { passive: true });

  menu.addEventListener('click', () => {
    const opened = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(opened));
  });

  document.querySelectorAll('.nav nav a').forEach(link =>
    link.addEventListener('click', () => nav.classList.remove('open'))
  );
})();

/* ---- Scroll reveal ---- */
(function () {
  const io = new IntersectionObserver(entries =>
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('shown');
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ---- Gallery lightbox ---- */
(function () {
  const items   = [...document.querySelectorAll('.gallery-grid button')];
  const dialog  = document.querySelector('.lightbox');
  if (!dialog || !items.length) return;
  const image   = dialog.querySelector('img');
  const counter = dialog.querySelector('p');
  let index = 0, touchStart = 0;

  function show(n) {
    index = (n + items.length) % items.length;
    image.src = items[index].dataset.image;
    image.alt = items[index].dataset.alt;
    counter.textContent =
      `${String(index + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
  }

  items.forEach((item, n) =>
    item.addEventListener('click', () => { show(n); dialog.showModal(); })
  );
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.prev').addEventListener('click',  () => show(index - 1));
  dialog.querySelector('.next').addEventListener('click',  () => show(index + 1));

  addEventListener('keydown', e => {
    if (!dialog.open) return;
    if (e.key === 'Escape')     dialog.close();
    if (e.key === 'ArrowLeft')  show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });

  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('touchstart', e => { touchStart = e.changedTouches[0].screenX; }, { passive: true });
  dialog.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].screenX - touchStart;
    if (Math.abs(delta) > 45) show(index + (delta < 0 ? 1 : -1));
  }, { passive: true });
})();

