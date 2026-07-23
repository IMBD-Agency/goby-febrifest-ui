
// preloader - barloader js start 
function showPreloader(type = 'full') {
    if (type === 'full') {
        $('.preloader').removeClass('hidden');
    } else if (type === 'bar') {
        $('.barloader').stop(true, true).css({
            width: '0%',
            display: 'block'
        });

        // Use a timeout to trigger transition smoothly
        setTimeout(() => {
            $('.barloader').css('width', '90%');
        }, 50);
    }
}

function hidePreloader(type = 'full') {
    if (type === 'full') {
        $('.preloader').addClass('hidden');
    } else if (type === 'bar') {
        $('.barloader').css('width', '100%');
        
        setTimeout(() => {
            $('.barloader').fadeOut(200, function () {
                $(this).css('width', '0%');
            });
        }, 300);
    }
}

// Automatically hide full loader on initial page load
$(window).on('load', function () {
    hidePreloader('full');
});
// preloader - barloader js end

// ==============================================
// AUTHENTICATION PAGES JAVASCRIPT (LOGIN & REGISTER)
// ==============================================

/**
 * Toggle password visibility
 * @param {string} fieldId - The ID of the password field
 */
function togglePassword(fieldId) {
    const passwordInput = document.getElementById(fieldId);
    const toggleIcon = document.getElementById(fieldId === 'password' ? 'passwordToggleIcon' : 'passwordConfirmToggleIcon');
    
    if (!passwordInput || !toggleIcon) return;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
        toggleIcon.setAttribute('title', 'Hide password');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
        toggleIcon.setAttribute('title', 'Show password');
    }
}

/**
 * Handle social authentication (login/register)
 * @param {string} provider - The social provider (google, facebook)
 */
function socialAuth(provider) {
    const btn = event.target.closest('.social-btn');
    if (!btn) return;
    
    const originalText = btn.innerHTML;
    
    // Show loading state
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    btn.style.pointerEvents = 'none';
    
    // Simulate social authentication (replace with actual implementation)
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.pointerEvents = 'auto';
        
        // Show success message
        showAuthMessage('Social authentication feature coming soon!', 'success');
    }, 2000);
}

/**
 * Show authentication messages (error/success)
 * @param {string} message - The message to display
 * @param {string} type - The message type (error/success)
 */
function showAuthMessage(message, type = 'error') {
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'alert alert-success' : 'alert alert-danger';
    messageDiv.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i> ${message}`;
    
    const container = document.querySelector('.login-container, .register-container');
    const header = container.querySelector('.login-header, .register-header');
    
    if (container && header) {
        container.insertBefore(messageDiv, header.nextSibling);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Initialize auth pages when DOM is loaded
$(document).ready(function() {
    // Initialize floating labels for auth pages
    if ($('.login-page, .register-page').length) {
        initializeAuthFloatingLabels();
    }
});

/**
 * Initialize floating labels for form inputs
 */
function initializeAuthFloatingLabels() {
    $('.form-control').each(function() {
        const input = $(this);
        
        // Check if input has value on load
        if (input.val()) {
            input.addClass('has-value');
        }
        
        input.on('focus', function() {
            $(this).parent().addClass('focused');
        });
        
        input.on('blur', function() {
            $(this).parent().removeClass('focused');
            if ($(this).val()) {
                $(this).addClass('has-value');
            } else {
                $(this).removeClass('has-value');
            }
        });
        
        input.on('input', function() {
            if ($(this).val()) {
                $(this).addClass('has-value');
            } else {
                $(this).removeClass('has-value');
            }
        });
        
        // Handle initial state for pre-filled inputs
        if (input.val().trim() !== '') {
            input.addClass('has-value');
        }
    });
}

