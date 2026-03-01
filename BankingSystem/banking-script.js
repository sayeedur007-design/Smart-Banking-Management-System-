// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.body.style.overflow = 'hidden';
    // Close login dropdown if open
    const dropdown = document.querySelector('.login-dropdown');
    if (dropdown) dropdown.classList.remove('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Login Dropdown Functions
function toggleLoginDropdown() {
    const dropdown = document.querySelector('.login-dropdown');
    dropdown.classList.toggle('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.login-dropdown');
    if (!dropdown.contains(event.target)) {
        dropdown.classList.remove('active');
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// Password Toggle Function
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = passwordInput.nextElementSibling;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Mobile Menu Toggle
function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    const hamburger = document.querySelector('.hamburger');
    
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

// Form Validation and Submission
document.addEventListener('DOMContentLoaded', function() {
    // User Login Form Handler
    const userLoginForm = document.getElementById('userLoginForm');
    if (userLoginForm) {
        userLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(userLoginForm);
            const loginData = {
                email: formData.get('email'),
                password: formData.get('password'),
                userType: 'user'
            };
            
            // Basic validation
            if (!loginData.email || !loginData.password) {
                showAlert('Please fill in all fields', 'error');
                return;
            }
            
            // Email/Mobile validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const mobileRegex = /^[6-9]\d{9}$/;
            
            if (!emailRegex.test(loginData.email) && !mobileRegex.test(loginData.email)) {
                showAlert('Please enter a valid email or mobile number', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = userLoginForm.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                fetch('/api/user/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(loginData)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showAlert('Login successful! Redirecting to dashboard...', 'success');
                        setTimeout(() => {
                            window.location.href = 'user-dashboard.html';
                        }, 1500);
                    } else {
                        showAlert(data.message || 'Login failed. Please try again.', 'error');
                    }
                })
                .catch(error => {
                    console.error('User login error:', error);
                    showAlert('Network error. Please try again.', 'error');
                })
                .finally(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
            }, 1000);
        });
    }
    
    // Admin Login Form Handler
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(adminLoginForm);
            const adminData = {
                email: formData.get('email'),
                password: formData.get('password'),
                adminCode: formData.get('adminCode'),
                userType: 'admin'
            };
            
            // Basic validation
            if (!adminData.email || !adminData.password || !adminData.adminCode) {
                showAlert('Please fill in all fields', 'error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(adminData.email)) {
                showAlert('Please enter a valid email address', 'error');
                return;
            }
            
            // Admin code validation
            if (adminData.adminCode.length < 6) {
                showAlert('Admin code must be at least 6 characters', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = adminLoginForm.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Verifying...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                fetch('/api/admin/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(adminData)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showAlert('Admin login successful! Redirecting to admin panel...', 'success');
                        setTimeout(() => {
                            window.location.href = 'admin-dashboard.html';
                        }, 1500);
                    } else {
                        showAlert(data.message || 'Admin login failed. Please check credentials.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Admin login error:', error);
                    showAlert('Network error. Please try again.', 'error');
                })
                .finally(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
            }, 1000);
        });
    }
    
    // Register Form Handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(registerForm);
            const registerData = {
                name: formData.get('name'),
                email: formData.get('email'),
                mobile: formData.get('mobile'),
                password: formData.get('password')
            };
            
            // Validation
            if (!registerData.name || !registerData.email || !registerData.mobile || !registerData.password) {
                showAlert('Please fill in all fields', 'error');
                return;
            }
            
            // Name validation
            if (registerData.name.length < 2) {
                showAlert('Name must be at least 2 characters long', 'error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(registerData.email)) {
                showAlert('Please enter a valid email address', 'error');
                return;
            }
            
            // Mobile validation
            const mobileRegex = /^[6-9]\d{9}$/;
            if (!mobileRegex.test(registerData.mobile)) {
                showAlert('Please enter a valid 10-digit mobile number', 'error');
                return;
            }
            
            // Password validation
            if (registerData.password.length < 6) {
                showAlert('Password must be at least 6 characters long', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = registerForm.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Creating Account...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                // In real implementation, make actual API call to /api/register
                fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(registerData)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showAlert('Account created successfully! Please login.', 'success');
                        setTimeout(() => {
                            closeModal('registerModal');
                            openModal('userLoginModal');
                        }, 1500);
                    } else {
                        showAlert(data.message || 'Registration failed. Please try again.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Registration error:', error);
                    showAlert('Network error. Please try again.', 'error');
                })
                .finally(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
            }, 1000);
        });
    }
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .feature-item, .offer-card, .security-item');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Alert Function
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `custom-alert alert-${type}`;
    alert.innerHTML = `
        <div class="alert-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
            <button class="alert-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles
    alert.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        z-index: 3000;
        background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    // Add animation keyframes
    if (!document.querySelector('#alert-styles')) {
        const style = document.createElement('style');
        style.id = 'alert-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .alert-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .alert-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 0;
                margin-left: auto;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#fff';
        navbar.style.backdropFilter = 'none';
    }
});

// Add mobile menu styles
const mobileMenuStyles = `
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            top: 70px;
            left: -100%;
            width: 100%;
            height: calc(100vh - 70px);
            background: white;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            padding-top: 50px;
            transition: left 0.3s ease;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .nav-menu.active {
            left: 0;
        }
        
        .nav-menu .nav-link {
            font-size: 1.2rem;
            margin: 20px 0;
        }
        
        .hamburger.active span:nth-child(1) {
            transform: rotate(-45deg) translate(-5px, 6px);
        }
        
        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active span:nth-child(3) {
            transform: rotate(45deg) translate(-5px, -6px);
        }
    }
`;

// Add mobile menu styles to document
if (!document.querySelector('#mobile-menu-styles')) {
    const style = document.createElement('style');
    style.id = 'mobile-menu-styles';
    style.textContent = mobileMenuStyles;
    document.head.appendChild(style);
}