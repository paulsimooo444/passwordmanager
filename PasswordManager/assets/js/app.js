/**
 * Harbor Vault - Password Manager Application
 * Maritime-themed secure password storage
 * Multi-user version with mobile responsiveness
 */

const API_BASE = 'api/index.php';

// Application State
const state = {
    isAuthenticated: false,
    user: null,
    entries: [],
    categories: [],
    currentCategory: 'all',
    searchQuery: '',
    searchTimeout: null,
    editingEntry: null,
    sidebarOpen: false
};

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupEventListeners();
});

function setupEventListeners() {
    // Close sidebar on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSidebar();
            hideEntryModal();
            hideViewModal();
            hideSettings();
        }
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('sidebar');
        const menuBtn = document.getElementById('mobile-menu-btn');
        if (state.sidebarOpen && sidebar && !sidebar.contains(e.target) && !menuBtn?.contains(e.target)) {
            closeSidebar();
        }
    });
}

async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_BASE}?action=check-auth`);
        const data = await response.json();
        
        state.isAuthenticated = data.isAuthenticated;
        
        if (data.isAuthenticated && data.user) {
            state.user = data.user;
            showApp();
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
    }
}

// ==================== AUTHENTICATION ====================

function showAuth(type) {
    const modal = document.getElementById('auth-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Clear any previous error messages
    document.getElementById('auth-error')?.classList.add('hidden');
    document.getElementById('login-auth-error')?.classList.add('hidden');
    
    // Show modal
    modal?.classList.remove('hidden');
    
    if (type === 'login') {
        loginForm?.classList.remove('hidden');
        registerForm?.classList.add('hidden');
        document.getElementById('login-identifier')?.focus();
    } else {
        registerForm?.classList.remove('hidden');
        loginForm?.classList.add('hidden');
        document.getElementById('register-username')?.focus();
    }
}

function hideAuth() {
    document.getElementById('auth-modal')?.classList.add('hidden');
    document.getElementById('login-form')?.classList.add('hidden');
    document.getElementById('register-form')?.classList.add('hidden');
}

async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    const errorDiv = document.getElementById('auth-error');
    const btn = document.getElementById('register-btn');
    
    // Hide any previous errors
    errorDiv?.classList.add('hidden');
    
    // Client-side validation
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        errorDiv.classList.remove('hidden');
        return;
    }
    
    if (password.length < 8) {
        errorDiv.textContent = 'Password must be at least 8 characters';
        errorDiv.classList.remove('hidden');
        return;
    }
    
    // Show loading state
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `
        <svg class="animate-spin h-5 w-5 mr-2 inline" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Creating Account...
    `;
    
    try {
        const response = await fetch(`${API_BASE}?action=register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, confirmPassword })
        });
        const data = await response.json();
        
        if (data.success) {
            state.isAuthenticated = true;
            state.user = data.user;
            hideAuth();
            showApp();
        } else {
            errorDiv.textContent = data.message;
            errorDiv.classList.remove('hidden');
        }
    } catch (error) {
        errorDiv.textContent = 'Connection error. Please try again.';
        errorDiv.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const identifier = document.getElementById('login-identifier').value.trim();
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-auth-error');
    const btn = document.getElementById('login-btn');
    
    // Hide any previous errors
    errorDiv?.classList.add('hidden');
    
    // Show loading state
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `
        <svg class="animate-spin h-5 w-5 mr-2 inline" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Signing In...
    `;
    
    try {
        const response = await fetch(`${API_BASE}?action=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password })
        });
        const data = await response.json();
        
        if (data.success) {
            state.isAuthenticated = true;
            state.user = data.user;
            hideAuth();
            showApp();
        } else {
            errorDiv.textContent = data.message;
            errorDiv.classList.remove('hidden');
        }
    } catch (error) {
        errorDiv.textContent = 'Connection error. Please try again.';
        errorDiv.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

async function handleLogout() {
    try {
        await fetch(`${API_BASE}?action=logout`);
        state.isAuthenticated = false;
        state.user = null;
        state.entries = [];
        state.categories = [];
        state.currentCategory = 'all';
        document.getElementById('app').classList.add('hidden');
        document.getElementById('landing-page').classList.remove('hidden');
        
        // Clear form fields
        document.querySelectorAll('input[type="password"], input[type="text"], input[type="email"]').forEach(input => {
            input.value = '';
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// ==================== SIDEBAR MOBILE ====================

function toggleSidebar() {
    state.sidebarOpen = !state.sidebarOpen;
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (state.sidebarOpen) {
        sidebar?.classList.remove('-translate-x-full');
        overlay?.classList.remove('hidden');
    } else {
        sidebar?.classList.add('-translate-x-full');
        overlay?.classList.add('hidden');
    }
}

function closeSidebar() {
    state.sidebarOpen = false;
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar?.classList.add('-translate-x-full');
    overlay?.classList.add('hidden');
}

// ==================== MAIN APPLICATION ====================

function showApp() {
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    renderApp();
    loadEntries();
    loadCategories();
}

function renderApp() {
    const app = document.getElementById('app');
    const username = state.user?.username || 'User';
    
    app.innerHTML = `
        <!-- Mobile Sidebar Overlay -->
        <div id="sidebar-overlay" class="fixed inset-0 bg-navy-950/80 z-40 hidden lg:hidden" onclick="closeSidebar()"></div>
        
        <!-- Top Navigation -->
        <nav class="bg-navy-900 text-white shadow-lg sticky top-0 z-30">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-14 sm:h-16">
                    <!-- Left: Menu button (mobile) + Logo -->
                    <div class="flex items-center space-x-2 sm:space-x-3">
                        <button id="mobile-menu-btn" onclick="toggleSidebar()" class="p-2 hover:bg-navy-800 rounded-lg lg:hidden">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                            </svg>
                        </button>
                        <svg class="w-7 h-7 sm:w-8 sm:h-8 text-sky-medium" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                        <span class="font-serif text-lg sm:text-xl font-semibold hidden sm:inline">Harbor Vault</span>
                    </div>
                    
                    <!-- Center: Search Bar (hidden on small mobile) -->
                    <div class="flex-1 max-w-md mx-2 sm:mx-4 lg:mx-8 hidden sm:block">
                        <div class="relative">
                            <input type="text" id="search-input" placeholder="Search entries..." 
                                class="w-full pl-10 pr-4 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-sky-dark focus:border-transparent text-sm"
                                oninput="handleSearch(this.value)">
                            <svg class="absolute left-3 top-2.5 w-4 h-4 sm:w-5 sm:h-5 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                        </div>
                    </div>

                    <!-- Right: User info + Actions -->
                    <div class="flex items-center space-x-2 sm:space-x-4">
                        <!-- Mobile search toggle -->
                        <button onclick="toggleMobileSearch()" class="p-2 hover:bg-navy-800 rounded-lg sm:hidden">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                        </button>
                        
                        <!-- User greeting (hidden on small screens) -->
                        <span class="text-sky-light text-sm hidden md:inline">Welcome, <strong>${escapeHtml(username)}</strong></span>
                        
                        <button onclick="showSettings()" class="p-2 hover:bg-navy-800 rounded-lg transition-colors" title="Settings">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                        </button>
                        <button onclick="handleLogout()" class="px-3 py-1.5 sm:px-4 sm:py-2 bg-navy-800 hover:bg-navy-700 rounded-lg transition-colors text-xs sm:text-sm font-medium">
                            <span class="hidden sm:inline">Lock Vault</span>
                            <svg class="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <!-- Mobile Search Bar (hidden by default) -->
                <div id="mobile-search" class="hidden sm:hidden pb-3">
                    <div class="relative">
                        <input type="text" id="mobile-search-input" placeholder="Search entries..." 
                            class="w-full pl-10 pr-4 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-sky-dark focus:border-transparent text-sm"
                            oninput="handleSearch(this.value)">
                        <svg class="absolute left-3 top-2.5 w-5 h-5 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div class="flex gap-4 lg:gap-8">
                <!-- Sidebar - transforms to slide-out on mobile -->
                <aside id="sidebar" class="fixed inset-y-0 left-0 w-72 bg-white shadow-xl z-50 transform -translate-x-full transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-64 lg:flex-shrink-0 lg:shadow-none lg:bg-transparent overflow-y-auto">
                    <!-- Mobile sidebar header -->
                    <div class="lg:hidden sticky top-0 bg-navy-900 text-white p-4 flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <svg class="w-6 h-6 text-sky-medium" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                            <span class="font-serif font-semibold">Harbor Vault</span>
                        </div>
                        <button onclick="closeSidebar()" class="p-2 hover:bg-navy-800 rounded-lg">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Mobile user info -->
                    <div class="lg:hidden p-4 bg-navy-50 border-b border-navy-100">
                        <p class="text-sm text-navy-600">Logged in as</p>
                        <p class="font-semibold text-navy-900">${escapeHtml(username)}</p>
                        ${state.user?.email ? `<p class="text-xs text-navy-500">${escapeHtml(state.user.email)}</p>` : ''}
                    </div>
                    
                    <div class="p-4 lg:p-0">
                        <button onclick="showEntryModal(); closeSidebar();" class="w-full mb-4 lg:mb-6 px-4 py-3 bg-navy-900 text-white rounded-xl font-semibold hover:bg-navy-800 transition-colors flex items-center justify-center space-x-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                            </svg>
                            <span>Add New Entry</span>
                        </button>

                        <div class="bg-white rounded-xl shadow-sm border border-navy-100 overflow-hidden lg:shadow-sm">
                            <div class="p-4 bg-navy-50 border-b border-navy-100">
                                <h3 class="font-semibold text-navy-900">Categories</h3>
                            </div>
                            <div id="categories-list" class="p-2">
                                <!-- Categories will be rendered here -->
                            </div>
                        </div>

                        <!-- Quick Stats -->
                        <div class="mt-4 lg:mt-6 p-4 bg-gradient-to-br from-navy-900 to-navy-800 rounded-xl text-white">
                            <h3 class="font-semibold mb-3 text-sky-light">Quick Stats</h3>
                            <div id="quick-stats" class="space-y-2 text-sm">
                                <!-- Stats will be rendered here -->
                            </div>
                        </div>
                        
                        <!-- Mobile logout button -->
                        <button onclick="handleLogout()" class="lg:hidden w-full mt-4 px-4 py-3 border border-navy-200 text-navy-700 rounded-xl font-medium hover:bg-navy-50 transition-colors flex items-center justify-center space-x-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                            </svg>
                            <span>Lock Vault</span>
                        </button>
                    </div>
                </aside>

                <!-- Main Content -->
                <main class="flex-1 min-w-0">
                    <div class="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <h2 class="font-serif text-xl sm:text-2xl font-semibold text-navy-900" id="current-view-title">All Entries</h2>
                        <span id="entries-count" class="text-pewter-dark text-sm"></span>
                    </div>

                    <div id="entries-grid" class="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                        <!-- Entries will be rendered here -->
                    </div>

                    <!-- Empty State -->
                    <div id="empty-state" class="hidden text-center py-8 sm:py-16">
                        <svg class="w-16 h-16 sm:w-24 sm:h-24 mx-auto text-navy-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                        <h3 class="font-serif text-lg sm:text-xl text-navy-900 mb-2">No entries yet</h3>
                        <p class="text-pewter-dark mb-4 sm:mb-6 text-sm sm:text-base px-4">Start securing your passwords by adding your first entry</p>
                        <button onclick="showEntryModal()" class="px-5 py-2.5 sm:px-6 sm:py-3 bg-navy-900 text-white rounded-lg font-medium hover:bg-navy-800 transition-colors text-sm sm:text-base">
                            Add Your First Entry
                        </button>
                    </div>
                </main>
            </div>
        </div>

        <!-- Entry Modal -->
        <div id="entry-modal" class="fixed inset-0 z-50 hidden">
            <div class="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" onclick="hideEntryModal()"></div>
            <div class="relative flex items-end sm:items-center justify-center min-h-screen sm:p-4">
                <div class="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                    <div class="px-4 sm:px-6 py-4 bg-navy-900 text-white flex justify-between items-center sticky top-0">
                        <h3 id="entry-modal-title" class="font-serif text-lg sm:text-xl font-semibold">Add New Entry</h3>
                        <button onclick="hideEntryModal()" class="p-1 hover:bg-navy-800 rounded">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    <form id="entry-form" onsubmit="handleEntrySave(event)" class="p-4 sm:p-6 space-y-4">
                        <input type="hidden" id="entry-id">
                        
                        <div>
                            <label class="block text-sm font-medium text-navy-700 mb-1">Title *</label>
                            <input type="text" id="entry-title" required
                                class="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-sky-dark focus:border-transparent text-base"
                                placeholder="e.g., Gmail Account">
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-navy-700 mb-1">Username / Email</label>
                                <input type="text" id="entry-username"
                                    class="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-sky-dark focus:border-transparent text-base"
                                    placeholder="user@email.com">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-navy-700 mb-1">Category</label>
                                <input type="hidden" id="entry-category" value="general">
                                <div class="custom-dropdown" id="category-dropdown">
                                    <button type="button" class="custom-dropdown-btn" onclick="toggleDropdown('category-dropdown')">
                                        <span class="flex items-center gap-3">
                                            <span class="dropdown-icon" id="selected-icon">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <circle cx="12" cy="5" r="2"/>
                                                    <line x1="12" y1="7" x2="12" y2="20"/>
                                                    <path d="M5 17c0-3 3-4 7-4s7 1 7 4"/>
                                                </svg>
                                            </span>
                                            <span class="dropdown-text" id="selected-text">General</span>
                                        </span>
                                        <svg class="custom-dropdown-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                                        </svg>
                                    </button>
                                    <div class="custom-dropdown-menu">
                                        <div class="custom-dropdown-item selected" data-value="general" onclick="selectDropdownCategory(this, 'general', 'General')">
                                            <span class="dropdown-icon">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <circle cx="12" cy="5" r="2"/>
                                                    <line x1="12" y1="7" x2="12" y2="20"/>
                                                    <path d="M5 17c0-3 3-4 7-4s7 1 7 4"/>
                                                </svg>
                                            </span>
                                            <span class="dropdown-text">General</span>
                                        </div>
                                        <div class="custom-dropdown-item" data-value="social" onclick="selectDropdownCategory(this, 'social', 'Social Media')">
                                            <span class="dropdown-icon">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                                    <circle cx="9" cy="7" r="4"/>
                                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                                </svg>
                                            </span>
                                            <span class="dropdown-text">Social Media</span>
                                        </div>
                                        <div class="custom-dropdown-item" data-value="finance" onclick="selectDropdownCategory(this, 'finance', 'Finance')">
                                            <span class="dropdown-icon">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <circle cx="12" cy="12" r="10"/>
                                                    <path d="M12 6v12M8 10h8M8 14h8"/>
                                                </svg>
                                            </span>
                                            <span class="dropdown-text">Finance</span>
                                        </div>
                                        <div class="custom-dropdown-item" data-value="work" onclick="selectDropdownCategory(this, 'work', 'Work')">
                                            <span class="dropdown-icon">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                                                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                                                    <line x1="12" y1="12" x2="12" y2="12"/>
                                                </svg>
                                            </span>
                                            <span class="dropdown-text">Work</span>
                                        </div>
                                        <div class="custom-dropdown-item" data-value="shopping" onclick="selectDropdownCategory(this, 'shopping', 'Shopping')">
                                            <span class="dropdown-icon">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                                                    <line x1="3" y1="6" x2="21" y2="6"/>
                                                    <path d="M16 10a4 4 0 0 1-8 0"/>
                                                </svg>
                                            </span>
                                            <span class="dropdown-text">Shopping</span>
                                        </div>
                                        <div class="custom-dropdown-item" data-value="entertainment" onclick="selectDropdownCategory(this, 'entertainment', 'Entertainment')">
                                            <span class="dropdown-icon">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <polygon points="5 3 19 12 5 21 5 3"/>
                                                </svg>
                                            </span>
                                            <span class="dropdown-text">Entertainment</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-navy-700 mb-1">Password</label>
                            <div class="relative">
                                <input type="password" id="entry-password"
                                    class="w-full px-4 py-2.5 pr-24 border border-navy-200 rounded-lg focus:ring-2 focus:ring-sky-dark focus:border-transparent text-base"
                                    placeholder="Enter password">
                                <div class="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1">
                                    <button type="button" onclick="togglePasswordVisibility('entry-password')" class="p-1.5 text-navy-400 hover:text-navy-600">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                        </svg>
                                    </button>
                                    <button type="button" onclick="generatePassword()" class="p-1.5 text-navy-400 hover:text-navy-600" title="Generate Password">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-navy-700 mb-1">Website URL</label>
                            <input type="url" id="entry-url"
                                class="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-sky-dark focus:border-transparent text-base"
                                placeholder="https://example.com">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-navy-700 mb-1">Notes</label>
                            <textarea id="entry-notes" rows="3"
                                class="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-sky-dark focus:border-transparent resize-none text-base"
                                placeholder="Additional notes (encrypted)"></textarea>
                        </div>

                        <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                            <button type="button" onclick="hideEntryModal()" class="w-full sm:flex-1 px-4 py-2.5 border border-navy-200 text-navy-700 rounded-lg font-medium hover:bg-navy-50 transition-colors order-2 sm:order-1">
                                Cancel
                            </button>
                            <button type="submit" class="w-full sm:flex-1 px-4 py-2.5 bg-navy-900 text-white rounded-lg font-medium hover:bg-navy-800 transition-colors order-1 sm:order-2">
                                Save Entry
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- View Entry Modal -->
        <div id="view-modal" class="fixed inset-0 z-50 hidden">
            <div class="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" onclick="hideViewModal()"></div>
            <div class="relative flex items-end sm:items-center justify-center min-h-screen sm:p-4">
                <div id="view-modal-content" class="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                    <!-- Content will be rendered dynamically -->
                </div>
            </div>
        </div>

        <!-- Settings Modal -->
        <div id="settings-modal" class="fixed inset-0 z-50 hidden">
            <div class="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" onclick="hideSettings()"></div>
            <div class="relative flex items-end sm:items-center justify-center min-h-screen sm:p-4">
                <div class="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                    <div class="px-4 sm:px-6 py-4 bg-navy-900 text-white flex justify-between items-center sticky top-0">
                        <h3 class="font-serif text-lg sm:text-xl font-semibold">Settings</h3>
                        <button onclick="hideSettings()" class="p-1 hover:bg-navy-800 rounded">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    <div class="p-4 sm:p-6">
                        <!-- User Profile Section -->
                        <div class="mb-6 p-4 bg-navy-50 rounded-xl">
                            <div class="flex items-center space-x-3">
                                <div class="w-12 h-12 bg-navy-900 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                    ${username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p class="font-semibold text-navy-900">${escapeHtml(username)}</p>
                                    ${state.user?.email ? `<p class="text-sm text-navy-500">${escapeHtml(state.user.email)}</p>` : ''}
                                </div>
                            </div>
                        </div>
                        
                        <h4 class="font-semibold text-navy-900 mb-4">Change Password</h4>
                        <form onsubmit="handlePasswordChange(event)" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-navy-700 mb-1">Current Password</label>
                                <input type="password" id="current-password" required
                                    class="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-sky-dark focus:border-transparent text-base">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-navy-700 mb-1">New Password</label>
                                <input type="password" id="new-password" required minlength="8"
                                    class="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-sky-dark focus:border-transparent text-base">
                            </div>
                            <div id="settings-error" class="hidden p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"></div>
                            <div id="settings-success" class="hidden p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"></div>
                            <button type="submit" class="w-full px-4 py-2.5 bg-navy-900 text-white rounded-lg font-medium hover:bg-navy-800 transition-colors">
                                Update Password
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Toast Notification -->
        <div id="toast" class="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 hidden">
            <div class="px-4 sm:px-6 py-3 bg-navy-900 text-white rounded-lg shadow-lg flex items-center justify-center sm:justify-start space-x-3">
                <svg class="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span id="toast-message" class="text-sm sm:text-base"></span>
            </div>
        </div>
    `;
}

// Mobile search toggle
function toggleMobileSearch() {
    const mobileSearch = document.getElementById('mobile-search');
    const input = document.getElementById('mobile-search-input');
    mobileSearch?.classList.toggle('hidden');
    if (!mobileSearch?.classList.contains('hidden')) {
        input?.focus();
    }
}

// ==================== DATA LOADING ====================

async function loadEntries() {
    try {
        const params = new URLSearchParams({ action: 'entries' });
        if (state.currentCategory !== 'all') {
            params.append('category', state.currentCategory);
        }
        if (state.searchQuery) {
            params.append('search', state.searchQuery);
        }

        const response = await fetch(`${API_BASE}?${params}`);
        const data = await response.json();

        if (data.requireAuth) {
            handleLogout();
            return;
        }

        if (data.success) {
            state.entries = data.entries;
            renderEntries();
        }
    } catch (error) {
        console.error('Error loading entries:', error);
    }
}

async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}?action=categories`);
        const data = await response.json();

        if (data.success) {
            state.categories = data.categories;
            renderCategories(data.counts, data.total);
            renderStats(data.total, data.counts);
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// ==================== RENDERING ====================

function renderEntries() {
    const grid = document.getElementById('entries-grid');
    const emptyState = document.getElementById('empty-state');
    const countSpan = document.getElementById('entries-count');

    if (state.entries.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        countSpan.textContent = '';
        return;
    }

    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');
    countSpan.textContent = `${state.entries.length} ${state.entries.length === 1 ? 'entry' : 'entries'}`;

    grid.innerHTML = state.entries.map(entry => `
        <div class="bg-white rounded-xl shadow-sm border border-navy-100 hover:shadow-md hover:border-sky-dark/30 transition-all duration-300 cursor-pointer group"
            onclick="viewEntry(${entry.id})">
            <div class="p-5">
                <div class="flex items-start justify-between mb-3">
                    <div class="w-10 h-10 rounded-lg bg-navy-100 flex items-center justify-center text-navy-600 group-hover:bg-navy-900 group-hover:text-white transition-colors">
                        ${getCategoryIcon(entry.category)}
                    </div>
                    <span class="text-xs px-2 py-1 bg-navy-50 text-navy-600 rounded-full capitalize">${entry.category}</span>
                </div>
                <h4 class="font-semibold text-navy-900 mb-1 truncate">${escapeHtml(entry.title)}</h4>
                <p class="text-sm text-pewter-dark truncate">${escapeHtml(entry.username) || 'No username'}</p>
                ${entry.url ? `<p class="text-xs text-navy-400 mt-2 truncate">${escapeHtml(entry.url)}</p>` : ''}
            </div>
        </div>
    `).join('');
}

function renderCategories(counts, total) {
    const container = document.getElementById('categories-list');
    const countMap = {};
    counts.forEach(c => countMap[c.category] = c.count);

    const categories = [
        { key: 'all', label: 'All Entries', count: total },
        { key: 'general', label: 'General', count: countMap['general'] || 0 },
        { key: 'social', label: 'Social Media', count: countMap['social'] || 0 },
        { key: 'finance', label: 'Finance', count: countMap['finance'] || 0 },
        { key: 'work', label: 'Work', count: countMap['work'] || 0 },
        { key: 'shopping', label: 'Shopping', count: countMap['shopping'] || 0 },
        { key: 'entertainment', label: 'Entertainment', count: countMap['entertainment'] || 0 },
    ];

    container.innerHTML = categories.map(cat => `
        <button onclick="selectCategory('${cat.key}')" 
            class="w-full px-3 py-2 rounded-lg text-left flex justify-between items-center transition-colors ${state.currentCategory === cat.key ? 'bg-navy-900 text-white' : 'hover:bg-navy-50 text-navy-700'}">
            <span class="text-sm">${cat.label}</span>
            <span class="text-xs ${state.currentCategory === cat.key ? 'bg-white/20' : 'bg-navy-100'} px-2 py-0.5 rounded-full">${cat.count}</span>
        </button>
    `).join('');
}

function renderStats(total, counts) {
    const container = document.getElementById('quick-stats');
    container.innerHTML = `
        <div class="flex justify-between">
            <span class="text-navy-300">Total Entries</span>
            <span class="font-semibold">${total}</span>
        </div>
        <div class="flex justify-between">
            <span class="text-navy-300">Categories</span>
            <span class="font-semibold">${counts.length}</span>
        </div>
        <div class="flex justify-between">
            <span class="text-navy-300">Encryption</span>
            <span class="font-semibold text-green-400">AES-256</span>
        </div>
    `;
}

function getCategoryIcon(category) {
    const icons = {
        general: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>',
        social: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>',
        finance: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        work: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>',
        shopping: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>',
        entertainment: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
    };
    return icons[category] || icons.general;
}

// ==================== ENTRY OPERATIONS ====================

function showEntryModal(entry = null) {
    const modal = document.getElementById('entry-modal');
    const title = document.getElementById('entry-modal-title');
    const form = document.getElementById('entry-form');

    form.reset();
    document.getElementById('entry-id').value = '';
    
    // Reset dropdown to default
    setDropdownValue('general');

    if (entry) {
        title.textContent = 'Edit Entry';
        document.getElementById('entry-id').value = entry.id;
        document.getElementById('entry-title').value = entry.title;
        document.getElementById('entry-username').value = entry.username;
        document.getElementById('entry-password').value = entry.password;
        document.getElementById('entry-url').value = entry.url;
        document.getElementById('entry-notes').value = entry.notes;
        // Set custom dropdown value
        setDropdownValue(entry.category);
    } else {
        title.textContent = 'Add New Entry';
    }

    modal.classList.remove('hidden');
    document.getElementById('entry-title').focus();
}

function hideEntryModal() {
    document.getElementById('entry-modal').classList.add('hidden');
}

async function handleEntrySave(event) {
    event.preventDefault();

    const id = document.getElementById('entry-id').value;
    const data = {
        title: document.getElementById('entry-title').value,
        username: document.getElementById('entry-username').value,
        password: document.getElementById('entry-password').value,
        url: document.getElementById('entry-url').value,
        notes: document.getElementById('entry-notes').value,
        category: document.getElementById('entry-category').value
    };

    try {
        let response;
        if (id) {
            data.id = parseInt(id);
            response = await fetch(`${API_BASE}?action=entry&id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch(`${API_BASE}?action=entries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        const result = await response.json();
        if (result.success) {
            hideEntryModal();
            loadEntries();
            loadCategories();
            showToast(id ? 'Entry updated successfully' : 'Entry created successfully');
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error saving entry:', error);
        alert('Failed to save entry');
    }
}

async function viewEntry(id) {
    try {
        const response = await fetch(`${API_BASE}?action=entry&id=${id}`);
        const data = await response.json();

        if (data.success) {
            const entry = data.entry;
            const modal = document.getElementById('view-modal');
            const content = document.getElementById('view-modal-content');

            content.innerHTML = `
                <div class="px-4 sm:px-6 py-4 bg-navy-900 text-white flex justify-between items-center sticky top-0">
                    <h3 class="font-serif text-lg sm:text-xl font-semibold truncate pr-4">${escapeHtml(entry.title)}</h3>
                    <button onclick="hideViewModal()" class="p-1 hover:bg-navy-800 rounded flex-shrink-0">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="p-4 sm:p-6 space-y-4">
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-xs px-3 py-1 bg-navy-100 text-navy-700 rounded-full capitalize">${entry.category}</span>
                        <div class="flex space-x-2">
                            <button onclick="hideViewModal(); showEntryModal(${JSON.stringify(entry).replace(/"/g, '&quot;')})" 
                                class="p-2 text-navy-600 hover:bg-navy-100 rounded-lg transition-colors" title="Edit">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                            </button>
                            <button onclick="confirmDelete(${entry.id})" 
                                class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    ${entry.username ? `
                    <div>
                        <label class="block text-xs font-medium text-navy-500 uppercase tracking-wide mb-1">Username / Email</label>
                        <div class="flex items-center justify-between p-3 bg-navy-50 rounded-lg gap-2">
                            <span class="text-navy-900 truncate text-sm sm:text-base">${escapeHtml(entry.username)}</span>
                            <button onclick="copyToClipboard('${escapeHtml(entry.username)}')" class="text-navy-400 hover:text-navy-600 flex-shrink-0">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    ` : ''}

                    ${entry.password ? `
                    <div>
                        <label class="block text-xs font-medium text-navy-500 uppercase tracking-wide mb-1">Password</label>
                        <div class="flex items-center justify-between p-3 bg-navy-50 rounded-lg gap-2">
                            <span id="view-password" class="text-navy-900 font-mono text-sm sm:text-base">••••••••••••</span>
                            <div class="flex space-x-1 flex-shrink-0">
                                <button onclick="toggleViewPassword('${escapeHtml(entry.password)}')" class="text-navy-400 hover:text-navy-600 p-1">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                </button>
                                <button onclick="copyToClipboard('${escapeHtml(entry.password)}')" class="text-navy-400 hover:text-navy-600 p-1">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    ` : ''}

                    ${entry.url ? `
                    <div>
                        <label class="block text-xs font-medium text-navy-500 uppercase tracking-wide mb-1">Website</label>
                        <div class="flex items-center justify-between p-3 bg-navy-50 rounded-lg gap-2">
                            <a href="${escapeHtml(entry.url)}" target="_blank" class="text-sky-dark hover:underline truncate text-sm sm:text-base">${escapeHtml(entry.url)}</a>
                            <button onclick="copyToClipboard('${escapeHtml(entry.url)}')" class="text-navy-400 hover:text-navy-600 flex-shrink-0">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    ` : ''}

                    ${entry.notes ? `
                    <div>
                        <label class="block text-xs font-medium text-navy-500 uppercase tracking-wide mb-1">Notes</label>
                        <div class="p-3 bg-navy-50 rounded-lg">
                            <p class="text-navy-900 whitespace-pre-wrap text-sm sm:text-base">${escapeHtml(entry.notes)}</p>
                        </div>
                    </div>
                    ` : ''}

                    <div class="pt-4 border-t border-navy-100 text-xs text-navy-400">
                        <p>Created: ${formatDate(entry.created_at)}</p>
                        <p>Last updated: ${formatDate(entry.updated_at)}</p>
                    </div>
                </div>
            `;

            modal.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading entry:', error);
    }
}

function hideViewModal() {
    document.getElementById('view-modal').classList.add('hidden');
}

async function confirmDelete(id) {
    if (confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
        try {
            const response = await fetch(`${API_BASE}?action=entry&id=${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (data.success) {
                hideViewModal();
                loadEntries();
                loadCategories();
                showToast('Entry deleted successfully');
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error deleting entry:', error);
            alert('Failed to delete entry');
        }
    }
}

// ==================== UTILITY FUNCTIONS ====================

function selectCategory(category) {
    state.currentCategory = category;
    document.getElementById('current-view-title').textContent = 
        category === 'all' ? 'All Entries' : category.charAt(0).toUpperCase() + category.slice(1);
    loadEntries();
    loadCategories();
    closeSidebar(); // Close sidebar on mobile after selecting
}

function handleSearch(query) {
    state.searchQuery = query;
    // Sync search inputs
    const searchInput = document.getElementById('search-input');
    const mobileSearchInput = document.getElementById('mobile-search-input');
    if (searchInput && searchInput.value !== query) searchInput.value = query;
    if (mobileSearchInput && mobileSearchInput.value !== query) mobileSearchInput.value = query;
    
    clearTimeout(state.searchTimeout);
    state.searchTimeout = setTimeout(() => {
        loadEntries();
    }, 300);
}

async function generatePassword() {
    try {
        const response = await fetch(`${API_BASE}?action=generate-password&length=20`);
        const data = await response.json();
        if (data.success) {
            document.getElementById('entry-password').value = data.password;
            document.getElementById('entry-password').type = 'text';
        }
    } catch (error) {
        console.error('Error generating password:', error);
    }
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

let passwordVisible = false;
function toggleViewPassword(password) {
    const span = document.getElementById('view-password');
    passwordVisible = !passwordVisible;
    span.textContent = passwordVisible ? password : '••••••••••••';
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const messageSpan = document.getElementById('toast-message');
    messageSpan.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function showSettings() {
    document.getElementById('settings-modal').classList.remove('hidden');
}

function hideSettings() {
    document.getElementById('settings-modal').classList.add('hidden');
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('settings-error').classList.add('hidden');
    document.getElementById('settings-success').classList.add('hidden');
}

async function handlePasswordChange(event) {
    event.preventDefault();
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const errorDiv = document.getElementById('settings-error');
    const successDiv = document.getElementById('settings-success');

    try {
        const response = await fetch(`${API_BASE}?action=change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        const data = await response.json();

        if (data.success) {
            errorDiv.classList.add('hidden');
            successDiv.textContent = data.message;
            successDiv.classList.remove('hidden');
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
        } else {
            successDiv.classList.add('hidden');
            errorDiv.textContent = data.message;
            errorDiv.classList.remove('hidden');
        }
    } catch (error) {
        errorDiv.textContent = 'Connection error. Please try again.';
        errorDiv.classList.remove('hidden');
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ==================== CUSTOM DROPDOWN ====================

const categoryIcons = {
    general: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="5" r="2"/>
        <line x1="12" y1="7" x2="12" y2="20"/>
        <path d="M5 17c0-3 3-4 7-4s7 1 7 4"/>
    </svg>`,
    social: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>`,
    finance: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v12M8 10h8M8 14h8"/>
    </svg>`,
    work: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="12"/>
    </svg>`,
    shopping: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>`,
    entertainment: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>`
};

const categoryNames = {
    general: 'General',
    social: 'Social Media',
    finance: 'Finance',
    work: 'Work',
    shopping: 'Shopping',
    entertainment: 'Entertainment'
};

function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const btn = dropdown.querySelector('.custom-dropdown-btn');
    const menu = dropdown.querySelector('.custom-dropdown-menu');
    
    const isOpen = btn.classList.contains('open');
    
    // Close all other dropdowns first
    document.querySelectorAll('.custom-dropdown').forEach(d => {
        d.querySelector('.custom-dropdown-btn')?.classList.remove('open');
        d.querySelector('.custom-dropdown-menu')?.classList.remove('open');
    });
    
    if (!isOpen) {
        btn.classList.add('open');
        menu.classList.add('open');
    }
}

function selectDropdownCategory(element, value, text) {
    const dropdown = element.closest('.custom-dropdown');
    const hiddenInput = document.getElementById('entry-category');
    const selectedIcon = document.getElementById('selected-icon');
    const selectedText = document.getElementById('selected-text');
    
    // Update hidden input value
    hiddenInput.value = value;
    
    // Update button display
    selectedIcon.innerHTML = categoryIcons[value];
    selectedText.textContent = text;
    
    // Update selected state
    dropdown.querySelectorAll('.custom-dropdown-item').forEach(item => {
        item.classList.remove('selected');
    });
    element.classList.add('selected');
    
    // Close dropdown
    dropdown.querySelector('.custom-dropdown-btn').classList.remove('open');
    dropdown.querySelector('.custom-dropdown-menu').classList.remove('open');
}

function setDropdownValue(value) {
    const dropdown = document.getElementById('category-dropdown');
    if (!dropdown) return;
    
    const hiddenInput = document.getElementById('entry-category');
    const selectedIcon = document.getElementById('selected-icon');
    const selectedText = document.getElementById('selected-text');
    
    hiddenInput.value = value;
    selectedIcon.innerHTML = categoryIcons[value] || categoryIcons.general;
    selectedText.textContent = categoryNames[value] || 'General';
    
    // Update selected state in menu
    dropdown.querySelectorAll('.custom-dropdown-item').forEach(item => {
        if (item.dataset.value === value) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-dropdown')) {
        document.querySelectorAll('.custom-dropdown').forEach(d => {
            d.querySelector('.custom-dropdown-btn')?.classList.remove('open');
            d.querySelector('.custom-dropdown-menu')?.classList.remove('open');
        });
    }
});
