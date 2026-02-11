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
            const targetId = this.getAttribute('href');

            // Only handle hash links (sections on same page), let other links navigate normally
            if (!targetId.startsWith('#')) {
                return; // Let the browser handle external/page links
            }

            e.preventDefault();
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
const CURATIONS_API_URL = 'https://api.abhirathb.com/curated';
let curationsData = [];
let curationsLoaded = false;
let curationsInitialized = false;
let currentCurationsPage = 1;
let totalCurationsPages = 1;
let totalCurations = 0;

// Validate curation object has required fields
function isValidCuration(curation) {
    return curation &&
           typeof curation.title === 'string' &&
           typeof curation.link === 'string' &&
           typeof curation.category === 'string' &&
           (typeof curation.id === 'number' || typeof curation.id === 'string');
}

// Show loading state
function showLoadingState() {
    const tbody = document.getElementById('curationsTableBody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 2rem; color: var(--text-light);"><div style="display: inline-block; margin-right: 0.5rem;">Loading curations...</div></td></tr>';
    }
}

// Load curations from API
async function loadCurations(page = 1) {
    showLoadingState();

    try {
        const response = await fetch(`${CURATIONS_API_URL}?page=${page}&page_size=10`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        curationsData = data.items || [];
        currentCurationsPage = data.page || 1;
        totalCurationsPages = data.total_pages || 1;
        totalCurations = data.total || 0;

        // Filter out invalid curations
        const validCurations = curationsData.filter(isValidCuration);
        const invalidCount = curationsData.length - validCurations.length;

        if (invalidCount > 0) {
            console.warn(`Skipped ${invalidCount} invalid curation(s)`);
        }

        renderCurations(validCurations);
        renderCurationsPagination();
        curationsData = validCurations;

        if (validCurations.length > 0) {
            updateSearchCount(validCurations.length, totalCurations);
        }

        curationsLoaded = true;
    } catch (error) {
        console.error('Error loading curations:', error);
        showErrorState();
    }
}

// Show error state with retry button
function showErrorState() {
    const tbody = document.getElementById('curationsTableBody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 2rem;">
                    <div style="color: var(--text-light); margin-bottom: 1rem;">
                        Failed to load curations. Please check your connection and try again.
                    </div>
                    <button onclick="retryCurationsLoad()" style="padding: 0.5rem 1rem; background-color: var(--secondary-color); color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.9rem;">
                        Retry
                    </button>
                </td>
            </tr>
        `;
    }
}

// Retry function (must be global for onclick)
window.retryCurationsLoad = function() {
    curationsLoaded = false;
    loadCurations(currentCurationsPage);
};

// Render curations table
function renderCurations(curations) {
    const tbody = document.getElementById('curationsTableBody');
    if (!tbody) {
        return;
    }

    if (curations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 2rem; color: var(--text-light);">No curations found.</td></tr>';
        return;
    }

    // Calculate serial number based on page
    const startIndex = (currentCurationsPage - 1) * 10;

    const validRows = curations
        .filter(isValidCuration)
        .map((curation, index) => `
            <tr data-title="${escapeHtml(curation.title.toLowerCase())}">
                <td>${startIndex + index + 1}</td>
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
            </tr>
        `);

    tbody.innerHTML = validRows.join('');
}

// Render pagination controls
function renderCurationsPagination() {
    const paginationContainer = document.getElementById('curationsPagination');
    if (!paginationContainer) return;

    if (totalCurationsPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHtml = '<div class="pagination-controls">';

    // Previous button
    paginationHtml += `<button class="pagination-btn ${currentCurationsPage === 1 ? 'disabled' : ''}"
        onclick="goToCurationsPage(${currentCurationsPage - 1})"
        ${currentCurationsPage === 1 ? 'disabled' : ''}>Prev</button>`;

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentCurationsPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalCurationsPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        paginationHtml += `<button class="pagination-btn" onclick="goToCurationsPage(1)">1</button>`;
        if (startPage > 2) {
            paginationHtml += `<span class="pagination-ellipsis">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHtml += `<button class="pagination-btn ${i === currentCurationsPage ? 'active' : ''}"
            onclick="goToCurationsPage(${i})">${i}</button>`;
    }

    if (endPage < totalCurationsPages) {
        if (endPage < totalCurationsPages - 1) {
            paginationHtml += `<span class="pagination-ellipsis">...</span>`;
        }
        paginationHtml += `<button class="pagination-btn" onclick="goToCurationsPage(${totalCurationsPages})">${totalCurationsPages}</button>`;
    }

    // Next button
    paginationHtml += `<button class="pagination-btn ${currentCurationsPage === totalCurationsPages ? 'disabled' : ''}"
        onclick="goToCurationsPage(${currentCurationsPage + 1})"
        ${currentCurationsPage === totalCurationsPages ? 'disabled' : ''}>Next</button>`;

    paginationHtml += '</div>';
    paginationContainer.innerHTML = paginationHtml;
}

// Go to specific page (must be global for onclick)
window.goToCurationsPage = function(page) {
    if (page < 1 || page > totalCurationsPages || page === currentCurationsPage) return;
    loadCurations(page);
};

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
    // Escape special regex characters in search term
    const safeSearch = escapedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeSearch})`, 'gi');
    return escapedText.replace(regex, '<span class="highlight">$1</span>');
}

// Update search results count
function updateSearchCount(visible, total) {
    const countElement = document.getElementById('searchCount');
    if (countElement) {
        if (total > 0) {
            countElement.textContent = `Page ${currentCurationsPage} of ${totalCurationsPages} (${total} total)`;
        } else {
            countElement.textContent = '';
        }
    }
}

// Filter curations based on search input (client-side filtering for current page)
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
}

// Setup curations search handlers (called once)
function setupCurationsHandlers() {
    if (curationsInitialized) return;

    const searchInput = document.getElementById('curationSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterCurations(e.target.value);
        });

        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                filterCurations('');
            }
        });
    }

    curationsInitialized = true;
}

// Lazy load curations when section becomes active
function onCurationsSectionActive() {
    setupCurationsHandlers();

    // Only load data if not already loaded
    if (!curationsLoaded && curationsData.length === 0) {
        loadCurations(1);
    }
}

// Initialize curations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Setup handlers immediately
    setupCurationsHandlers();

    // Check if curations section is already active on page load
    const curationsSection = document.getElementById('curations');
    if (curationsSection && curationsSection.classList.contains('active')) {
        onCurationsSectionActive();
    }

    // Listen for navigation to curations section
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const originalClickHandler = link.onclick;
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#curations') {
                // Small delay to ensure section is visible first
                setTimeout(onCurationsSectionActive, 50);
            }
        });
    });

    // Also check hash on page load
    if (window.location.hash === '#curations') {
        setTimeout(onCurationsSectionActive, 100);
    }
});
