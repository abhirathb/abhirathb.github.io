// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    // Function to show a specific section
    function showSection(targetId) {
        // Hide all sections
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Show target section
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Add active class to corresponding nav link
        const activeLink = document.querySelector(`a[href="${targetId}"]`);
        if (activeLink && activeLink.classList.contains('nav-link')) {
            activeLink.classList.add('active');
        }

        // Scroll to top smoothly
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Add click event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            showSection(targetId);

            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }

            // Update URL hash without jumping
            history.pushState(null, null, targetId);
        });
    });

    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');

            // Animate hamburger icon
            const spans = this.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translateY(10px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translateY(-10px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // Handle browser back/forward buttons
    window.addEventListener('popstate', function() {
        const hash = window.location.hash || '#home';
        showSection(hash);
    });

    // Check for hash in URL on page load
    const initialHash = window.location.hash || '#home';
    if (initialHash) {
        showSection(initialHash);
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navMenu && navToggle) {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    const spans = navToggle.querySelectorAll('span');
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
            }
        }
    });

    // Smooth scroll for anchor links within sections
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        if (!anchor.classList.contains('nav-link')) {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                // Only handle internal page anchors, not section navigation
                if (href.startsWith('#blog-') || href.startsWith('#curation-')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        }
    });
});

// Add a simple fade-in effect for blog cards
function observeBlogCards() {
    const blogCards = document.querySelectorAll('.blog-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(20px)';

                setTimeout(() => {
                    entry.target.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);

                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    blogCards.forEach(card => {
        observer.observe(card);
    });
}

// Initialize blog card observer when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeBlogCards);
} else {
    observeBlogCards();
}
