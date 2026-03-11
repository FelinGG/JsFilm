// Rejestracja GSAP
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
    for(let i=0; i<2000; i++) {
        pos.push((Math.random()-0.5)*25, (Math.random()-0.5)*25, (Math.random()-0.5)*25);
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    
    const isDark = html.classList.contains('dark');
    const mat = new THREE.PointsMaterial({ 
        color: isDark ? 0x84cc16 : 0x3f6212, 
        size: 0.02, 
        transparent: true, 
        opacity: 0.4 
    });

    points = new THREE.Points(geo, mat);
    scene.add(points);
    camera.position.z = 10;

    function animate() {
        requestAnimationFrame(animate);
        if (points) points.rotation.y += 0.0007;
        renderer.render(scene, camera);
    }
    animate();
};

// --- 2. HORIZONTAL SCROLL ---
const initHorizontal = () => {
    const container = document.querySelector(".horizontal-container");
    const portfolioSection = document.querySelector("#portfolio");
    
    if (!container || !portfolioSection) return;

    // Obliczamy dystans przewijania dynamicznie na podstawie szerokości kontenera
    const getScrollAmount = () => {
        let containerWidth = container.scrollWidth;
        return -(containerWidth - window.innerWidth);
    };

    gsap.to(container, {
        x: getScrollAmount,
        ease: "none",
        scrollTrigger: {
            trigger: portfolioSection,
            start: "top top",
            end: () => `+=${container.scrollWidth}`, // Długość scrolla zależna od liczby zdjęć
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
                r: isDark ? 0.517 : 0.247,
                g: isDark ? 0.8 : 0.384,
                b: isDark ? 0.086 : 0.07,
                duration: 0.6
            });
        }
    });
};

// --- 4. 3D HOVER EFFECT DLA KART OFERTY ---
const init3DHoverCards = () => {
    const cards = document.querySelectorAll('.offer-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const xPct = x / rect.width - 0.5;
            const yPct = y / rect.height - 0.5;
            
            gsap.to(card, {
                rotationY: xPct * 15,
                rotationX: -yPct * 15,
                transformPerspective: 1000,
                ease: "power2.out",
                duration: 0.5
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" });
        });
    });
};

// --- 5. CUSTOM PORTFOLIO CURSOR ---
const initCustomCursor = () => {
    const cursor = document.getElementById('portfolio-cursor');
    const projectCards = document.querySelectorAll('.project-card');
    
    if (!cursor || projectCards.length === 0) return;

    document.addEventListener('mousemove', (e) => {
        gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.15,
            ease: "power2.out"
        });
    });

    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(cursor, { scale: 1, duration: 0.3, ease: "back.out(1.7)" });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(cursor, { scale: 0, duration: 0.3, ease: "power2.in" });
        });
    });
};

// --- 6. MODAL WIDEO ---
const initVideoModal = () => {
    const modal = document.getElementById('video-modal');
    const frame = document.getElementById('video-frame');
    const closeBtn = document.getElementById('close-modal');
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const videoId = card.getAttribute('data-video-id');
            if (videoId) {
                frame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
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

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
};

// --- 7. LOADER & START ---
const startApp = () => {
    gsap.to("#progress", {
        width: "100%", 
        duration: 1.5, 
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
                    init3DHoverCards();
                    initCustomCursor();
                    initVideoModal();
                    
                    gsap.utils.toArray('.reveal-content').forEach(el => {
                        gsap.to(el, {
                            scrollTrigger: { trigger: el, start: "top 85%" },
                            opacity: 1, y: 0, duration: 1
                        });
                    });
                },
                onComplete: () => {
                    gsap.to(".reveal-text", { opacity: 1, y: 0, duration: 1, stagger: 0.2 });
                }
            });
        }
    });
};

document.addEventListener('DOMContentLoaded', startApp);

window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        ScrollTrigger.refresh();
    }
});