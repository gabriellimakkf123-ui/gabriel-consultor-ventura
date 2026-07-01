/* ============================================
   GABRIEL DE LIMA — CONSULTOR VENTURA EXPERIENCE
   Script — Form, Animations, WhatsApp Integration
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initPhoneMask();
  initFormSubmit();
  initSmoothScroll();
});

/* ---------- Scroll Reveal (Intersection Observer) ---------- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ---------- Phone Mask (XX) XXXXX-XXXX ---------- */
function initPhoneMask() {
  const phoneInput = document.getElementById('form-phone');

  phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length > 11) {
      value = value.slice(0, 11);
    }

    if (value.length > 7) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }

    e.target.value = value;
  });

  // Prevent non-numeric
  phoneInput.addEventListener('keypress', (e) => {
    if (!/\d/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
      e.preventDefault();
    }
  });
}

/* ---------- Form Validation & WhatsApp Submit ---------- */
function initFormSubmit() {
  const form = document.getElementById('lead-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Reset errors
    clearErrors();

    // Get values
    const name = document.getElementById('form-name').value.trim();
    const phone = document.getElementById('form-phone').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const product = document.getElementById('form-product').value;
    const budget = document.getElementById('form-budget').value;

    // Validate
    let isValid = true;

    if (!name || name.length < 3) {
      showError('group-name');
      isValid = false;
    }

    if (!phone || phone.replace(/\D/g, '').length < 10) {
      showError('group-phone');
      isValid = false;
    }

    if (!email || !isValidEmail(email)) {
      showError('group-email');
      isValid = false;
    }

    if (!product) {
      showError('group-product');
      isValid = false;
    }

    if (!budget) {
      showError('group-budget');
      isValid = false;
    }

    if (!isValid) {
      // Scroll to first error
      const firstError = document.querySelector('.form-group.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Build WhatsApp message
    const message = buildWhatsAppMessage(name, phone, email, product, budget);

    // WhatsApp number (Gabriel's)
    const whatsappNumber = '5516994307316';

    // Open WhatsApp
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;

    // Track Lead conversion with Meta Pixel
    if (typeof fbq === 'function') {
      fbq('track', 'Lead', {
        content_name: product,
        content_category: budget,
        value: 0,
        currency: 'BRL'
      });
    }

    // Button feedback
    const btn = document.getElementById('btn-submit');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      Redirecionando...
    `;
    btn.style.background = 'var(--success)';

    // Open in new tab after small delay for visual feedback
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');

      // Reset button after 3 seconds
      setTimeout(() => {
        btn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Enviar via WhatsApp
        `;
        btn.style.background = '';
      }, 3000);
    }, 600);
  });

  // Remove error on input
  const inputs = form.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      const group = input.closest('.form-group');
      if (group) group.classList.remove('error');
      input.classList.remove('input-error');
    });
  });
}

function buildWhatsAppMessage(name, phone, email, product, budget) {
  return `🚤 *Novo Lead — Gabriel de Lima*
━━━━━━━━━━━━━━━━━

👤 *Nome:* ${name}
📱 *Telefone:* ${phone}
📧 *E-mail:* ${email}
🎯 *Interesse:* ${product}
💰 *Investimento:* ${budget}

━━━━━━━━━━━━━━━━━
_Enviado via Landing Page_`;
}

function showError(groupId) {
  const group = document.getElementById(groupId);
  if (group) {
    group.classList.add('error');
    const input = group.querySelector('input, select');
    if (input) input.classList.add('input-error');
  }
}

function clearErrors() {
  document.querySelectorAll('.form-group.error').forEach(g => g.classList.remove('error'));
  document.querySelectorAll('.input-error').forEach(i => i.classList.remove('input-error'));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ---------- Smooth Scroll for anchor links ---------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const href = anchor.getAttribute('href');
      const target = document.querySelector(href);

      // If the link has a data-product attribute, pre-select the product in the form
      const productValue = anchor.getAttribute('data-product');
      if (productValue) {
        const productSelect = document.getElementById('form-product');
        if (productSelect) {
          // Find and select the matching option
          for (let option of productSelect.options) {
            if (option.value === productValue) {
              option.selected = true;
              break;
            }
          }
          // Trigger visual feedback on the select
          productSelect.style.borderColor = 'var(--accent)';
          productSelect.style.boxShadow = '0 0 0 3px var(--accent-glow)';
          setTimeout(() => {
            productSelect.style.borderColor = '';
            productSelect.style.boxShadow = '';
          }, 2000);
        }
      }

      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // If scrolling to form, focus the first input after a delay
        if (href === '#contato') {
          setTimeout(() => {
            const nameInput = document.getElementById('form-name');
            if (nameInput) nameInput.focus();
          }, 800);
        }
      }
    });
  });
}
