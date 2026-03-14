gsap.registerPlugin(ScrollTrigger);

let scene, camera, renderer, points;
const html = document.documentElement;

// --- 1. THREE.JS TŁO ---
const initThree = () => {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const geo = new THREE.BufferGeometry();
    const pos = [];
    for(let i=0; i<3000; i++) {
        pos.push((Math.random()-0.5)*30, (Math.random()-0.5)*30, (Math.random()-0.5)*30);
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    
    const isDark = html.classList.contains('dark');
    const mat = new THREE.PointsMaterial({ 
        color: isDark ? 0xff3131 : 0x991b1b, 
        size: 0.025, 
        transparent: true, 
        opacity: 0.5 
    });

    points = new THREE.Points(geo, mat);
    scene.add(points);
    camera.position.z = 12;

    function animate() {
        requestAnimationFrame(animate);
        if (points) {
            points.rotation.y += 0.0005;
            points.rotation.x += 0.0002;
        }
        renderer.render(scene, camera);
    }
    animate();
};

const initHorizontal = () => {
    const container = document.querySelector(".horizontal-container");
    const portfolioSection = document.querySelector("#portfolio");
    if (!container || !portfolioSection) return;

    let mm = gsap.matchMedia();

    // DESKTOP: Horyzontalny scroll sterowany scrollem myszy
    mm.add("(min-width: 1025px)", () => {
        gsap.to(container, {
            x: () => -(container.scrollWidth - window.innerWidth),
            ease: "none",
            scrollTrigger: {
                trigger: portfolioSection,
                start: "top top",
                end: () => `+=${container.scrollWidth}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
            }
        });
    });

    // MOBILE: Resetujemy transformacje, by CSS Scroll Snap mógł działać
    mm.add("(max-width: 1024px)", () => {
        gsap.set(container, { clearProps: "transform" });
    });
};

// --- 3. THEME TOGGLE ---
const setupTheme = () => {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    
    btn.addEventListener('click', () => {
        html.classList.toggle('dark');
        const isDark = html.classList.contains('dark');
        if (points) {
            gsap.to(points.material.color, {
                r: isDark ? 1 : 0.6,
                g: isDark ? 0.19 : 0.1,
                b: isDark ? 0.19 : 0.1,
                duration: 0.6
            });
        }
    });
};

// --- 4. CUSTOM PORTFOLIO CURSOR ---
const initCustomCursor = () => {
    const cursor = document.getElementById('portfolio-cursor');
    const projectCards = document.querySelectorAll('.project-card');
    if (!cursor) return;

    window.addEventListener('mousemove', (e) => {
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
    });

    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            cursor.innerHTML = '<span>Oglądaj</span>';
            gsap.to(cursor, { scale: 1, duration: 0.3, ease: "back.out(1.7)" });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(cursor, { scale: 0, duration: 0.3, ease: "power2.in" });
        });
    });
};

// --- 5. MODAL WIDEO ---
const initVideoModal = () => {
    const modal = document.getElementById('video-modal');
    const frame = document.getElementById('video-frame');
    const closeBtn = document.getElementById('close-modal');
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const videoId = card.getAttribute('data-video-id');
            if (videoId) {
                frame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
                modal.classList.remove('opacity-0', 'pointer-events-none');
                document.body.style.overflow = 'hidden'; 
            }
        });
    });

    const closeModal = () => {
        modal.classList.add('opacity-0', 'pointer-events-none');
        frame.src = '';
        document.body.style.overflow = '';
    };

    closeBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
};

// --- 6. WALIDACJA FORMULARZA ---
const initFormValidation = () => {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    if (!form || !submitBtn) return;

    const btnText = submitBtn.querySelector('.btn-text');
    const iconDefault = submitBtn.querySelector('.icon-default');
    const iconSuccess = submitBtn.querySelector('.icon-success');
    const inputs = form.querySelectorAll('input[required], textarea[required]');

    const validateEmail = (email) => {
        return String(email).toLowerCase().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    };

    const showError = (input, show) => {
        const errorSpan = input.parentElement.querySelector('.error-msg');
        if (show) {
            input.classList.add('input-error');
            if (errorSpan) gsap.to(errorSpan, { opacity: 1, y: 0, duration: 0.3 });
            gsap.fromTo(input, { x: -5 }, { x: 5, duration: 0.1, repeat: 5, yoyo: true, ease: "linear", onComplete: () => gsap.set(input, {x:0}) });
        } else {
            input.classList.remove('input-error');
            if (errorSpan) gsap.to(errorSpan, { opacity: 0, y: -5, duration: 0.2 });
        }
    };

    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.type === 'email') showError(input, !validateEmail(input.value));
            else if (input.type !== 'checkbox') showError(input, input.value.length < 2);
        });

        input.addEventListener('input', () => {
            if (input.classList.contains('input-error')) {
                if (input.type === 'email' && validateEmail(input.value)) showError(input, false);
                if (input.type !== 'email' && input.value.length >= 2) showError(input, false);
            }
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        inputs.forEach(input => {
            if (input.type === 'email' && !validateEmail(input.value)) { showError(input, true); isValid = false; }
            else if (input.type !== 'checkbox' && input.value.length < 2) { showError(input, true); isValid = false; }
            else if (input.type === 'checkbox' && !input.checked) { 
                gsap.fromTo(input.parentElement, { x: -5 }, { x: 5, duration: 0.1, repeat: 5, yoyo: true });
                isValid = false; 
            }
        });

        if (isValid) {
            const tl = gsap.timeline();
            tl.to([btnText, iconDefault], { y: -50, opacity: 0, duration: 0.3, stagger: 0.1 })
              .to(submitBtn, { backgroundColor: "#10b981", scale: 1.05, duration: 0.4, ease: "back.out" }, "-=0.2")
              .set(btnText, { textContent: "WYSŁANO!" })
              .to(btnText, { y: 0, opacity: 1, duration: 0.3 })
              .to(iconSuccess, { y: 0, opacity: 1, duration: 0.5, ease: "back.out" }, "-=0.3");
        }
    });
};

// --- 7. MOBILNE SLIDERY (KROPKI) ---
const initMobileSliders = () => {
    // Uniwersalna funkcja budująca kropki dla podanego slidera
    const setupDots = (containerSelector, itemSelector, dotsContainerSelector) => {
        const container = document.querySelector(containerSelector);
        const items = document.querySelectorAll(itemSelector);
        const dotsContainer = document.querySelector(dotsContainerSelector);

        if (!container || !items.length || !dotsContainer) return;

        // Tworzenie kropek w locie
        dotsContainer.innerHTML = '';
        items.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = 'slider-dot';
            if (i === 0) dot.classList.add('active');
            
            // Po kliknięciu w kropkę przewijamy do odpowiedniego elementu
            dot.addEventListener('click', () => {
                // Obliczamy pozycję z uwzględnieniem paddingu kontenera
                const scrollPos = items[i].offsetLeft - container.offsetLeft - 25; 
                container.scrollTo({ left: scrollPos, behavior: 'smooth' });
            });
            
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll('.slider-dot');

        // Nasłuchujemy przewijania, aby zaktualizować status aktywnej kropki
        container.addEventListener('scroll', () => {
            let activeIndex = 0;
            let minDistance = Infinity;
            
            // Wirtualny środek widocznej części kontenera
            const containerCenter = container.scrollLeft + container.clientWidth / 2;

            items.forEach((item, index) => {
                const itemCenter = (item.offsetLeft - container.offsetLeft) + item.clientWidth / 2;
                const distance = Math.abs(containerCenter - itemCenter);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    activeIndex = index;
                }
            });

            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === activeIndex);
            });
        }, { passive: true }); // Usprawnienie wydajności scrollowania
    };

    // Inicjujemy dla obu sekcji
    setupDots('.offer-container', '.offer-card', '#oferta-dots');
    setupDots('.horizontal-container', '.project-card', '#portfolio-dots');
};

// --- 8. START APP ---
const startApp = () => {
    gsap.to("#progress", {
        width: "100%", 
        duration: 1.2, 
        ease: "power2.inOut",
        onComplete: () => {
            gsap.to("#preloader", {
                yPercent: -100,
                duration: 0.8,
                ease: "expo.inOut",
                onStart: () => {
                    initThree();
                    initHorizontal();
                    setupTheme();
                    initCustomCursor();
                    initVideoModal();
                    initFormValidation(); 
                    initMobileSliders(); // Uruchamiamy logikę kropek
                    
                    gsap.utils.toArray('.reveal-content').forEach(el => {
                        gsap.to(el, {
                            scrollTrigger: { trigger: el, start: "top 90%" },
                            opacity: 1, y: 0, duration: 1
                        });
                    });
                },
                onComplete: () => {
                    gsap.to(".reveal-text", { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 });
                }
            });
        }
    });
};

document.addEventListener('DOMContentLoaded', startApp);