// js/form.js
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".contacto-formulario form");
    const msg = document.createElement("p");
    msg.style.marginTop = "10px";
    form.appendChild(msg);

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // evita redirección

        msg.textContent = "Enviando...";
        msg.style.color = "#555";

        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: form.method,
                body: formData,
                headers: { "Accept": "application/json" },
            });

            if (response.ok) {
                msg.textContent = "✅ Mensaje enviado correctamente";
                msg.style.color = "green";
                form.reset();
            } else {
                msg.textContent = "❌ Error al enviar. Intenta de nuevo.";
                msg.style.color = "red";
            }
        } catch (error) {
            msg.textContent = "❌ Error de conexión. Revisa tu internet.";
            msg.style.color = "red";
        }
    });
});
