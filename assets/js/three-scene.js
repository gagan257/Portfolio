/**
 * ============================================
 * Three.js Scene Setup - Portfolio 3D Experience
 * ============================================
 * 
 * Architecture:
 * - Main scene with particle system background
 * - Floating geometric objects
 * - Camera positioned for section views
 * - Smooth transitions using GSAP
 */

class PortfolioScene {
    constructor() {
        // Scene elements
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = null;

        // Objects
        this.particles = null;
        this.floatingObjects = [];
        this.mousePosition = { x: 0, y: 0 };

        // Section positions (camera targets)
        this.sectionPositions = {
            home: { x: 0, y: 0, z: 5 },
            about: { x: 10, y: 2, z: 8 },
            portfolio: { x: -10, y: -2, z: 6 },
            contact: { x: 0, y: -5, z: 4 }
        };

        // Current section
        this.currentSection = 'home';

        // Animation frame
        this.animationId = null;

        // Performance settings
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.particleCount = this.isMobile ? 500 : 2000;

        // Initialize
        this.init();
    }

    /**
     * Initialize the Three.js scene
     */
    init() {
        // Create container
        this.createContainer();

        // Setup scene
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();

        // Create objects
        this.createParticles();
        this.createFloatingObjects();

        // Setup visibility observer
        this.setupSectionVisibility();

        // Event listeners
        this.addEventListeners();

        // Start animation
        this.animate();

        // Hide loader after scene is ready
        setTimeout(() => {
            this.hideLoader();
        }, 1500);

        console.log('🎮 Three.js Portfolio Scene Initialized');
    }

    /**
     * Create canvas container
     */
    createContainer() {
        // Check if container exists
        let container = document.getElementById('canvas-container');

        if (!container) {
            container = document.createElement('div');
            container.id = 'canvas-container';
            document.body.insertBefore(container, document.body.firstChild);
        }

        this.container = container;
    }

    /**
     * Setup Three.js scene
     */
    setupScene() {
        this.scene = new THREE.Scene();
        // Transparent - original site shows through
        this.scene.background = null;
        this.clock = new THREE.Clock();
    }

