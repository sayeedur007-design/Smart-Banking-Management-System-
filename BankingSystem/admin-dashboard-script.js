// Admin Dashboard JavaScript

// Section Navigation
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and activate the clicked nav item
    const activeNavItem = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard Overview',
        'users': 'User Management',
        'transactions': 'Transaction Monitoring',
        'reports': 'Reports & Analytics',
        'settings': 'System Settings'
    };
    
    document.getElementById('pageTitle').textContent = titles[sectionId] || 'Dashboard';
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

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

// Form Handlers
document.addEventListener('DOMContentLoaded', function() {
    // Add User Form Handler
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(addUserForm);
            const userData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                balance: parseFloat(formData.get('balance')) || 0
            };
            
            // Validation
            if (!userData.name || !userData.email || !userData.phone) {
                showAlert('Please fill in all required fields', 'error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email)) {
                showAlert('Please enter a valid email address', 'error');
                return;
            }
            
            // Phone validation
            const phoneRegex = /^[6-9]\d{9}$/;
            if (!phoneRegex.test(userData.phone)) {
                showAlert('Please enter a valid phone number', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = addUserForm.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Adding User...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                fetch('/api/admin/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
                    },
                    body: JSON.stringify(userData)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showAlert('User added successfully!', 'success');
                        closeModal('addUserModal');
                        addUserForm.reset();
                        refreshUserTable();
                        updateStats();
                    } else {
                        showAlert(data.message || 'Failed to add user. Please try again.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Add user error:', error);
                    showAlert('Network error. Please try again.', 'error');
                })
                .finally(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
            }, 1500);
        });
    }
    
    // User Action Handlers
    setupUserActions();
    
    // Transaction Filters
    setupTransactionFilters();
    
    // Settings Form Handler
    setupSettingsForm();
    
    // Load initial data
    loadDashboardData();
});

// User Actions Setup
function setupUserActions() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-action')) {
            const action = e.target.textContent.toLowerCase();
            const row = e.target.closest('tr');
            const userId = row.querySelector('td').textContent;
            const userName = row.querySelectorAll('td')[1].textContent;
            
            switch(action) {
                case 'edit':
                    editUser(userId, userName);
                    break;
                case 'block':
                    blockUser(userId, userName);
                    break;
                case 'unblock':
                    unblockUser(userId, userName);
                    break;
                case 'view':
                    viewTransaction(userId);
                    break;
            }
        }
    });
}

// User Management Functions
function editUser(userId, userName) {
    showAlert(`Edit functionality for ${userName} will be implemented`, 'info');
}

function blockUser(userId, userName) {
    if (confirm(`Are you sure you want to block ${userName}?`)) {
        // Simulate API call
        fetch(`/api/admin/users/${userId}/block`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert(`${userName} has been blocked`, 'success');
                refreshUserTable();
            } else {
                showAlert('Failed to block user', 'error');
            }
        })
        .catch(error => {
            console.error('Block user error:', error);
            showAlert('Network error', 'error');
        });
    }
}

function unblockUser(userId, userName) {
    if (confirm(`Are you sure you want to unblock ${userName}?`)) {
        // Simulate API call
        fetch(`/api/admin/users/${userId}/unblock`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert(`${userName} has been unblocked`, 'success');
                refreshUserTable();
            } else {
                showAlert('Failed to unblock user', 'error');
            }
        })
        .catch(error => {
            console.error('Unblock user error:', error);
            showAlert('Network error', 'error');
        });
    }
}

function viewTransaction(transactionId) {
    showAlert(`Transaction details for ${transactionId} will be displayed`, 'info');
}

// Transaction Filters Setup
function setupTransactionFilters() {
    const filterSelect = document.querySelector('.filters select');
    const dateInput = document.querySelector('.filters input[type="date"]');
    
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            filterTransactions(this.value, dateInput.value);
        });
    }
    
    if (dateInput) {
        dateInput.addEventListener('change', function() {
            filterTransactions(filterSelect.value, this.value);
        });
    }
}

