//-----------------------------------------------
// AOS Initilize Start
//-----------------------------------------------

$(document).ready(function () {
    AOS.init({
        duration: 700,
        once: false, // Only animate once as they enter the screen
        offset: 80,
        easing: 'ease-out-quad',
        delay: 50,
        startEvent: 'DOMContentLoaded',
        initClassName: 'aos-init',
        animatedClassName: 'aos-animate',
        useClassNames: false,
        disableMutationObserver: false,
        debounceDelay: 50,
        throttleDelay: 99,
    });
});

//-----------------------------------------------
// Simple AOS Refresh Enhancement Start
//-----------------------------------------------

// Refresh AOS when content changes or on window resize
$(window).on('resize', function () {
    AOS.refresh();
});

// Refresh AOS after dynamic content loads
$(document).on('contentLoaded', function () {
    AOS.refresh();
});

// Refresh AOS when elements become visible again
$(document).on('visibilitychange', function () {
    if (!document.hidden) {
        setTimeout(function () {
            AOS.refresh();
        }, 100);
    }
});

// Refresh AOS on scroll with throttling
let scrollTimeout;
$(window).on('scroll', function () {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function () {
        AOS.refresh();
    }, 150);
});

// Refresh AOS when returning to page
$(window).on('focus', function () {
    setTimeout(function () {
        AOS.refresh();
    }, 100);
});

// Refresh AOS on orientation change
$(window).on('orientationchange', function () {
    setTimeout(function () {
        AOS.refresh();
    }, 500);
});

//-----------------------------------------------
// AOS Optimizer Start
//-----------------------------------------------

class AOSOptimizer {
    constructor() {
        this.isInitialized = false;
        this.refreshTimeout = null;
        this.visibilityTimeout = null;
        this.init();
    }

    init() {
        // Wait for AOS to be available
        if (typeof AOS !== 'undefined') {
            this.setupEventListeners();
            this.isInitialized = true;
        } else {
            // Retry after a short delay
            setTimeout(() => this.init(), 100);
        }
    }

    setupEventListeners() {
        // Refresh AOS when page becomes visible
        $(document).on('visibilitychange', () => {
            if (!document.hidden) {
                this.delayedRefresh(200);
            }
        });

        // Refresh AOS when content changes
        $(document).on('contentLoaded', () => {
            this.delayedRefresh(100);
        });

        // Refresh AOS when DOM changes
        this.observeDOMChanges();

        // Refresh AOS on orientation change
        $(window).on('orientationchange', () => {
            this.delayedRefresh(500);
        });

        // Refresh AOS when returning to page
        $(window).on('focus', () => {
            this.delayedRefresh(100);
        });
    }

    delayedRefresh(delay = 100) {
        clearTimeout(this.visibilityTimeout);
        this.visibilityTimeout = setTimeout(() => {
            this.refreshAOS();
        }, delay);
    }

    refreshAOS() {
        if (typeof AOS !== 'undefined' && this.isInitialized) {
            try {
                // Remove existing animation classes to allow re-animation
                $('[data-aos]').removeClass('aos-animate');

                // Refresh AOS
                AOS.refresh();

                // Force re-initialization for better performance
                setTimeout(() => {
                    AOS.refresh();
                }, 50);
            } catch (error) {
                console.warn('AOS refresh error:', error);
            }
        }
    }

    observeDOMChanges() {
        // Use MutationObserver to detect DOM changes
        if (window.MutationObserver) {
            const observer = new MutationObserver((mutations) => {
                let shouldRefresh = false;

                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        // Check if any added nodes have AOS attributes
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1) { // Element node
                                if (node.hasAttribute && node.hasAttribute('data-aos')) {
                                    shouldRefresh = true;
                                }
                                if (node.querySelectorAll && node.querySelectorAll('[data-aos]').length > 0) {
                                    shouldRefresh = true;
                                }
                            }
                        });
                    }
                });

                if (shouldRefresh) {
                    this.delayedRefresh(200);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    // Public method to manually refresh
    refresh() {
        this.refreshAOS();
    }

    // Public method to reset all animations
    reset() {
        $('[data-aos]').removeClass('aos-animate');
    }

    // Public method to reinitialize
    reinitialize() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 1000,
                once: false,
                offset: 100,
                easing: 'ease-in-out',
                delay: 100,
                startEvent: 'DOMContentLoaded',
                initClassName: 'aos-init',
                animatedClassName: 'aos-animate',
                useClassNames: false,
                disableMutationObserver: false,
                debounceDelay: 50,
                throttleDelay: 99,
            });
        }
    }
}

// Initialize AOS Optimizer when document is ready
$(document).ready(function () {
    window.aosOptimizer = new AOSOptimizer();
});

// Global function for manual refresh
window.refreshAOSAnimations = function () {
    if (window.aosOptimizer) {
        window.aosOptimizer.refresh();
    }
};

// Global function for resetting animations
window.resetAOSAnimations = function () {
    if (window.aosOptimizer) {
        window.aosOptimizer.reset();
    }
};

// Global function for reinitialization
window.reinitializeAOS = function () {
    if (window.aosOptimizer) {
        window.aosOptimizer.reinitialize();
    }
};

//-----------------------------------------------
// AOS Optimizer End
//-----------------------------------------------