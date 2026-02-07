/**
 * ============================================
 * GSAP Animations - Portfolio Enhancement
 * ============================================
 * 
 * Smooth scroll, section reveals, and micro-interactions
 */

// Register GSAP plugins when available
document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined') {
        console.warn('GSAP not loaded. Advanced animations disabled.');
        return;
    }

    // Initialize animations
    initScrollAnimations();
    initTextAnimations();
    initCardAnimations();
    initNavAnimations();
    initParallaxEffects();

    console.log('✨ GSAP Animations Initialized');
});

/**
 * Scroll-triggered animations
 */
function initScrollAnimations() {
    // Fade in sections on scroll
    const sections = document.querySelectorAll('.page_scroll, .port_education_setions, .port_experience_setions, .port_projects_setions');

    sections.forEach((section, index) => {
        gsap.fromTo(section,
            {
                opacity: 0,
                y: 100
            },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: typeof ScrollTrigger !== 'undefined' ? {
                    trigger: section,
                    start: 'top 80%',
                    end: 'top 20%',
                    toggleActions: 'play none none reverse'
                } : null
            }
        );
    });
}

/**
 * Text reveal animations
 */
function initTextAnimations() {
    // Animate headings
    const headings = document.querySelectorAll('.port_heading_wrapper h2, .banner_text h4, .banner_text h1');

    headings.forEach((heading) => {
        // Split text into characters for animation
        const text = heading.textContent;
        heading.innerHTML = '';

        text.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.display = 'inline-block';
            span.style.opacity = '0';
            span.style.transform = 'translateY(50px) rotateX(90deg)';
            heading.appendChild(span);
        });

        // Animate on scroll or load
        const chars = heading.querySelectorAll('span');

        gsap.to(chars, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            stagger: 0.02,
            ease: 'back.out(1.7)',
            scrollTrigger: typeof ScrollTrigger !== 'undefined' ? {
                trigger: heading,
                start: 'top 85%'
            } : null
        });
    });
}

/**
 * Card hover animations
 */
function initCardAnimations() {
    const cards = document.querySelectorAll('.card, .exprince_box, .service_box');

    cards.forEach((card) => {
        // Mouse enter
        card.addEventListener('mouseenter', (e) => {
            gsap.to(card, {
                scale: 1.02,
                boxShadow: '0 25px 50px rgba(0, 200, 218, 0.15)',
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        // Mouse leave
        card.addEventListener('mouseleave', (e) => {
            gsap.to(card, {
                scale: 1,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        // 3D tilt effect
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 1000,
                duration: 0.5,
                ease: 'power2.out'
            });
        });

        // Reset on leave
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
    });
}

/**
 * Navigation animations
 */
function initNavAnimations() {
    const navItems = document.querySelectorAll('.nav_list li, .siderbar_menuicon');

    navItems.forEach((item, index) => {
        // Staggered entrance
        gsap.fromTo(item,
            {
                opacity: 0,
                x: -20
            },
            {
                opacity: 1,
                x: 0,
                duration: 0.5,
                delay: index * 0.1,
                ease: 'power3.out'
            }
        );

        // Hover effect
        item.addEventListener('mouseenter', () => {
            gsap.to(item, {
                x: 5,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        item.addEventListener('mouseleave', () => {
            gsap.to(item, {
                x: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });
}

/**
 * Parallax effects
 */
function initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.banner_text, .port_about_img');

    // Desktop: Mouse parallax
    window.addEventListener('mousemove', (e) => {
        const mouseX = (e.clientX / window.innerWidth) - 0.5;
        const mouseY = (e.clientY / window.innerHeight) - 0.5;

        updateParallax(parallaxElements, mouseX, mouseY);
    });

    // Mobile: Gyroscope parallax
    if (window.DeviceOrientationEvent && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        window.addEventListener('deviceorientation', (e) => {
            // Convert gyro data to similar range as mouse (-0.5 to 0.5)
            const x = e.gamma ? e.gamma / 90 : 0;
            const y = e.beta ? (e.beta - 45) / 90 : 0;

            updateParallax(parallaxElements, x, y);
        });
    }
}

function updateParallax(elements, x, y) {
    if (typeof gsap === 'undefined') return;

    elements.forEach((el, index) => {
        const depth = (index + 1) * 20;
        const moveX = x * depth;
        const moveY = y * depth;

        gsap.to(el, {
            x: moveX,
            y: moveY,
            duration: 1,
            ease: 'power2.out'
        });
    });
}

/**
 * Smooth scroll to section
 */
function smoothScrollTo(target) {
    if (typeof gsap === 'undefined') {
        document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
        return;
    }

    const element = document.querySelector(target);
    if (!element) return;

    gsap.to(window, {
        duration: 1.5,
        scrollTo: {
            y: element,
            offsetY: 80
        },
        ease: 'power3.inOut'
    });
}

/**
 * Page transition animation
 */
function pageTransition(callback) {
    const overlay = document.querySelector('.section-transition');
    if (!overlay || typeof gsap === 'undefined') {
        if (callback) callback();
        return;
    }

    const tl = gsap.timeline();

    tl.to(overlay, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.inOut'
    })
        .add(() => {
            if (callback) callback();
        })
        .to(overlay, {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.inOut'
        });
}

/**
 * Reveal animation for View More projects
 */
function animateNewProjects(elements) {
    if (typeof gsap === 'undefined') return;

    gsap.fromTo(elements,
        {
            opacity: 0,
            y: 50,
            scale: 0.9
        },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'back.out(1.7)'
        }
    );
}

/**
 * Button ripple effect
 */
function createRipple(event) {
    const button = event.currentTarget;

    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
        ripple.remove();
    }

    button.appendChild(circle);

    gsap.fromTo(circle,
        {
            scale: 0,
            opacity: 0.5
        },
        {
            scale: 4,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => circle.remove()
        }
    );
}

// Attach ripple effect to buttons
document.querySelectorAll('.portfolio_btn, .btn').forEach(button => {
    button.addEventListener('click', createRipple);
});

// Export functions
window.smoothScrollTo = smoothScrollTo;
window.pageTransition = pageTransition;
window.animateNewProjects = animateNewProjects;