function filterTransactions(status, date) {
    // Simulate filtering
    showAlert(`Filtering transactions by ${status} for ${date}`, 'info');
}

// Settings Form Setup
function setupSettingsForm() {
    const settingsSection = document.getElementById('settings');
    const saveButton = settingsSection.querySelector('.btn-primary');
    
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            const settings = {
                twoFactorAuth: settingsSection.querySelector('input[type="checkbox"]').checked,
                sessionTimeout: settingsSection.querySelector('input[type="number"]').value,
                dailyLimit: settingsSection.querySelectorAll('input[type="number"]')[1].value,
                transactionLimit: settingsSection.querySelectorAll('input[type="number"]')[2].value
            };
            
            // Show loading state
            const originalText = saveButton.textContent;
            saveButton.textContent = 'Saving...';
            saveButton.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                fetch('/api/admin/settings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
                    },
                    body: JSON.stringify(settings)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showAlert('Settings saved successfully!', 'success');
                    } else {
                        showAlert('Failed to save settings', 'error');
                    }
                })
                .catch(error => {
                    console.error('Save settings error:', error);
                    showAlert('Network error', 'error');
                })
                .finally(() => {
                    saveButton.textContent = originalText;
                    saveButton.disabled = false;
                });
            }, 1000);
        });
    }
}

// Data Loading Functions
function loadDashboardData() {
    // Simulate loading dashboard statistics
    animateStats();
    loadRecentActivity();
}

function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach((stat, index) => {
        const finalValue = stat.textContent;
        stat.textContent = '0';
        
        setTimeout(() => {
            animateNumber(stat, finalValue);
        }, index * 200);
    });
}

function animateNumber(element, finalValue) {
    const isRupee = finalValue.includes('₹');
    const isPercentage = finalValue.includes('%');
    const numericValue = parseFloat(finalValue.replace(/[₹,%MK]/g, ''));
    
    let current = 0;
    const increment = numericValue / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
            current = numericValue;
            clearInterval(timer);
        }
        
        let displayValue = Math.floor(current).toLocaleString();
        if (isRupee) {
            if (finalValue.includes('M')) {
                displayValue = `₹${(current / 1000000).toFixed(1)}M`;
            } else if (finalValue.includes('K')) {
                displayValue = `₹${(current / 1000).toFixed(1)}K`;
            } else {
                displayValue = `₹${displayValue}`;
            }
        } else if (isPercentage) {
            displayValue = `${current.toFixed(1)}%`;
        }
        
        element.textContent = displayValue;
    }, 20);
}

function loadRecentActivity() {
    // Simulate loading recent activity with animation
    const activityItems = document.querySelectorAll('.activity-item');
    activityItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, index * 150);
    });
}

function refreshUserTable() {
    // Simulate refreshing user table
    showAlert('User table refreshed', 'info');
}

function updateStats() {
    // Simulate updating statistics
    const totalUsers = document.querySelector('.stat-number');
    const currentValue = parseInt(totalUsers.textContent.replace(/,/g, ''));
    totalUsers.textContent = (currentValue + 1).toLocaleString();
}

// Report Generation
function generateReport(reportType) {
    showAlert(`Generating ${reportType} report...`, 'info');
    
    // Simulate report generation
    setTimeout(() => {
        showAlert(`${reportType} report generated successfully!`, 'success');
    }, 2000);
}

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
        top: 20px;
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
    
    // Add animation keyframes if not exists
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

// Report button handlers
document.addEventListener('DOMContentLoaded', function() {
    const reportButtons = document.querySelectorAll('.report-card .btn-secondary');
    reportButtons.forEach(button => {
        button.addEventListener('click', function() {
            const reportType = this.parentElement.querySelector('h3').textContent;
            generateReport(reportType);
        });
    });
});