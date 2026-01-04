<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Harbor Vault | Secure Password Manager</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        navy: {
                            50: '#f0f4f8',
                            100: '#d9e2ec',
                            200: '#bcccdc',
                            300: '#9fb3c8',
                            400: '#829ab1',
                            500: '#627d98',
                            600: '#486581',
                            700: '#334e68',
                            800: '#243b53',
                            900: '#102a43',
                            950: '#0a1929',
                        },
                        sky: {
                            light: '#e0f2fe',
                            medium: '#7dd3fc',
                            dark: '#0284c7',
                        },
                        pewter: {
                            light: '#e2e8f0',
                            medium: '#94a3b8',
                            dark: '#64748b',
                        },
                        ocean: {
                            light: '#38bdf8',
                            DEFAULT: '#0ea5e9',
                            dark: '#0369a1',
                        }
                    },
                    fontFamily: {
                        'serif': ['Playfair Display', 'Georgia', 'serif'],
                        'sans': ['Inter', 'system-ui', 'sans-serif'],
                    }
                }
            }
        }
    </script>
    <link href="css/styles.css" rel="stylesheet">
</head>
<body class="bg-ocean font-sans text-navy-900">
    
    <!-- Landing Page -->
    <div id="landing-page" class="min-h-screen">
        <!-- Hero Section -->
        <section class="hero-gradient ocean-overlay min-h-screen relative overflow-hidden">
            <!-- Navigation -->
            <nav class="absolute top-0 left-0 right-0 z-20 px-4 sm:px-6 py-4 sm:py-6">
                <div class="max-w-7xl mx-auto flex justify-between items-center">
                    <div class="flex items-center space-x-2 sm:space-x-3">
                        <svg class="w-8 h-8 sm:w-10 sm:h-10 text-sky-medium" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                        <span class="font-serif text-xl sm:text-2xl font-semibold text-white">Harbor Vault</span>
                    </div>
                    <div class="flex items-center space-x-2 sm:space-x-4">
                        <button onclick="showAuth('login')" class="px-4 sm:px-6 py-2 sm:py-2.5 bg-sky-medium/20 hover:bg-sky-medium/30 text-white rounded-lg border border-sky-medium/40 transition-all duration-300 font-medium text-sm sm:text-base">
                            Sign In
                        </button>
                        <button onclick="showAuth('register')" class="hidden sm:block px-6 py-2.5 bg-white text-navy-900 rounded-lg hover:bg-sky-light transition-all duration-300 font-medium">
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            <!-- Hero Content -->
            <div class="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 text-center pt-16 pb-16">
                <!-- Decorative anchor icon -->
                <div class="wave-animation mb-6 sm:mb-8">
                    <svg class="w-16 h-16 sm:w-20 sm:h-20 text-sky-medium" viewBox="0 0 204.851 204.851" fill="currentColor" xmlns="http://www.w3.org/2000/svg" >
                        <path d="M139.518,128.595l16.834,16.336c0,0-20.644,29.877-42.725,30.473 c0.479,0,0.117-84.092,0.039-104.472c14.694-4.797,25.402-18.182,25.402-34.117c0-20.009-16.697-36.218-37.273-36.218 c-20.615,0-37.312,16.209-37.312,36.208c0,15.671,10.376,28.929,24.748,33.961l0.098,104.277 c-26.643-1.837-42.061-27.474-42.061-27.474l17.997-17.41L0,120.505l9.887,63.301l17.362-16.795 c15.036,12.105,32.017,37.244,72.876,37.244c51.332-1.309,63.184-28.939,76.344-39.804l18.993,18.514l9.389-63.907 L139.518,128.595z M82.558,36.208c0-10.298,8.608-18.661,19.218-18.661s19.257,8.363,19.257,18.661 c0,10.327-8.647,18.681-19.257,18.681S82.558,46.535,82.558,36.208z"/>
                    </svg>

                </div>

                <h1 class="font-serif text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                    Your Secrets,<br>
                    <span class="text-sky-medium">Safely Anchored</span>
                </h1>
                
                <p class="text-lg sm:text-xl md:text-2xl text-sky-light/90 max-w-2xl mb-8 sm:mb-12 font-light leading-relaxed px-4">
                    A secure harbor for your passwords and sensitive notes. 
                    Military-grade encryption meets elegant simplicity.
                </p>

                <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
                    <button onclick="showAuth('register')" class="w-full sm:w-auto px-8 py-4 bg-white text-navy-900 rounded-xl font-semibold text-lg hover:bg-sky-light transition-all duration-300 shadow-2xl hover:shadow-sky-medium/20 hover:scale-105">
                        Create Free Account
                    </button>
                    <button onclick="showAuth('login')" class="w-full sm:w-auto px-8 py-4 bg-sky-medium/20 border-2 border-sky-medium/50 text-white rounded-xl font-semibold text-lg hover:bg-sky-medium/30 transition-all duration-300">
                        Sign In
                    </button>
                </div>
            </div>

            <!-- Scroll indicator -->
            <div class="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block">
                <svg class="w-6 h-6 text-sky-light/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                </svg>
            </div>
        </section>

        <!-- Features Section -->
        <section id="features" class="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-white to-navy-50">
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-12 sm:mb-16">
                    <h2 class="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 mb-4">
                        Engineered for Security
                    </h2>
                    <p class="text-lg sm:text-xl text-navy-600 max-w-2xl mx-auto">
                        Built with precision and care, like a vessel crafted for the high seas.
                    </p>
                </div>

                <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    <!-- Feature Card 1 -->
                    <div class="group p-6 sm:p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-navy-100 hover:border-ocean/30">
                        <div class="w-14 h-14 sm:w-16 sm:h-16 bg-navy-900 rounded-xl flex items-center justify-center mb-5 sm:mb-6 group-hover:bg-ocean transition-colors duration-300">
                            <svg class="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                        </div>
                        <h3 class="font-serif text-xl sm:text-2xl font-semibold text-navy-900 mb-3">AES-256 Encryption</h3>
                        <p class="text-navy-600 leading-relaxed">
                            Your data is protected with military-grade encryption. Even we can't read your secrets.
                        </p>
                    </div>

                    <!-- Feature Card 2 -->
                    <div class="group p-6 sm:p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-navy-100 hover:border-ocean/30">
                        <div class="w-14 h-14 sm:w-16 sm:h-16 bg-navy-900 rounded-xl flex items-center justify-center mb-5 sm:mb-6 group-hover:bg-ocean transition-colors duration-300">
                            <svg class="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                            </svg>
                        </div>
                        <h3 class="font-serif text-xl sm:text-2xl font-semibold text-navy-900 mb-3">Multi-User Support</h3>
                        <p class="text-navy-600 leading-relaxed">
                            Create your own account with email and password. Each user has their own secure vault.
                        </p>
                    </div>

                    <!-- Feature Card 3 -->
                    <div class="group p-6 sm:p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-navy-100 hover:border-ocean/30 sm:col-span-2 lg:col-span-1">
                        <div class="w-14 h-14 sm:w-16 sm:h-16 bg-navy-900 rounded-xl flex items-center justify-center mb-5 sm:mb-6 group-hover:bg-ocean transition-colors duration-300">
                            <svg class="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                            </svg>
                        </div>
                        <h3 class="font-serif text-xl sm:text-2xl font-semibold text-navy-900 mb-3">Access Anywhere</h3>
                        <p class="text-navy-600 leading-relaxed">
                            Access your passwords from any device. Fully responsive design for mobile and desktop.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="py-16 sm:py-24 px-4 sm:px-6 hero-gradient">
            <div class="max-w-4xl mx-auto text-center">
                <h2 class="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
                    Ready to Secure Your Digital Life?
                </h2>
                <p class="text-lg sm:text-xl text-sky-light/90 mb-8 sm:mb-10 max-w-2xl mx-auto">
                    Set sail with Harbor Vault today. Your passwords deserve a safe harbor.
                </p>
                <button onclick="showAuth('register')" class="px-8 sm:px-10 py-4 bg-white text-navy-900 rounded-xl font-semibold text-lg hover:bg-sky-light transition-all duration-300 shadow-2xl hover:scale-105">
                    Create Your Free Account
                </button>
            </div>
        </section>

        <!-- Footer -->
        <footer class="py-6 sm:py-8 px-4 sm:px-6 bg-navy-950 text-center">
            <p class="text-navy-300 text-sm">
                &copy; 2025 Harbor Vault. Engineered with precision.
            </p>
        </footer>
    </div>

    <!-- Auth Modal (Login/Register) -->
    <div id="auth-modal" class="fixed inset-0 z-50 hidden">
        <div class="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" onclick="hideAuth()"></div>
        <div class="relative flex items-center justify-center min-h-screen p-4">
            <div class="glass-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden fade-in relative">
                
                <!-- Close Button -->
                <button onclick="hideAuth()" class="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-navy-100 hover:bg-navy-200 text-navy-600 hover:text-navy-900 transition-all duration-200 group" title="Close">
                    <svg class="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
                
                <!-- Register Form -->
                <div id="register-form" class="hidden">
                    <div class="px-6 sm:px-8 pt-8 pb-6">
                        <div class="text-center mb-6">
                            <div class="w-14 h-14 sm:w-16 sm:h-16 bg-navy-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg class="w-7 h-7 sm:w-8 sm:h-8 text-sky-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                                </svg>
                            </div>
                            <h2 class="font-serif text-2xl sm:text-3xl font-bold text-navy-900">Create Account</h2>
                            <p class="text-navy-600 mt-2 text-sm sm:text-base">Start securing your passwords today</p>
                        </div>
                        <form onsubmit="handleRegister(event)" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-navy-700 mb-1.5">Username</label>
                                <input type="text" id="register-username" required minlength="3" maxlength="50"
                                    class="w-full px-4 py-3 border border-navy-200 rounded-xl focus:ring-2 focus:ring-ocean focus:border-ocean bg-white text-navy-900 placeholder-navy-400 transition-all"
                                    placeholder="Choose a username">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-navy-700 mb-1.5">Email Address</label>
                                <input type="email" id="register-email" required
                                    class="w-full px-4 py-3 border border-navy-200 rounded-xl focus:ring-2 focus:ring-ocean focus:border-ocean bg-white text-navy-900 placeholder-navy-400 transition-all"
                                    placeholder="your@email.com">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-navy-700 mb-1.5">Password</label>
                                <input type="password" id="register-password" required minlength="8"
                                    class="w-full px-4 py-3 border border-navy-200 rounded-xl focus:ring-2 focus:ring-ocean focus:border-ocean bg-white text-navy-900 placeholder-navy-400 transition-all"
                                    placeholder="Minimum 8 characters">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-navy-700 mb-1.5">Confirm Password</label>
                                <input type="password" id="register-confirm" required minlength="8"
                                    class="w-full px-4 py-3 border border-navy-200 rounded-xl focus:ring-2 focus:ring-ocean focus:border-ocean bg-white text-navy-900 placeholder-navy-400 transition-all"
                                    placeholder="Repeat your password">
                            </div>
                            <div id="auth-error" class="hidden p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center"></div>
                            <button type="submit" id="register-btn" class="w-full mt-2 px-6 py-3 bg-navy-900 text-white rounded-xl font-semibold hover:bg-navy-800 transition-colors">
                                Create Account
                            </button>
                        </form>
                    </div>
                    <div class="px-6 sm:px-8 py-4 bg-navy-50 border-t border-navy-100 text-center">
                        <p class="text-navy-600 text-sm">
                            Already have an account? 
                            <button onclick="showAuth('login')" class="text-ocean font-semibold hover:text-ocean-dark">Sign In</button>
                        </p>
                    </div>
                </div>

                <!-- Login Form -->
                <div id="login-form" class="hidden">
                    <div class="px-6 sm:px-8 pt-8 pb-6">
                        <div class="text-center mb-6">
                            <div class="w-14 h-14 sm:w-16 sm:h-16 bg-navy-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg class="w-7 h-7 sm:w-8 sm:h-8 text-sky-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                                </svg>
                            </div>
                            <h2 class="font-serif text-2xl sm:text-3xl font-bold text-navy-900">Welcome Back</h2>
                            <p class="text-navy-600 mt-2 text-sm sm:text-base">Sign in to access your vault</p>
                        </div>
                        <form onsubmit="handleLogin(event)" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-navy-700 mb-1.5">Email or Username</label>
                                <input type="text" id="login-identifier" required
                                    class="w-full px-4 py-3 border border-navy-200 rounded-xl focus:ring-2 focus:ring-ocean focus:border-ocean bg-white text-navy-900 placeholder-navy-400 transition-all"
                                    placeholder="Enter your email or username">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-navy-700 mb-1.5">Password</label>
                                <input type="password" id="login-password" required
                                    class="w-full px-4 py-3 border border-navy-200 rounded-xl focus:ring-2 focus:ring-ocean focus:border-ocean bg-white text-navy-900 placeholder-navy-400 transition-all"
                                    placeholder="Enter your password">
                            </div>
                            <div id="login-auth-error" class="hidden p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center"></div>
                            <button type="submit" id="login-btn" class="w-full mt-2 px-6 py-3 bg-navy-900 text-white rounded-xl font-semibold hover:bg-navy-800 transition-colors">
                                Sign In
                            </button>
                        </form>
                    </div>
                    <div class="px-6 sm:px-8 py-4 bg-navy-50 border-t border-navy-100 text-center">
                        <p class="text-navy-600 text-sm">
                            Don't have an account? 
                            <button onclick="showAuth('register')" class="text-ocean font-semibold hover:text-ocean-dark">Create One</button>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- Main Application (Initially Hidden) -->
    <div id="app" class="hidden min-h-screen bg-navy-50">
        <!-- App content will be loaded here by JavaScript -->
    </div>

    <script src="assets/js/app.js"></script>
</body>
</html>
