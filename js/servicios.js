'use strict';
/**
 * servicios.js
 * - CTA WhatsApp por plan
 * - Animación simple on-scroll (compatible iOS/Android)
 * - Acordeón mobile con botón “VER DETALLE / VER MENOS”
 * - Toggler de navbar (si existe), sin tocar HTML
 */

const WSP_NUMBER = '5491162903642';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
// evita doble-inicialización
const once = (el, k) => { const f = `__inited_${k}`; if (el[f]) return false; el[f] = true; return true; };

/* =============== WhatsApp =============== */
const buildWspUrl = (plan) =>
    `https://wa.me/${WSP_NUMBER}?text=${encodeURIComponent(`Hola! Necesito información sobre ${plan}`)}`;

function setupButtons() {
    $$('.btn-wsp').forEach(btn => {
        if (!once(btn, 'wsp')) return;
        const plan =
            btn.getAttribute('data-plan') ||
            btn.closest('.plan-card')?.querySelector('.plan-card__title')?.textContent?.trim() ||
            'tu plan';

        btn.addEventListener('click', () => {
            window.open(buildWspUrl(plan), '_blank', 'noopener,noreferrer');
        }, { passive: true });
    });
}

/* =============== Reveal sencillo (on-scroll si hay soporte) =============== */
/* Si IntersectionObserver no está disponible, mostramos todo y listo. */
function setupReveal() {
    const els = $$('.reveal');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
        els.forEach(el => el.classList.add('is-visible'));
        return;
    }

    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('is-visible');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });

    els.forEach(el => io.observe(el));
}

/* =============== Acordeón Mobile con botón ================= */
const mqMobile = window.matchMedia('(max-width: 768px)');

/* Calcula altura total (lista + CTA) para animar con max-height */
function measureCardContent(card) {
    const list = $('.plan-card__list', card);
    const cta = $('.plan-card__cta', card);
    const hList = list ? list.scrollHeight : 0;
    const hCta = cta ? cta.scrollHeight : 0;
    return hList + hCta + 16; // pequeño margen
}

/* Abre/cierra una card */
function setOpen(card, open) {
    const list = $('.plan-card__list', card);
    const cta = $('.plan-card__cta', card);
    const btn = $('.plan-card__toggle', card);

    card.classList.toggle('open', open);

    if (open) {
        const h = measureCardContent(card);
        if (list) list.style.maxHeight = h + 'px';
        if (cta) cta.style.maxHeight = h + 'px';
        if (btn) { btn.textContent = 'VER MENOS'; btn.setAttribute('aria-expanded', 'true'); }
    } else {
        if (list) list.style.maxHeight = '0px';
        if (cta) cta.style.maxHeight = '0px';
        if (btn) { btn.textContent = 'VER DETALLE'; btn.setAttribute('aria-expanded', 'false'); }
    }
}

function closeSiblings(card) {
    const grid = card.closest('.planes__grid'); if (!grid) return;
    $$('.plan-card.open', grid).forEach(c => { if (c !== card) setOpen(c, false); });
}

function ensureToggleButton(card) {
    let btn = $('.plan-card__toggle', card);
    if (!btn) {
        btn = document.createElement('button');
        btn.className = 'plan-card__toggle';
        btn.type = 'button';
        btn.textContent = 'VER DETALLE';
        btn.setAttribute('aria-expanded', 'false');
        // lo inserto al final para que en mobile quede visible
        card.appendChild(btn);
    }
    return btn;
}

function setupAccordion() {
    ['#servicios .planes__grid', '#servicios-diseno .planes__grid'].forEach(sel => {
        $$(sel).forEach(grid => {
            if (!once(grid, 'accordion')) return;

            // delegación de eventos SOLO click (no usamos touchstart para no romper scroll en iOS)
            grid.addEventListener('click', ev => {
                if (!mqMobile.matches) return;

                const btn = ev.target.closest('.plan-card__toggle');
                const headOrBadge = ev.target.closest('.plan-card__head, .plan-card__badge');
                if (!btn && !headOrBadge) return;

                const card = ev.target.closest('.plan-card'); if (!card) return;

                // asegura que haya botón (si no existía en HTML)
                const toggleBtn = ensureToggleButton(card);

                const willOpen = !card.classList.contains('open');
                closeSiblings(card);
                setOpen(card, willOpen);

                // foco accesible al botón al cerrar/abrir
                toggleBtn.focus({ preventScroll: true });
            });

            // Inicializa estado cerrado y botón en todas las cards del grid
            $$('.plan-card', grid).forEach(card => {
                ensureToggleButton(card);
                setOpen(card, false);
            });
        });
    });

    // Si cambia la condición de media query, reseteamos los estilos de altura
    if (once(window, 'accordion_mq')) {
        mqMobile.addEventListener('change', () => {
            $$('.plan-card').forEach(card => {
                card.classList.remove('open');
                const list = $('.plan-card__list', card);
                const cta = $('.plan-card__cta', card);
                const btn = $('.plan-card__toggle', card);
                if (list) list.style.maxHeight = '';
                if (cta) cta.style.maxHeight = '';
                if (btn) { btn.textContent = 'VER DETALLE'; btn.setAttribute('aria-expanded', 'false'); }
            });
        });
    }

    // En caso de rotación / resize, si está abierta, re-medir
    window.addEventListener('resize', () => {
        $$('.plan-card.open').forEach(card => {
            const h = measureCardContent(card);
            const list = $('.plan-card__list', card);
            const cta = $('.plan-card__cta', card);
            if (list) list.style.maxHeight = h + 'px';
            if (cta) cta.style.maxHeight = h + 'px';
        });
    });
}

/* =============== Nav toggler (opcional / no rompe nada) =============== */
function setupNavToggler() {
    const toggle = $('.nav-toggle, .menu-toggle, .hamburger'); if (!toggle || !once(toggle, 'nav')) return;
    const header = toggle.closest('header') || document;
    const nav = $('#site-nav', header) || $('.site-nav', header) || $('.navbar', header) || $('nav', header)
        || $('#site-nav') || $('.site-nav') || $('.navbar') || $('nav');
    if (!nav) return;

    nav.setAttribute('data-collapsible', 'true');
    if (!nav.hasAttribute('aria-hidden')) nav.setAttribute('aria-hidden', 'true');
    if (!toggle.hasAttribute('aria-controls')) toggle.setAttribute('aria-controls', nav.id || 'site-nav');
    toggle.setAttribute('aria-expanded', 'false');

    const open = () => { document.body.classList.add('nav-open'); nav.classList.add('is-open'); nav.setAttribute('aria-hidden', 'false'); toggle.setAttribute('aria-expanded', 'true'); };
    const close = () => { document.body.classList.remove('nav-open'); nav.classList.remove('is-open'); nav.setAttribute('aria-hidden', 'true'); toggle.setAttribute('aria-expanded', 'false'); };
    const isOpen = () => nav.classList.contains('is-open');

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
        if (mq.matches) { document.body.classList.remove('nav-open'); nav.classList.add('is-open'); nav.removeAttribute('aria-hidden'); toggle.setAttribute('aria-expanded', 'false'); }
        else { nav.setAttribute('aria-hidden', 'true'); nav.classList.remove('is-open'); document.body.classList.remove('nav-open'); }
    };
    mq.addEventListener('change', onChange);
    onChange();
}

/* =============== INIT =============== */
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
