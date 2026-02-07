/**
 * Theme Toggle Script
 * Handles switching between light and dark mode
 * Saves user preference in localStorage
 */

(function () {
    'use strict';

    // Create the toggle button
    function createThemeToggle() {
        // Check if floating toggle already exists
        if (document.querySelector('.theme-toggle.floating-toggle')) return;

        const toggle = document.createElement('button');
        toggle.className = 'theme-toggle floating-toggle';
        toggle.setAttribute('aria-label', 'Toggle dark mode');
        toggle.setAttribute('title', 'Toggle Dark/Light Mode');

        // Add icon
        toggle.innerHTML = `<i class="fas fa-moon"></i>`;

        document.body.appendChild(toggle);

        return toggle;
    }

    // Check for saved theme preference or system preference
    function getThemePreference() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        // Default to light mode
        return 'light';
    }

    // Apply theme
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // Update all toggle icons (floating and custom sidebar ones)
        const icons = document.querySelectorAll('.theme-toggle i, .theme-toggle-custom i');
        icons.forEach(icon => {
            if (theme === 'dark') {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        });

        localStorage.setItem('theme', theme);

        // Add a nice animation effect to body
        document.body.style.transition = 'background-color 0.4s ease, color 0.4s ease';
    }

    // Toggle theme
    function toggleTheme() {
        const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    }

    // Initialize on DOM ready
    function init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setup);
        } else {
            setup();
        }
    }

    function setup() {
        // Apply saved theme preference
        const savedTheme = getThemePreference();
        applyTheme(savedTheme);

        // Create floating toggle button (for desktop mainly)
        createThemeToggle();

        // Add click event to all toggles (floating + sidebar/custom)
        // Global delegate listener for dynamic elements or existing ones
        document.addEventListener('click', function (e) {
            // Check if clicked element is a theme toggle or inside one
            const toggleBtn = e.target.closest('.theme-toggle') || e.target.closest('.theme-toggle-custom');

            if (toggleBtn) {
                e.preventDefault();
                toggleTheme();

                // Add animation to the clicked element
                toggleBtn.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    toggleBtn.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        toggleBtn.style.transform = 'scale(1)';
                    }, 150);
                }, 100);
            }
        });

        console.log('Theme toggle initialized. Current theme:', savedTheme);
    }

    // Start initialization
    init();

})();
