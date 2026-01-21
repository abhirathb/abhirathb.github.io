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

// Curations functionality
let curationsData = [];

// Load curations from JSON file
async function loadCurations() {
    try {
        const response = await fetch('data/curations.json');
        curationsData = await response.json();
        renderCurations(curationsData);
        updateSearchCount(curationsData.length, curationsData.length);
    } catch (error) {
        console.error('Error loading curations:', error);
        const tbody = document.getElementById('curationsTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-light);">Failed to load curations. Please try again later.</td></tr>';
        }
    }
}

// Render curations table
function renderCurations(curations) {
    const tbody = document.getElementById('curationsTableBody');
    if (!tbody) return;

    if (curations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-light);">No curations found.</td></tr>';
        return;
    }

    tbody.innerHTML = curations.map(curation => `
        <tr data-title="${escapeHtml(curation.title.toLowerCase())}">
            <td>${curation.sno}</td>
            <td>
                <a href="${escapeHtml(curation.link)}"
                   class="curation-title"
                   target="_blank"
                   rel="noopener noreferrer"
                   data-original-title="${escapeHtml(curation.title)}">
                    ${escapeHtml(curation.title)}
                </a>
            </td>
            <td><span class="category-tag">${escapeHtml(curation.category)}</span></td>
            <td><span class="type-badge">${escapeHtml(curation.type)}</span></td>
        </tr>
    `).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Highlight matching text
function highlightText(text, search) {
    if (!search) return escapeHtml(text);

    const escapedText = escapeHtml(text);
    const escapedSearch = escapeHtml(search);
    const regex = new RegExp(`(${escapedSearch})`, 'gi');
    return escapedText.replace(regex, '<span class="highlight">$1</span>');
}

// Update search results count
function updateSearchCount(visible, total) {
    const countElement = document.getElementById('searchCount');
    if (countElement) {
        if (visible === total) {
            countElement.textContent = `Showing all ${total} curations`;
        } else {
            countElement.textContent = `Showing ${visible} of ${total} curations`;
        }
    }
}

// Filter curations based on search input
function filterCurations(searchTerm) {
    const tbody = document.getElementById('curationsTableBody');
    if (!tbody) return;

    const rows = tbody.querySelectorAll('tr');
    const search = searchTerm.toLowerCase().trim();
    let visibleCount = 0;

    rows.forEach(row => {
        const titleAttr = row.getAttribute('data-title');
        if (!titleAttr) return;

        const titleLink = row.querySelector('.curation-title');
        if (!titleLink) return;

        const originalTitle = titleLink.getAttribute('data-original-title');
        if (!originalTitle) return;

        if (!search || titleAttr.includes(search)) {
            row.classList.remove('hidden');
            visibleCount++;

            // Update title with highlighting
            if (search) {
                titleLink.innerHTML = highlightText(originalTitle, searchTerm);
            } else {
                titleLink.textContent = originalTitle;
            }
        } else {
            row.classList.add('hidden');
        }
    });

    updateSearchCount(visibleCount, curationsData.length);
}

// Initialize curations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load curations data
    loadCurations();

    // Setup search functionality
    const searchInput = document.getElementById('curationSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterCurations(e.target.value);
        });

        // Clear search on Escape key
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                filterCurations('');
            }
        });
    }
});
