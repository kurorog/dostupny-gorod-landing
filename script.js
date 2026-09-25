/* ═══════════════════════════════════════════════════════════
   ДОСТУПНЫЙ ГОРОД — LANDING SCRIPTS
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initMobileMenu();
    initSmoothScroll();
    initCounters();
    initForm();
    initReveal();
    initCookieNotice();
});

/* ─── Header scroll effect ─── */
function initHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    const onScroll = () => {
        header.classList.toggle('header--scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

/* ─── Mobile menu ─── */
function initMobileMenu() {
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    if (!burger || !nav) return;

    burger.addEventListener('click', () => {
        const open = nav.classList.toggle('nav--open');
        burger.classList.toggle('burger--open', open);
        burger.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('nav--open');
            burger.classList.remove('burger--open');
            burger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });
}

/* ─── Smooth scroll with offset ─── */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const id = link.getAttribute('href');
            if (id === '#' || id.length < 2) return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
            const top = target.getBoundingClientRect().top + window.scrollY - headerH;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
}

/* ─── Animated counters ─── */
function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const animate = (el) => {
        const target = parseInt(el.dataset.count, 10);
        if (isNaN(target)) return;
        const duration = 1500;
        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(target * eased).toLocaleString('ru-RU');
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target.toLocaleString('ru-RU');
        };
        requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animate(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    counters.forEach(c => observer.observe(c));
}

/* ─── Lead form ─── */
function initForm() {
    const form = document.getElementById('leadForm');
    if (!form) return;

    const submitBtn = document.getElementById('submitBtn');

    const validators = {
        name: (v) => {
            if (!v.trim()) return 'Укажите имя';
            if (v.trim().length < 2) return 'Имя слишком короткое';
            return '';
        },
        email: (v) => {
            if (!v.trim()) return 'Укажите email';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Некорректный email';
            return '';
        },
        role: (v) => (!v ? 'Выберите вариант' : ''),
        consent: (_, el) => (!el.checked ? 'Необходимо согласие' : ''),
    };

    const showError = (name, msg) => {
        const field = form.querySelector(`[name="${name}"]`);
        const errorEl = form.querySelector(`[data-error-for="${name}"]`);
        if (field) field.classList.toggle('form__input--error', !!msg);
        if (errorEl) errorEl.textContent = msg;
        return !msg;
    };

    // Live validation
    ['name', 'email', 'role'].forEach(name => {
        const field = form.querySelector(`[name="${name}"]`);
        if (!field) return;
        field.addEventListener('blur', () => {
            const validator = validators[name];
            if (validator) showError(name, validator(field.value));
        });
        field.addEventListener('input', () => {
            if (field.classList.contains('form__input--error')) {
                const validator = validators[name];
                if (validator) showError(name, validator(field.value));
            }
        });
    });

    const consentField = form.querySelector('[name="consent"]');
    if (consentField) {
        consentField.addEventListener('change', () => {
            if (consentField.checked) showError('consent', '');
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate all
        let valid = true;
        const data = {};
        for (const [name, validator] of Object.entries(validators)) {
            const field = form.querySelector(`[name="${name}"]`);
            const value = field?.type === 'checkbox' ? field.checked : (field?.value || '');
            const msg = validator(value, field);
            if (!showError(name, msg)) valid = false;
            data[name] = value;
        }

        if (!valid) {
            showToast('Проверьте выделенные поля', 'error');
            return;
        }

        // Submit (demo — replace with real API endpoint)
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Отправляем…';

        try {
            // ⚠️ Замените на реальный эндпоинт API:
            // const resp = await fetch('/v1/leads', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(data),
            // });
            // if (!resp.ok) throw new Error('Network error');

            // Демо-задержка:
            await new Promise(r => setTimeout(r, 900));

            showToast('Заявка отправлена! Мы свяжемся с вами.', 'success');
            form.reset();
            form.querySelectorAll('.form__error').forEach(el => el.textContent = '');
            form.querySelectorAll('.form__input--error').forEach(el => el.classList.remove('form__input--error'));
        } catch (err) {
            console.error(err);
            showToast('Ошибка отправки. Попробуйте позже.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

/* ─── Toast ─── */
let toastTimer;
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.className = `toast toast--${type} toast--show`;
    toastTimer = setTimeout(() => {
        toast.classList.remove('toast--show');
    }, 4000);
}

/* ─── Reveal on scroll ─── */
function initReveal() {
    if (!('IntersectionObserver' in window)) return;
    const targets = document.querySelectorAll(
        '.card, .step, .usp__item, .quote, .cta__content, .form'
    );
    if (!targets.length) return;

    targets.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, i * 60);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));
}

/* ─── Cookie Notice ─── */
function initCookieNotice() {
    const notice = document.getElementById('cookieNotice');
    const acceptBtn = document.getElementById('cookieAccept');

    if (!notice || !acceptBtn) return;

    // Проверяем, принимал ли пользователь cookie ранее
    let isAccepted = false;
    try {
        isAccepted = localStorage.getItem('cookie_accepted') === 'true';
    } catch (e) {
        console.warn('localStorage недоступен:', e);
    }

    if (!isAccepted) {
        // Показываем плашку с небольшой задержкой для плавности
        setTimeout(() => {
            notice.classList.add('cookie-notice--show');
        }, 600);
    }

    acceptBtn.addEventListener('click', () => {
        // Скрываем плашку
        notice.classList.remove('cookie-notice--show');

        // Запоминаем выбор пользователя
        try {
            localStorage.setItem('cookie_accepted', 'true');
        } catch (e) {
            console.warn('localStorage недоступен:', e);
        }
    });
}