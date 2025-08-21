'use strict';
/**
 * servicios.js
 * - CTA WhatsApp por plan
 * - Animación simple on-scroll (compatible iOS/Android)
 * - Acordeón solo en mobile con botón “VER DETALLE / VER MENOS”
 * - Toggler de navbar (si existe), sin tocar HTML
 */

const WSP_NUMBER = '5491140418564';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const once = (el, k) => { const f = `__inited_${k}`; if (el[f]) return false; el[f] = true; return true; };

/* ===== WhatsApp ===== */
const buildWspUrl = plan =>
    `https://wa.me/${WSP_NUMBER}?text=${encodeURIComponent(`Hola! Necesito información sobre ${plan}`)}`;

function setupButtons() {
    $$('.btn-wsp').forEach(btn => {
        if (!once(btn, 'wsp')) return;
        const plan = btn.getAttribute('data-plan')
            || btn.closest('.plan-card')?.querySelector('.plan-card__title')?.textContent?.trim()
            || 'tu plan';
        btn.addEventListener('click', () => {
            window.open(buildWspUrl(plan), '_blank', 'noopener,noreferrer');
        }, { passive: true });
    });
}

/* ===== Reveal (fallback si no hay IntersectionObserver) ===== */
function setupReveal() {
    const els = $$('.reveal'); if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('is-visible')); return; }
    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
        });
    }, { threshold: 0.1 });
    els.forEach(el => io.observe(el));
}

/* ===== Acordeón solo en mobile ===== */
const mqMobile = window.matchMedia('(max-width: 768px)');
const heightOf = el => el ? el.scrollHeight : 0;

function expandForDesktop(card) {
    const list = $('.plan-card__list', card);
    const cta = $('.plan-card__cta', card);
    card.classList.remove('open'); // estado neutral
    if (list) { list.style.maxHeight = ''; list.style.opacity = '1'; list.style.visibility = 'visible'; list.style.pointerEvents = 'auto'; list.setAttribute('aria-hidden', 'false'); }
    if (cta) { cta.style.maxHeight = ''; cta.style.opacity = '1'; cta.style.visibility = 'visible'; cta.style.pointerEvents = 'auto'; cta.setAttribute('aria-hidden', 'false'); cta.removeAttribute('disabled'); }
}

function ensureToggleButton(card) {
    let btn = $('.plan-card__toggle', card);
    if (!btn) {
        btn = document.createElement('button');
        btn.className = 'plan-card__toggle';
        btn.type = 'button';
        btn.textContent = 'VER DETALLE';
        btn.setAttribute('aria-expanded', 'false');
        card.appendChild(btn);
    }
    return btn;
}

function setOpen(card, open) {
    // Solo aplica en mobile
    if (!mqMobile.matches) return;

    const list = $('.plan-card__list', card);
    const cta = $('.plan-card__cta', card);
    const btn = $('.plan-card__toggle', card);

    card.classList.toggle('open', open);

    if (open) {
        if (list) { list.style.maxHeight = heightOf(list) + 'px'; list.style.opacity = '1'; list.style.visibility = 'visible'; list.style.pointerEvents = 'auto'; list.setAttribute('aria-hidden', 'false'); }
        if (cta) { cta.style.maxHeight = heightOf(cta) + 'px'; cta.style.opacity = '1'; cta.style.visibility = 'visible'; cta.style.pointerEvents = 'auto'; cta.setAttribute('aria-hidden', 'false'); cta.removeAttribute('disabled'); }
        if (btn) { btn.textContent = 'VER MENOS'; btn.setAttribute('aria-expanded', 'true'); }
    } else {
        // cerrar: nada visible ni clickeable (evita “espacio fantasma” y taps)
        if (list) { list.style.maxHeight = '0px'; list.style.opacity = '0'; list.style.visibility = 'hidden'; list.style.pointerEvents = 'none'; list.setAttribute('aria-hidden', 'true'); }
        if (cta) { cta.style.maxHeight = '0px'; cta.style.opacity = '0'; cta.style.visibility = 'hidden'; cta.style.pointerEvents = 'none'; cta.setAttribute('aria-hidden', 'true'); cta.setAttribute('disabled', ''); }
        if (btn) { btn.textContent = 'VER DETALLE'; btn.setAttribute('aria-expanded', 'false'); }
    }
}

function closeSiblings(card) {
    const grid = card.closest('.planes__grid'); if (!grid) return;
    $$('.plan-card.open', grid).forEach(c => { if (c !== card) setOpen(c, false); });
}

