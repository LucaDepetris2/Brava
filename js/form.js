// js/form.js
// Exporta una función que inicializa el form dentro de .contacto-formulario
export function setupForm({
    formSelector = '.contacto-formulario form',
    okText = '✅ Mensaje enviado correctamente',
    sendingText = 'Enviando...',
    errorText = '❌ Error al enviar. Intenta de nuevo.',
    connErrorText = '❌ Error de conexión. Revisa tu internet.'
} = {}) {
    const form = document.querySelector(formSelector);
    if (!form) return;

    // Mensaje de estado (accesible)
    let msg = form.querySelector('[data-form-msg]');
    if (!msg) {
        msg = document.createElement('p');
        msg.setAttribute('data-form-msg', '');
        msg.setAttribute('role', 'status');
        msg.setAttribute('aria-live', 'polite');
        msg.style.marginTop = '10px';
        form.appendChild(msg);
    }

    const submitBtn = form.querySelector('button[type="submit"]');

    async function onSubmit(e) {
        e.preventDefault();

        // Honeypot soft: si existe _gotcha y tiene valor, no enviamos
        const honeypot = form.querySelector('input[name="_gotcha"]');
        if (honeypot && honeypot.value) return;

        msg.textContent = sendingText;
        msg.style.color = '#555';
        submitBtn?.setAttribute('disabled', '');
        submitBtn?.setAttribute('aria-busy', 'true');

        try {
            const formData = new FormData(form);
            const res = await fetch(form.action, {
                method: form.method || 'POST',
                body: formData,
                headers: { Accept: 'application/json' },
            });

            if (res.ok) {
                msg.textContent = okText;
                msg.style.color = 'green';
                form.reset();
            } else {
                msg.textContent = errorText;
                msg.style.color = 'red';
            }
        } catch {
            msg.textContent = connErrorText;
            msg.style.color = 'red';
        } finally {
            submitBtn?.removeAttribute('disabled');
            submitBtn?.removeAttribute('aria-busy');
        }
    }

    // Evita doble binding si re-ejecutás setupForm()
    form.removeEventListener('submit', onSubmit);
    form.addEventListener('submit', onSubmit, { passive: false });
}
