/* ═══════════════════════════════════════════════════════════
   ДОСТУПНЫЙ ГОРОД — LANDING SCRIPTS
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initMobileMenu();
    initSmoothScroll();
    initCounters();
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

/* ─── Reveal on scroll ─── */
function initReveal() {
    if (!('IntersectionObserver' in window)) return;
    const targets = document.querySelectorAll(
        '.card, .step, .usp__item, .quote, .cta__content'
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
    const declineBtn = document.getElementById('cookieDecline');

    if (!notice || !acceptBtn || !declineBtn) return;

    // Проверяем, делал ли пользователь выбор ранее
    let userChoice = null;
    try {
        userChoice = localStorage.getItem('cookie_choice'); // 'accepted' | 'declined'
    } catch (e) {
        console.warn('localStorage недоступен:', e);
    }

    // Если выбор ещё не сделан — показываем плашку
    if (!userChoice) {
        setTimeout(() => {
            notice.classList.add('cookie-notice--show');
        }, 600);
    } else if (userChoice === 'declined') {
        // Если пользователь ранее отклонил — отключаем аналитику
        disableAnalytics();
    }

    // Принять
    acceptBtn.addEventListener('click', () => {
        notice.classList.remove('cookie-notice--show');
        try {
            localStorage.setItem('cookie_choice', 'accepted');
        } catch (e) {
            console.warn('localStorage недоступен:', e);
        }
    });

    // Отклонить
    declineBtn.addEventListener('click', () => {
        notice.classList.remove('cookie-notice--show');
        try {
            localStorage.setItem('cookie_choice', 'declined');
        } catch (e) {
            console.warn('localStorage недоступен:', e);
        }
        disableAnalytics();
    });
}

/* ─── Отключение Яндекс.Метрики ─── */
function disableAnalytics() {
    // Отключаем счётчик, если он уже загружен
    if (typeof ym === 'function') {
        try {
            ym(112812831, 'disableAll');
        } catch (e) {
            console.warn('Не удалось отключить Яндекс.Метрику:', e);
        }
    }
    // Удаляем cookie Метрики
    document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        if (name.startsWith('_ym')) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${location.hostname}`;
        }
    });
}