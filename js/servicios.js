/**
 * Servicios – CTA WhatsApp + animaciones on-scroll
 * Ajustá el número a tu línea de WhatsApp (formato internacional sin +, ni 00)
 */
const WSP_NUMBER = "5491162903642";

function buildWspUrl(plan) {
    const msg = `Hola! Necesito información sobre ${plan}`;
    const encoded = encodeURIComponent(msg);
    return `https://wa.me/${WSP_NUMBER}?text=${encoded}`;
}

function setupButtons() {
    document.querySelectorAll(".btn-wsp").forEach((btn) => {
        const planFromAttr = btn.getAttribute("data-plan");
        // Fallback: si no hay data-plan, tomar el H3 de la card
        const plan =
            planFromAttr ||
            btn.closest(".plan-card")?.querySelector(".plan-card__title")?.textContent?.trim() ||
            "tu plan";

        btn.addEventListener("click", () => {
            window.open(buildWspUrl(plan), "_blank", "noopener,noreferrer");
        });
    });
}

function setupReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
        els.forEach((el) => el.classList.add("is-visible"));
        return;
    }
    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    io.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
    setupButtons();
    setupReveal();
});

