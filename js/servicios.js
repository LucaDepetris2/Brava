'use strict';
/**
 * servicios.js
 * - CTA WhatsApp por plan
 * - Animaciones on-scroll (reveal)
 * - Acordeón mobile: usa .plan-card__toggle (y también la cabecera/badge)
 * - Toggler de navbar (si existe), sin tocar HTML
 */

const WSP_NUMBER = '5491162903642';
const isIOS = /iP(ad|hone|od)/.test(navigator.userAgent);

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const once = (el, k) => { const f = `__inited_${k}`; if (el[f]) return false; el[f] = true; return true; };

/* ===== WhatsApp ===== */
const buildWspUrl = plan => `https://wa.me/${WSP_NUMBER}?text=${encodeURIComponent(`Hola! Necesito información sobre ${plan}`)}`;
function setupButtons() {
    $$('.btn-wsp').forEach(btn => {
        if (!once(btn, 'wsp')) return;
        const plan = btn.getAttribute('data-plan')
            || btn.closest('.plan-card')?.querySelector('.plan-card__title')?.textContent?.trim()
            || 'tu plan';
        btn.addEventListener('click', () => window.open(buildWspUrl(plan), '_blank', 'noopener,noreferrer'), { passive: true });
    });
}

/* ===== Reveal ===== */
function setupReveal() {
    const els = $$('.reveal');
    if (!els.length) return;

    // iOS o falta de IntersectionObserver => revelar directo
    if (isIOS || !('IntersectionObserver' in window)) {
        els.forEach(el => el.classList.add('is-visible'));
        return;
    }

    // Observador con umbral suave (evita “parpadeos” en Safari)
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


/* ===== Acordeón Mobile ===== */
const mqMobile = window.matchMedia('(max-width: 768px)');

/* Update the setOpen function in your servicios.js file */

/* Updated setOpen function to fix iOS animations */
function setOpen(card, open) {
    const list = $('.plan-card__list', card);
    const cta = $('.plan-card__cta', card);
    const tog = $('.plan-card__toggle', card);

    card.classList.toggle('open', open);

    if (open) {
        // Medir altura real y asignar para animar
        if (list) {
            list.style.maxHeight = list.scrollHeight + 'px';
            list.style.opacity = '1';
        }
        if (cta) {
            cta.style.maxHeight = cta.scrollHeight + 'px';
            cta.style.opacity = '1';
        }
        if (tog) tog.style.display = 'none';
    } else {
        // Reset para cerrar y permitir transición inversa
        if (list) {
            list.style.maxHeight = '';
            list.style.opacity = '';
        }
        if (cta) {
            cta.style.maxHeight = '';
            cta.style.opacity = '';
        }
        if (tog) {
            tog.style.display = 'inline-block';
            tog.textContent = 'VER DETALLE';
        }
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

            const onActivate = ev => {
                if (!mqMobile.matches) return;

                const btn = ev.target.closest('.plan-card__toggle');
                const headOrBadge = ev.target.closest('.plan-card__head, .plan-card__badge');
                if (!btn && !headOrBadge) return;

                // Evita doble firing (touchstart -> click)
                if (ev.type === 'touchstart') {
                    ev.preventDefault();
                    ev.stopPropagation();
                }

                const card = ev.target.closest('.plan-card');
                if (!card) return;

                const willOpen = !card.classList.contains('open');
                closeSiblings(card);
                setOpen(card, willOpen);
            };

            grid.addEventListener('click', onActivate);
            grid.addEventListener('touchstart', onActivate, { passive: false });
        });
    });

    if (once(window, 'accordion_mq')) {
        mqMobile.addEventListener('change', () => {
            $$('.plan-card').forEach(card => {
                card.classList.remove('open');
                const list = $('.plan-card__list', card);
                const cta = $('.plan-card__cta', card);
                const tog = $('.plan-card__toggle', card);
                if (list) list.style.maxHeight = '';
                if (cta) cta.style.maxHeight = '';
                if (tog) { tog.style.display = 'inline-block'; tog.textContent = 'VER DETALLE'; }
            });
        });
    }
}


/* ===== Nav toggler (opcional) ===== */
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
    mq.addEventListener('change', onChange); onChange();
}

/* ===== INIT ===== */
function initServicios() { setupButtons(); setupReveal(); setupAccordion(); setupNavToggler(); }
if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initServicios, { once: true }); }
else { initServicios(); }