function setupAccordion() {
    ['#servicios .planes__grid', '#servicios-diseno .planes__grid'].forEach(sel => {
        $$(sel).forEach(grid => {
            if (!once(grid, 'accordion')) return;

            $$('.plan-card', grid).forEach(card => {
                ensureToggleButton(card);
                if (mqMobile.matches) { setOpen(card, false); } else { expandForDesktop(card); }
            });

            // Delegación SOLO click (no touchstart) -> no bloquea scroll en iOS
            grid.addEventListener('click', ev => {
                if (!mqMobile.matches) return; // no acordeón en desktop
                const btn = ev.target.closest('.plan-card__toggle');
                const headOrBadge = ev.target.closest('.plan-card__head, .plan-card__badge');
                if (!btn && !headOrBadge) return;

                const card = ev.target.closest('.plan-card'); if (!card) return;
                closeSiblings(card);
                setOpen(card, !card.classList.contains('open'));
            });
        });
    });

    // Cambio de breakpoint
    if (once(window, 'accordion_mq')) {
        mqMobile.addEventListener('change', () => {
            $$('.plan-card').forEach(card => {
                const btn = $('.plan-card__toggle', card);
                if (mqMobile.matches) {
                    setOpen(card, false);
                    if (btn) { btn.textContent = 'VER DETALLE'; btn.setAttribute('aria-expanded', 'false'); }
                } else {
                    expandForDesktop(card);
                    if (btn) { btn.textContent = 'VER DETALLE'; btn.setAttribute('aria-expanded', 'false'); }
                }
            });
        });
    }

    // Re-medición en mobile (rotación/resize)
    window.addEventListener('resize', () => {
        if (!mqMobile.matches) return;
        $$('.plan-card.open').forEach(card => {
            const list = $('.plan-card__list', card);
            const cta = $('.plan-card__cta', card);
            if (list) list.style.maxHeight = heightOf(list) + 'px';
            if (cta) cta.style.maxHeight = heightOf(cta) + 'px';
        });
    });
}

/* ===== Nav toggler (hamburger) ===== */
function setupNavToggler() {
    const toggle = $('.nav-toggle, .menu-toggle, .hamburger'); if (!toggle || !once(toggle, 'nav')) return;
    const header = toggle.closest('header') || document;
    const nav = $('#site-nav', header) || $('.site-nav', header) || $('.navbar', header) || $('nav', header)
        || $('#site-nav') || $('.site-nav') || $('.navbar') || $('nav');
    if (!nav) return;

    if (!nav.hasAttribute('aria-hidden')) nav.setAttribute('aria-hidden', 'true');
    if (!toggle.hasAttribute('aria-controls')) toggle.setAttribute('aria-controls', nav.id || 'site-nav');
    toggle.setAttribute('aria-expanded', 'false');

    const open = () => { document.body.classList.add('nav-open'); nav.setAttribute('aria-hidden', 'false'); toggle.setAttribute('aria-expanded', 'true'); };
    const close = () => { document.body.classList.remove('nav-open'); nav.setAttribute('aria-hidden', 'true'); toggle.setAttribute('aria-expanded', 'false'); };
    const isOpen = () => document.body.classList.contains('nav-open');

    toggle.addEventListener('click', () => isOpen() ? close() : open());
    nav.addEventListener('click', e => {
        const a = e.target.closest('a'); if (!a) return;
        const href = a.getAttribute('href') || '';
        const internal = href.startsWith('#') || href.startsWith('/') || href.startsWith(window.location.origin);
        if (internal && window.matchMedia('(max-width:991.98px)').matches) close();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) { close(); toggle.focus(); } });

    const mq = window.matchMedia('(min-width:992px)');
    const onChange = () => {
        if (mq.matches) { document.body.classList.remove('nav-open'); nav.removeAttribute('aria-hidden'); toggle.setAttribute('aria-expanded', 'false'); }
        else { nav.setAttribute('aria-hidden', 'true'); document.body.classList.remove('nav-open'); }
    };
    mq.addEventListener('change', onChange);
    onChange();
}

/* ===== INIT ===== */
function initServicios() {
    setupButtons();
    setupReveal();
    setupAccordion();
    setupNavToggler();
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initServicios, { once: true });
} else {
    initServicios();
}

/* ===== BLOQUEO DE SCROLL PARA LIGHTBOX (fallback sin :has) ===== */
(function () {
    const isLbHash = () => /^#img\d+$/i.test(location.hash); // ids tipo #img1, #img2...
    const lock = () => document.body.classList.add('no-scroll');
    const unlock = () => document.body.classList.remove('no-scroll');

    function syncScrollLock() {
        isLbHash() ? lock() : unlock();
    }

    // Cuando se hace click en una miniatura (#imgN), esperamos al cambio de hash
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a[href^="#img"]');
        if (a) requestAnimationFrame(syncScrollLock);
    });

    // Cerrar con la X (enlace que vuelve a #portafolio) o al navegar
    window.addEventListener('hashchange', syncScrollLock);

    // Estado inicial por si llegan con hash
    syncScrollLock();
})();
