// Feed functionality
const FEED_API_URL = 'http://api.abhirathb.com:8000/feed';
let feedData = [];
let feedLoaded = false;
let feedInitialized = false;
let currentFeedPage = 1;
let totalFeedPages = 1;
let totalFeedItems = 0;

// Validate feed item has required fields
function isValidFeedItem(item) {
    return item &&
           typeof item.title === 'string' &&
           typeof item.link === 'string' &&
           typeof item.category === 'string' &&
           (typeof item.id === 'number' || typeof item.id === 'string');
}

// Show loading state
function showFeedLoadingState() {
    const tbody = document.getElementById('feedTableBody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 2rem; color: var(--text-light);"><div style="display: inline-block; margin-right: 0.5rem;">Loading feed...</div></td></tr>';
    }
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

// Load feed from API
async function loadFeed(page = 1) {
    showFeedLoadingState();

    try {
        const response = await fetch(`${FEED_API_URL}?page=${page}&page_size=10`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        feedData = data.items || [];
        currentFeedPage = data.page || 1;
        totalFeedPages = data.total_pages || 1;
        totalFeedItems = data.total || 0;

        // Sort by created_at descending (most recent first)
        feedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Filter out invalid items
        const validItems = feedData.filter(isValidFeedItem);
        const invalidCount = feedData.length - validItems.length;

        if (invalidCount > 0) {
            console.warn(`Skipped ${invalidCount} invalid feed item(s)`);
        }

        renderFeed(validItems);
        renderFeedPagination();
        feedData = validItems;

        if (validItems.length > 0) {
            updateFeedSearchCount(validItems.length, totalFeedItems);
        }

        feedLoaded = true;
    } catch (error) {
        console.error('Error loading feed:', error);
        showFeedErrorState();
    }
}

// Show error state with retry button
function showFeedErrorState() {
    const tbody = document.getElementById('feedTableBody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 2rem;">
                    <div style="color: var(--text-light); margin-bottom: 1rem;">
                        Failed to load feed. Please check your connection and try again.
                    </div>
                    <button onclick="retryFeedLoad()" style="padding: 0.5rem 1rem; background-color: var(--secondary-color); color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.9rem;">
                        Retry
                    </button>
                </td>
            </tr>
        `;
    }
}

// Retry function (must be global for onclick)
window.retryFeedLoad = function() {
    feedLoaded = false;
    loadFeed(currentFeedPage);
};

// Render feed table
function renderFeed(items) {
    const tbody = document.getElementById('feedTableBody');
    if (!tbody) {
        return;
    }

    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 2rem; color: var(--text-light);">No feed items found.</td></tr>';
        return;
    }

    const validRows = items
        .filter(isValidFeedItem)
        .map(item => `
            <tr data-title="${escapeHtml(item.title.toLowerCase())}">
                <td>
                    <a href="${escapeHtml(item.link)}"
                       class="curation-title"
                       target="_blank"
                       rel="noopener noreferrer"
                       data-original-title="${escapeHtml(item.title)}">
                        ${escapeHtml(item.title)}
                    </a>
                </td>
                <td><span class="category-tag">${escapeHtml(item.category)}</span></td>
                <td><span class="date-badge">${formatDate(item.created_at)}</span></td>
            </tr>
        `);

    tbody.innerHTML = validRows.join('');
}

// Render pagination controls
function renderFeedPagination() {
    const paginationContainer = document.getElementById('feedPagination');
    if (!paginationContainer) return;

    if (totalFeedPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHtml = '<div class="pagination-controls">';

    // Previous button
    paginationHtml += `<button class="pagination-btn ${currentFeedPage === 1 ? 'disabled' : ''}"
        onclick="goToFeedPage(${currentFeedPage - 1})"
        ${currentFeedPage === 1 ? 'disabled' : ''}>Prev</button>`;

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentFeedPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalFeedPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        paginationHtml += `<button class="pagination-btn" onclick="goToFeedPage(1)">1</button>`;
        if (startPage > 2) {
            paginationHtml += `<span class="pagination-ellipsis">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHtml += `<button class="pagination-btn ${i === currentFeedPage ? 'active' : ''}"
            onclick="goToFeedPage(${i})">${i}</button>`;
    }

    if (endPage < totalFeedPages) {
        if (endPage < totalFeedPages - 1) {
            paginationHtml += `<span class="pagination-ellipsis">...</span>`;
        }
        paginationHtml += `<button class="pagination-btn" onclick="goToFeedPage(${totalFeedPages})">${totalFeedPages}</button>`;
    }

    // Next button
    paginationHtml += `<button class="pagination-btn ${currentFeedPage === totalFeedPages ? 'disabled' : ''}"
        onclick="goToFeedPage(${currentFeedPage + 1})"
        ${currentFeedPage === totalFeedPages ? 'disabled' : ''}>Next</button>`;

    paginationHtml += '</div>';
    paginationContainer.innerHTML = paginationHtml;
}

// Go to specific page (must be global for onclick)
window.goToFeedPage = function(page) {
    if (page < 1 || page > totalFeedPages || page === currentFeedPage) return;
    loadFeed(page);
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
    const safeSearch = escapedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeSearch})`, 'gi');
    return escapedText.replace(regex, '<span class="highlight">$1</span>');
}

// Update search results count
function updateFeedSearchCount(visible, total) {
    const countElement = document.getElementById('feedSearchCount');
    if (countElement) {
        if (total > 0) {
            countElement.textContent = `Page ${currentFeedPage} of ${totalFeedPages} (${total} total)`;
        } else {
            countElement.textContent = '';
        }
    }
}

// Filter feed based on search input
function filterFeed(searchTerm) {
    const tbody = document.getElementById('feedTableBody');
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

// Setup feed search handlers
function setupFeedHandlers() {
    if (feedInitialized) return;

    const searchInput = document.getElementById('feedSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterFeed(e.target.value);
        });

        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                filterFeed('');
            }
        });
    }

    feedInitialized = true;
}

// Mobile menu toggle
function setupMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');

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

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    const spans = navToggle.querySelectorAll('span');
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
            }
        });
    }
}

// Initialize feed when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupFeedHandlers();
    setupMobileMenu();
    loadFeed(1);
});
