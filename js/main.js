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

// --- 2. HORIZONTAL SCROLL ---
const initHorizontal = () => {
    const container = document.querySelector(".horizontal-container");
    const portfolioSection = document.querySelector("#portfolio");
    if (!container || !portfolioSection) return;

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

// --- 6. START APP ---
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