// User Dashboard JavaScript

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

// User Menu Toggle
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('userDropdown');
    
    if (!userMenu.contains(event.target)) {
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

// Form Handlers
document.addEventListener('DOMContentLoaded', function() {
    // Transfer Form Handler
    const transferForm = document.getElementById('transferForm');
    if (transferForm) {
        transferForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(transferForm);
            const transferData = {
                recipient: formData.get('recipient'),
                amount: parseFloat(formData.get('amount')),
                note: formData.get('note') || ''
            };
            
            // Validation
            if (!transferData.recipient || !transferData.amount) {
                showAlert('Please fill in all required fields', 'error');
                return;
            }
            
            if (transferData.amount <= 0) {
                showAlert('Amount must be greater than 0', 'error');
                return;
            }
            
            if (transferData.amount > 50000) {
                showAlert('Transfer limit is ₹50,000 per transaction', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = transferForm.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                fetch('/api/transfer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('userToken')
                    },
                    body: JSON.stringify(transferData)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showAlert('Money transferred successfully!', 'success');
                        closeModal('transferModal');
                        transferForm.reset();
                        updateBalance(data.newBalance);
                    } else {
                        showAlert(data.message || 'Transfer failed. Please try again.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Transfer error:', error);
                    showAlert('Network error. Please try again.', 'error');
                })
                .finally(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
            }, 1500);
        });
    }
    
    // Recharge Form Handler
    const rechargeForm = document.getElementById('rechargeForm');
    if (rechargeForm) {
        rechargeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(rechargeForm);
            const rechargeData = {
                mobile: formData.get('mobile'),
                operator: formData.get('operator'),
                amount: parseFloat(formData.get('amount'))
            };
            
            // Validation
            if (!rechargeData.mobile || !rechargeData.operator || !rechargeData.amount) {
                showAlert('Please fill in all fields', 'error');
                return;
            }
            
            const mobileRegex = /^[6-9]\d{9}$/;
            if (!mobileRegex.test(rechargeData.mobile)) {
                showAlert('Please enter a valid mobile number', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = rechargeForm.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                fetch('/api/recharge', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('userToken')
                    },
                    body: JSON.stringify(rechargeData)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showAlert('Recharge successful!', 'success');
                        closeModal('rechargeModal');
                        rechargeForm.reset();
                        updateBalance(data.newBalance);
                    } else {
                        showAlert(data.message || 'Recharge failed. Please try again.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Recharge error:', error);
                    showAlert('Network error. Please try again.', 'error');
                })
                .finally(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
            }, 1500);
        });
    }
    
    // Bill Pay Form Handler
    const billPayForm = document.getElementById('billPayForm');
    if (billPayForm) {
        billPayForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(billPayForm);
            const billData = {
                billType: formData.get('billType'),
                consumerNumber: formData.get('consumerNumber'),
                amount: parseFloat(formData.get('amount'))
            };
            
            // Validation
            if (!billData.billType || !billData.consumerNumber || !billData.amount) {
                showAlert('Please fill in all fields', 'error');
                return;
            }
            
            if (billData.amount <= 0) {
                showAlert('Amount must be greater than 0', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = billPayForm.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                fetch('/api/bill-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('userToken')
                    },
                    body: JSON.stringify(billData)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showAlert('Bill payment successful!', 'success');
                        closeModal('billPayModal');
                        billPayForm.reset();
                        updateBalance(data.newBalance);
                    } else {
                        showAlert(data.message || 'Bill payment failed. Please try again.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Bill payment error:', error);
                    showAlert('Network error. Please try again.', 'error');
                })
                .finally(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
            }, 1500);
        });
    }
    
    // Load user data
    loadUserData();
});

// Load User Data
function loadUserData() {
    // Simulate loading user data
    const userData = {
        name: 'John Doe',
        balance: 25450.75,
        accountNumber: '1234567890'
    };
    
    // Update UI with user data
    document.getElementById('userName').textContent = userData.name;
    document.getElementById('accountBalance').textContent = userData.balance.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Update Balance
function updateBalance(newBalance) {
    document.getElementById('accountBalance').textContent = newBalance.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    // Add animation effect
    const balanceElement = document.querySelector('.balance-amount');
    balanceElement.style.transform = 'scale(1.1)';
    balanceElement.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
        balanceElement.style.transform = 'scale(1)';
    }, 300);
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

// Service Item Click Handlers
document.addEventListener('DOMContentLoaded', function() {
    const serviceItems = document.querySelectorAll('.service-item');
    serviceItems.forEach(item => {
        item.addEventListener('click', function() {
            const serviceName = this.querySelector('h4').textContent;
            showAlert(`${serviceName} service will be available soon!`, 'info');
        });
    });
});

// Transaction Animation
function animateTransactions() {
    const transactionItems = document.querySelectorAll('.transaction-item');
    transactionItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Initialize animations when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(animateTransactions, 500);
});