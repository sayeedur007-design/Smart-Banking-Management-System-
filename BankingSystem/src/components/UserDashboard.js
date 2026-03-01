import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import ChatWidget from './ChatWidget';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [insurance, setInsurance] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTransaction, setSuccessTransaction] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', mobile: '' });
  const navigate = useNavigate();
  const ws = useRef(null);
  const toast = useToast();

  const fetchData = React.useCallback(async () => {
    try {
      const balanceRes = await api.get('/users/balance');
      setBalance(balanceRes.data.balance);
      const transactionsRes = await api.get('/transactions');
      setTransactions(transactionsRes.data);

      // Fetch Services
      const cardsRes = await api.get('/services/cards');
      setCards(cardsRes.data);
      const investmentsRes = await api.get('/services/investments');
      setInvestments(investmentsRes.data);
      const insuranceRes = await api.get('/services/insurance');
      setInsurance(insuranceRes.data);
    } catch (error) {
      console.error("Error fetching data", error);
      toast.error("Failed to load dashboard data");
    }
  }, [toast]);

  const connectWebSocket = React.useCallback(() => {
    ws.current = new WebSocket('ws://localhost:8000/ws/balance');
    ws.current.onopen = () => {
      console.log('WebSocket Connected');
    };
    ws.current.onmessage = (event) => {
      console.log('Message from server ', event.data);
      // In a real app, we'd parse this and update state if it's a balance update
      // For now, we just re-fetch data on any message or just rely on API response
    };
    ws.current.onclose = () => {
      console.log('WebSocket Disconnected');
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
      connectWebSocket();
    }
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [user, fetchData, connectWebSocket]);

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.info('Logged out successfully');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('UPI ID copied to clipboard!');
  };

  const handleFormSubmit = async (e, type) => {
    e.preventDefault();

    try {
      const endpoints = {
        transfer: '/transactions/transfer',
        recharge: '/transactions/recharge',
        billPay: '/transactions/bill-payment',
        addCard: '/services/cards',
        addInvestment: '/services/investments',
        addInsurance: '/services/insurance',
        qr: '/transactions/transfer' // QR Pay uses transfer endpoint
      };

      // Map form data to API expected format
      let payload = { ...formData };
      if (type === 'transfer' || type === 'qr') {
        payload = {
          recipient_mobile: formData.recipient,
          amount: parseFloat(formData.amount),
          note: formData.note || '',
          upi_pin: formData.upi_pin
        };
      } else if (type === 'recharge') {
        payload = {
          mobile: formData.mobile,
          operator: formData.operator,
          amount: parseFloat(formData.amount.split(' ')[0].replace('₹', '')),
          upi_pin: formData.upi_pin
        }
      } else if (type === 'billPay') {
        payload = {
          billType: formData.billType,
          consumerNumber: formData.consumerNumber,
          amount: parseFloat(formData.amount),
          upi_pin: formData.upi_pin
        }
      } else if (type === 'addCard') {
        payload = {
          card_holder: formData.card_holder,
          type: formData.type,
          limit: parseFloat(formData.limit)
        }
      } else if (type === 'addInvestment') {
        payload = {
          name: formData.name,
          type: formData.type,
          amount: parseFloat(formData.amount)
        }
      } else if (type === 'addInsurance') {
        payload = {
          provider: formData.provider,
          type: formData.type,
          premium: parseFloat(formData.premium),
          coverage: parseFloat(formData.coverage),
          expiry_date: formData.expiry_date
        }
      }

      const response = await api.post(endpoints[type], payload);

      // Prepare success transaction data
      const transactionData = {
        type: type,
        amount: payload.amount || formData.amount,
        recipient: payload.recipient_mobile || formData.recipient || formData.mobile || formData.consumerNumber,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        transactionId: `TID${Date.now()}`,
        note: payload.note || formData.note || ''
      };

      setSuccessTransaction(transactionData);
      setShowSuccessModal(true);
      setActiveModal(null);
      setFormData({});

      if (['transfer', 'recharge', 'billPay', 'qr'].includes(type)) {
        setBalance(response.data.balance);
      }

      fetchData(); // Refresh all data

    } catch (error) {
      toast.error(error.response?.data?.detail || 'Transaction failed');
    }
  };


  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/me', profileForm);
      setIsEditingProfile(false);
      toast.success('Profile updated successfully!');
      setTimeout(() => window.location.reload(), 1500); // Reload to reflect changes if needed
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await api.delete('/users/me');
        logout();
        navigate('/');
        toast.info('Account deleted');
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Failed to delete account');
      }
    }
  };

  const renderModal = () => {
    if (!activeModal) return null;

    const modals = {
      transfer: {
        title: 'Send Money',
        fields: [
          { name: 'recipient', label: 'Recipient Mobile/UPI ID', type: 'text', placeholder: 'Enter mobile number or UPI ID' },
          { name: 'amount', label: 'Amount', type: 'number', placeholder: 'Enter amount' },
          { name: 'note', label: 'Note (Optional)', type: 'text', placeholder: 'Add a note' },
          { name: 'upi_pin', label: 'UPI PIN', type: 'password', placeholder: 'Enter 6-digit UPI PIN' }
        ]
      },
      recharge: {
        title: 'Mobile Recharge',
        fields: [
          { name: 'mobile', label: 'Mobile Number', type: 'tel', placeholder: 'Enter mobile number' },
          { name: 'operator', label: 'Operator', type: 'select', options: ['Select Operator', 'Airtel', 'Jio', 'Vi', 'BSNL'] },
          { name: 'amount', label: 'Amount', type: 'select', options: ['Select Plan', '₹199 - 1.5GB/day, 28 days', '₹399 - 2.5GB/day, 28 days'] },
          { name: 'upi_pin', label: 'UPI PIN', type: 'password', placeholder: 'Enter 6-digit UPI PIN' }
        ]
      },
      billPay: {
        title: 'Pay Bills',
        fields: [
          { name: 'billType', label: 'Bill Type', type: 'select', options: ['Select Bill Type', 'Electricity', 'Gas', 'Water', 'Internet'] },
          { name: 'consumerNumber', label: 'Consumer Number', type: 'text', placeholder: 'Enter consumer number' },
          { name: 'amount', label: 'Amount', type: 'number', placeholder: 'Enter amount' },
          { name: 'upi_pin', label: 'UPI PIN', type: 'password', placeholder: 'Enter 6-digit UPI PIN' }
        ]
      },
      addCard: {
        title: 'Apply for New Card',
        fields: [
          { name: 'card_holder', label: 'Card Holder Name', type: 'text', placeholder: 'Name on card' },
          { name: 'type', label: 'Card Type', type: 'select', options: ['Select Type', 'Debit', 'Credit'] },
          { name: 'limit', label: 'Limit', type: 'number', placeholder: 'Enter limit' }
        ]
      },
      addInvestment: {
        title: 'New Investment',
        fields: [
          { name: 'name', label: 'Investment Name', type: 'text', placeholder: 'e.g. Bluechip Fund' },
          { name: 'type', label: 'Type', type: 'select', options: ['Select Type', 'Mutual Fund', 'Stock', 'Fixed Deposit'] },
          { name: 'amount', label: 'Amount', type: 'number', placeholder: 'Investment amount' }
        ]
      },
      addInsurance: {
        title: 'Buy Insurance',
        fields: [
          { name: 'provider', label: 'Provider', type: 'text', placeholder: 'e.g. LIC' },
          { name: 'type', label: 'Type', type: 'select', options: ['Select Type', 'Health', 'Life', 'Vehicle'] },
          { name: 'premium', label: 'Premium', type: 'number', placeholder: 'Premium amount' },
          { name: 'coverage', label: 'Coverage', type: 'number', placeholder: 'Coverage amount' },
          { name: 'expiry_date', label: 'Expiry Date', type: 'date' }
        ]
      },
      qr: {
        title: 'Scan & Pay',
        fields: [
          { name: 'recipient', label: 'UPI ID', type: 'text', placeholder: 'Enter UPI ID' },
          { name: 'amount', label: 'Amount', type: 'number', placeholder: 'Enter amount' },
          { name: 'note', label: 'Note', type: 'text', placeholder: 'Payment for...' },
          { name: 'upi_pin', label: 'UPI PIN', type: 'password', placeholder: 'Enter 6-digit UPI PIN' }
        ]
      }
    };

    const modal = modals[activeModal];

    if (!modal) return null;

    return (
      <div className="modal" onClick={() => setActiveModal(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <span className="close" onClick={() => setActiveModal(null)}>&times;</span>
          <h2>{modal.title}</h2>

          {/* Show QR Code if QR modal and form has data */}
          {activeModal === 'qr' && formData.recipient && formData.amount && (
            <div style={{ textAlign: 'center', margin: '20px 0', padding: '20px', background: '#f7fafc', borderRadius: '10px' }}>
              <h3 style={{ marginBottom: '15px', color: '#2d3748' }}>Scan to Pay</h3>
              <div style={{ display: 'inline-block', padding: '20px', background: 'white', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <QRCodeSVG
                  value={`upi://pay?pa=${formData.recipient}&pn=${user?.name || 'User'}&am=${formData.amount}&tn=${formData.note || 'Payment'}`}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p style={{ marginTop: '15px', color: '#4a5568', fontSize: '14px' }}>
                <strong>Amount:</strong> ₹{formData.amount}<br />
                <strong>To:</strong> {formData.recipient}
              </p>
            </div>
          )}

          <form onSubmit={(e) => handleFormSubmit(e, activeModal)}>
            {modal.fields.map((field, index) => (
              <div key={index} className="form-group">
                <label>{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    required={!field.label.includes('Optional')}
                  >
                    {field.options.map((option, i) => (
                      <option key={i} value={i === 0 ? '' : option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    placeholder={field.placeholder}
                    required={!field.label.includes('Optional')}
                  />
                )}
              </div>
            ))}
            <button type="submit" className="btn-submit">
              {activeModal === 'transfer' ? 'Send Money' : activeModal === 'recharge' ? 'Recharge Now' : activeModal === 'qr' ? 'Confirm Payment' : 'Pay Bill'}
            </button>
          </form>
        </div>
      </div>
    );
  };
  return (
    <div className={`user-dashboard ${darkMode ? 'dark-theme' : ''}`}>
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo">
            <img src="/sn4-logo.jpg" alt="SN4 Logo" className="logo-image" />
            <span style={{ fontFamily: "'Algerain', serif", fontSize: '28px' }}>SN4</span>
          </div>
          <div className="user-info">
            <span>Welcome, <strong>{user?.name}</strong></span>
            <div className="user-menu">
              <button className="user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                <i className="fas fa-user-circle"></i>
                <i className="fas fa-chevron-down"></i>
              </button>
              {showUserMenu && (
                <div className="user-dropdown active">
                  <a href="#!" onClick={() => { setShowProfile(true); setShowUserMenu(false); }}><i className="fas fa-user"></i> Profile</a>
                  <a href="#!"><i className="fas fa-cog"></i> Settings</a>
                  <a href="#!" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Logout</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="dashboard-main">
        {/* Account Overview */}
        <section className="account-overview">
          <div className="balance-card">
            <h2>Account Balance</h2>
            <div className="balance-amount">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <p>Available Balance</p>
          </div>
          <div className="quick-actions">
            {[
              { key: 'transfer', icon: 'fa-paper-plane', label: 'Send Money' },
              { key: 'recharge', icon: 'fa-mobile', label: 'Recharge' },
              { key: 'billPay', icon: 'fa-file-invoice', label: 'Pay Bills' },
              { key: 'qr', icon: 'fa-qrcode', label: 'QR Pay' }
            ].map((action) => (
              <button
                key={action.key}
                className="action-btn"
                onClick={() => setActiveModal(action.key)}
              >
                <i className={`fas ${action.icon}`}></i>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </section>



        {/* Services Grid */}
        <section className="services-section">
          <h3>Banking Services</h3>
          <div className="services-grid">
            <div className="service-item" onClick={() => setActiveModal('addCard')}>
              <i className="fas fa-credit-card"></i>
              <h4>Cards</h4>
              <p>Manage your debit/credit cards</p>
              <small>{cards.length} card(s)</small>
            </div>
            <div className="service-item" onClick={() => window.open('/savings', '_blank')}>
              <i className="fas fa-piggy-bank"></i>
              <h4>Savings</h4>
              <p>View savings account details</p>
            </div>
            <div className="service-item" onClick={() => window.open('/investments', '_blank')}>
              <i className="fas fa-chart-line"></i>
              <h4>Investments</h4>
              <p>Track your investments</p>
              <small>{investments.length} investment(s)</small>
            </div>
            <div className="service-item" onClick={() => window.open('/insurance', '_blank')}>
              <i className="fas fa-shield-alt"></i>
              <h4>Insurance</h4>
              <p>Manage insurance policies</p>
              <small>{insurance.length} policy(ies)</small>
            </div>
            <div className="service-item" onClick={() => window.open('/loans', '_blank')}>
              <i className="fas fa-hand-holding-usd"></i>
              <h4>Loans</h4>
              <p>Check eligibility & apply</p>
            </div>
          </div>
        </section>

        {/* Recent Transactions */}
        <section className="transactions-section">
          <h3>Recent Transactions</h3>
          <div className="transactions-list">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className={`transaction-icon ${transaction.type}`}>
                  <i className={`fas ${transaction.type === 'credit' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                </div>
                <div className="transaction-details">
                  <h4>{transaction.description}</h4>
                  <p>{transaction.type}</p>
                  <span className="date">{new Date(transaction.created_at).toLocaleString()}</span>
                </div>
                <div className={`transaction-amount ${transaction.type}`}>
                  {transaction.type === 'credit' ? '+' : '-'}₹{Math.abs(transaction.amount).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          <button className="view-all-btn">View All Transactions</button>
        </section>
      </main>

      {/* Profile Modal */}
      {showProfile && (
        <div className="modal" onClick={() => setShowProfile(false)}>
          <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setShowProfile(false)}>&times;</span>
            <div className="profile-header">
              <i className="fas fa-user-circle"></i>
              <h2>My Profile</h2>
            </div>

            {!isEditingProfile ? (
              <div className="profile-details">
                {/* QR Code Section */}
                <div style={{ textAlign: 'center', marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                  <QRCodeSVG
                    value={`upi://pay?pa=${user?.upi_id}&pn=${user?.name}&cu=INR`}
                    size={150}
                    level="H"
                    includeMargin={true}
                  />
                  <p style={{ marginTop: '10px', fontSize: '13px', color: '#718096' }}>Scan to pay me</p>
                </div>

                <div className="profile-item">
                  <label>Name</label>
                  <p>{user?.name}</p>
                </div>
                <div className="profile-item">
                  <label>Email</label>
                  <p>{user?.email}</p>
                </div>
                <div className="profile-item">
                  <label>Mobile</label>
                  <p>{user?.mobile}</p>
                </div>
                <div className="profile-item upi-item">
                  <label>UPI ID</label>
                  <div className="upi-id-container">
                    <p className="upi-id">{user?.upi_id}</p>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(user?.upi_id)}
                      title="Copy UPI ID"
                    >
                      <i className="fas fa-copy"></i> Copy
                    </button>
                  </div>
                </div>
                <div className="profile-item">
                  <label>Account Status</label>
                  <p className="status-badge active">Active</p>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button
                    onClick={() => {
                      setProfileForm({ name: user?.name, mobile: user?.mobile });
                      setIsEditingProfile(true);
                    }}
                    style={{ flex: 1, padding: '10px', background: '#4299e1', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    style={{ flex: 1, padding: '10px', background: '#ef5350', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} style={{ padding: '20px' }}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mobile</label>
                  <input
                    type="text"
                    value={profileForm.mobile}
                    onChange={e => setProfileForm({ ...profileForm, mobile: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button type="submit" className="btn-submit" style={{ flex: 1 }}>Save Changes</button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    style={{ flex: 1, padding: '10px', background: '#718096', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}


      {/* Success Modal */}
      {showSuccessModal && successTransaction && (
        <div className="modal" onClick={() => setShowSuccessModal(false)}>
          <div className="modal-content success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-header">
              <div className="success-icon">
                <div className="checkmark-circle">
                  <i className="fas fa-check"></i>
                </div>
              </div>
              <h2>Payment Successful!</h2>
              <p className="success-subtitle">Your transaction has been completed successfully.</p>
            </div>

            <div className="transaction-details">
              <div className="detail-row">
                <span className="detail-label">Amount:</span>
                <span className="detail-value">₹{parseFloat(successTransaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span className="detail-value">{successTransaction.date}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Transaction ID:</span>
                <span className="detail-value">{successTransaction.transactionId}</span>
              </div>
              {successTransaction.recipient && (
                <div className="detail-row">
                  <span className="detail-label">To:</span>
                  <span className="detail-value">{successTransaction.recipient}</span>
                </div>
              )}
            </div>

            <div className="success-actions">
              <button className="btn-done" onClick={() => setShowSuccessModal(false)}>
                DONE
              </button>
            </div>
          </div>
        </div>
      )}

      {renderModal()}

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
};

export default UserDashboard;