    /**
     * Setup camera
     */
    setupCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(0, 0, 5);
    }

    /**
     * Setup WebGL renderer
     */
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: !this.isMobile,
            alpha: true,
            powerPreference: 'high-performance'
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap for performance
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.container.appendChild(this.renderer.domElement);
    }

    /**
     * Setup scene lighting
     */
    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);

        // Point lights for dynamic effects
        const pointLight1 = new THREE.PointLight(0x00c8da, 1, 50);
        pointLight1.position.set(10, 10, 10);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xffc454, 0.8, 50);
        pointLight2.position.set(-10, -10, 10);
        this.scene.add(pointLight2);

        // Store for animation
        this.lights = { pointLight1, pointLight2 };
    }

    /**
     * Create particle system background
     */
    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);
        const sizes = new Float32Array(this.particleCount);

        // Color palette matching portfolio theme
        const colorPalette = [
            new THREE.Color(0x00c8da), // Cyan (primary)
            new THREE.Color(0xffc454), // Gold
            new THREE.Color(0xff517e), // Pink
            new THREE.Color(0x1bc9e4)  // Light cyan
        ];

        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;

            // Spread particles around camera - closer and more spread out
            const radius = 5 + Math.random() * 15;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi) - 5; // Push back a bit

            // Random color from palette
            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            // Random size - larger particles
            sizes[i] = Math.random() * 3 + 1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Larger, more visible particles
        const material = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    /**
     * Create floating geometric objects
     */
    createFloatingObjects() {
        const geometries = [
            new THREE.IcosahedronGeometry(1, 0),
            new THREE.OctahedronGeometry(0.8, 0),
            new THREE.TetrahedronGeometry(0.9, 0),
            new THREE.TorusGeometry(0.6, 0.2, 8, 16)
        ];

        const materials = [
            new THREE.MeshPhongMaterial({
                color: 0x00c8da,
                wireframe: true,
                transparent: true,
                opacity: 0.4
            }),
            new THREE.MeshPhongMaterial({
                color: 0xffc454,
                wireframe: true,
                transparent: true,
                opacity: 0.4
            }),
            new THREE.MeshPhongMaterial({
                color: 0xff517e,
                wireframe: true,
                transparent: true,
                opacity: 0.4
            })
        ];

        // Create multiple floating objects
        const objectCount = this.isMobile ? 4 : 8;

        for (let i = 0; i < objectCount; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const material = materials[Math.floor(Math.random() * materials.length)];
            const mesh = new THREE.Mesh(geometry, material);

            // Position closer to camera for visibility
            mesh.position.set(
                (Math.random() - 0.5) * 12,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 6 - 2
            );

            // Store animation parameters
            mesh.userData = {
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.01,
                    y: (Math.random() - 0.5) * 0.015,
                    z: (Math.random() - 0.5) * 0.008
                },
                floatSpeed: Math.random() * 0.3 + 0.2,
                floatAmplitude: Math.random() * 0.3 + 0.2,
                initialY: mesh.position.y
            };

            this.floatingObjects.push(mesh);
            this.scene.add(mesh);
        }
    }

    /**
     * Navigate to section with camera animation
     * @param {string} section - Section name (home, about, portfolio, contact)
     */
    navigateToSection(section) {
        if (!this.sectionPositions[section] || this.currentSection === section) return;

        const targetPos = this.sectionPositions[section];
        this.currentSection = section;

        // Use GSAP for smooth camera transition
        if (typeof gsap !== 'undefined') {
            gsap.to(this.camera.position, {
                x: targetPos.x,
                y: targetPos.y,
                z: targetPos.z,
                duration: 1.5,
                ease: 'power3.inOut',
                onUpdate: () => {
                    this.camera.lookAt(0, 0, 0);
                }
            });
        } else {
            // Fallback without GSAP
            this.camera.position.set(targetPos.x, targetPos.y, targetPos.z);
        }

        console.log(`📍 Navigating to: ${section}`);
    }

    /**
     * Add event listeners
     */
    addEventListeners() {
        // Resize handler
        window.addEventListener('resize', () => this.onResize());

        // Mouse movement for parallax effect
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));

        // Mobile: Touch movement for interactive feel
        window.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });

        // Mobile: Gyroscope/Device Orientation for premium parallax
        if (window.DeviceOrientationEvent && this.isMobile) {
            window.addEventListener('deviceorientation', (e) => this.onDeviceOrientation(e));
        }

        // Navigation links
        this.setupNavigation();

        // Scroll for section detection
        window.addEventListener('scroll', () => this.onScroll());
    }

    /**
     * Setup IntersectionObserver to toggle canvas visibility based on specific sections
     * Sections: Education, Experience, Projects
     */
    setupSectionVisibility() {
        const sectionsToWatch = [
            document.querySelector('.port_education_setions'),
            document.querySelector('.port_experience_setions'),
            document.querySelector('.port_projects_setions')
        ];
        const contactSection = document.querySelector('.port_contact_wrapper');

        const observerOptions = {
            root: null,
            threshold: 0.1, // Trigger when 10% of the section is visible
            rootMargin: '0px'
        };

        const canvasContainer = document.getElementById('canvas-container');

        // Track which observed sections are currently visible
        const visibleSections = new Set();
        let isContactVisible = false;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.target === contactSection) {
                    isContactVisible = entry.isIntersecting;
                } else if (entry.isIntersecting) {
                    visibleSections.add(entry.target);
                } else {
                    visibleSections.delete(entry.target);
                }
            });

            // Logic: Show canvas ONLY if target sections are visible AND contact is NOT visible
            if (visibleSections.size > 0 && !isContactVisible) {
                canvasContainer.classList.add('canvas-visible');
            } else {
                canvasContainer.classList.remove('canvas-visible');
            }
        }, observerOptions);

        sectionsToWatch.forEach(section => {
            if (section) observer.observe(section);
        });

        if (contactSection) {
            observer.observe(contactSection);
        }
    }

    /**
     * Setup navigation click handlers
     */
    setupNavigation() {
        const navLinks = document.querySelectorAll('.port_navigation .nav_list a, .siderbar_menuicon');

        navLinks.forEach((link, index) => {
            link.addEventListener('click', (e) => {
                const sections = ['home', 'portfolio', 'contact'];
                if (sections[index]) {
                    this.navigateToSection(sections[index]);
                }
            });
        });
    }

    /**
     * Handle scroll to detect current section
     */
    onScroll() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        // Detect which section is in view
        const sections = {
            'home': 0,
            'about': windowHeight * 0.5,
            'portfolio': windowHeight * 2,
            'contact': windowHeight * 4
        };

        for (const [section, threshold] of Object.entries(sections)) {
            if (scrollY >= threshold - windowHeight / 2 && scrollY < threshold + windowHeight) {
                if (this.currentSection !== section) {
                    this.navigateToSection(section);
                }
                break;
            }
        }
    }

    /**
     * Handle mouse movement for parallax
     */
    onMouseMove(event) {
        this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    /**
     * Handle touch movement for mobile interaction
     */
    onTouchMove(event) {
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            this.mousePosition.x = (touch.clientX / window.innerWidth) * 2 - 1;
            this.mousePosition.y = -(touch.clientY / window.innerHeight) * 2 + 1;
        }
    }

    /**
     * Handle device orientation for premium mobile parallax
     */
    onDeviceOrientation(event) {
        // Gamma: Left/Right tilt (-90 to 90)
        // Beta: Front/Back tilt (-180 to 180)

        // Normalize values to approximately -1 to 1 range for consistency with mouse logic
        const x = event.gamma ? event.gamma / 45 : 0;
        const y = event.beta ? (event.beta - 45) / 45 : 0; // Subtract 45 to account for typical holding angle

        // Smooth damping for sensor noise
        this.mousePosition.x += (x - this.mousePosition.x) * 0.1;
        this.mousePosition.y += (y - this.mousePosition.y) * 0.1;

        // Clamp values
        this.mousePosition.x = Math.max(-1.5, Math.min(1.5, this.mousePosition.x));
        this.mousePosition.y = Math.max(-1.5, Math.min(1.5, this.mousePosition.y));
    }

    /**
     * Handle window resize
     */
    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    /**
     * Hide loading screen
     */
    hideLoader() {
        const loader = document.querySelector('.scene-loader');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => {
                loader.remove();
            }, 800);
        }
    }

    /**
     * Update loading progress
     */
    updateProgress(progress) {
        const progressBar = document.querySelector('.loader-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    /**
     * Animation loop
     */
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        const elapsedTime = this.clock.getElapsedTime();

        // Rotate particles slowly
        if (this.particles) {
            this.particles.rotation.y = elapsedTime * 0.02;
            this.particles.rotation.x = Math.sin(elapsedTime * 0.1) * 0.1;
        }

        // Animate floating objects
        this.floatingObjects.forEach((obj) => {
            const { rotationSpeed, floatSpeed, floatAmplitude, initialY } = obj.userData;

            obj.rotation.x += rotationSpeed.x;
            obj.rotation.y += rotationSpeed.y;
            obj.rotation.z += rotationSpeed.z;

            obj.position.y = initialY + Math.sin(elapsedTime * floatSpeed) * floatAmplitude;
        });

        // Subtle camera sway based on mouse or gyro/touch (Works on Mobile now!)
        // We removed the !this.isMobile check to enable it for everyone
        this.camera.position.x += (this.mousePosition.x * 0.5 - this.camera.position.x) * 0.02;
        this.camera.position.y += (this.mousePosition.y * 0.3 - this.camera.position.y) * 0.02;

        // Animate lights
        if (this.lights) {
            this.lights.pointLight1.position.x = Math.sin(elapsedTime * 0.3) * 15;
            this.lights.pointLight1.position.y = Math.cos(elapsedTime * 0.2) * 15;

            this.lights.pointLight2.position.x = Math.cos(elapsedTime * 0.4) * 15;
            this.lights.pointLight2.position.z = Math.sin(elapsedTime * 0.3) * 15;
        }

        // Render
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Cleanup and dispose
     */
    dispose() {
        cancelAnimationFrame(this.animationId);

        // Dispose geometries and materials
        this.scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(m => m.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });

        this.renderer.dispose();
        this.container.removeChild(this.renderer.domElement);

        console.log('🧹 Scene disposed');
    }
}

// Initialize on DOM ready
let portfolioScene = null;

document.addEventListener('DOMContentLoaded', () => {
    // Wait for Three.js to be available
    if (typeof THREE !== 'undefined') {
        portfolioScene = new PortfolioScene();
    } else {
        console.warn('Three.js not loaded. 3D scene disabled.');
    }
});

// Export for external access
window.PortfolioScene = PortfolioScene;
window.portfolioScene = portfolioScene;
