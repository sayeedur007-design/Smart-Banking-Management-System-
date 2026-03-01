import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

import { useToast } from '../context/ToastContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [users, setUsers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [reportData, setReportData] = useState(null);
  const [activeReport, setActiveReport] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All'); // In a real app, we'd have an admin endpoint for all transactions
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchTransactions();
    fetchConversations();
    fetchLoans(); // Fetch loans on mount
  }, []);

  useEffect(() => {
    // Auto-refresh conversations every 10 seconds when on messages section
    let interval;
    if (activeSection === 'messages') {
      interval = setInterval(() => {
        fetchConversations();
        if (selectedConversation) {
          loadConversationMessages(selectedConversation);
        }
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [activeSection, selectedConversation]);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/admin/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.stats);
      setActivities(response.data.activities);
    } catch (error) {
      console.error("Error fetching admin stats", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/');
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const fetchLoans = async () => {
    try {
      const response = await api.get('/admin/loans');
      setLoans(response.data);
    } catch (error) {
      console.error("Error fetching loans", error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/chat/admin/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error("Error fetching conversations", error);
    }
  };

  const loadConversationMessages = async (conversationId) => {
    try {
      const response = await api.get(`/chat/admin/conversations/${conversationId}/messages`);
      setConversationMessages(response.data);
      setSelectedConversation(conversationId);

      // Mark as read
      await api.patch(`/chat/admin/conversations/${conversationId}/mark-read`);
      fetchConversations(); // Refresh to update unread counts
    } catch (error) {
      console.error("Error loading conversation messages", error);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConversation) return;

    try {
      await api.post(`/chat/admin/message?conversation_id=${selectedConversation}`, {
        message_text: replyText
      });
      setReplyText('');
      loadConversationMessages(selectedConversation); // Reload messages
      fetchConversations(); // Refresh conversations list
      toast.success('Reply sent successfully');
    } catch (error) {
      console.error('Error sending reply', error);
      toast.error('Failed to send reply');
    }
  };



  const [stats, setStats] = useState([
    { icon: 'fa-users', title: 'Total Users', value: '...', change: 'Loading...', positive: true },
    { icon: 'fa-exchange-alt', title: 'Daily Transactions', value: '...', change: 'Loading...', positive: true },
    { icon: 'fa-rupee-sign', title: 'Total Volume', value: '...', change: 'Loading...', positive: true },
    { icon: 'fa-exclamation-triangle', title: 'Failed Transactions', value: '...', change: 'Loading...', positive: false }
  ]);

  const [activities, setActivities] = useState([]);

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.info('Logged out')
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    // Admin add user logic would go here, possibly hitting a different endpoint
    // For now, we can reuse register or create a specific admin route
    toast.info("Add user functionality to be implemented via Admin API");
    setShowAddUserModal(false);
  };

  const handleBlockUser = async (userId) => {
    try {
      await api.post(`/users/${userId}/block`);
      fetchUsers();
      toast.warning('User blocked');
    } catch (error) {
      toast.error("Failed to block user");
    }
  }

  const handleUnblockUser = async (userId) => {
    try {
      await api.post(`/users/${userId}/unblock`);
      fetchUsers();
      toast.success('User unblocked');
    } catch (error) {
      toast.error("Failed to unblock user");
    }
  }

  const handleApproveClick = (loan) => {
    setSelectedLoan(loan);
    setShowApproveModal(true);
  };

  const confirmApproveLoan = async () => {
    if (!selectedLoan) return;
    try {
      await api.put(`/admin/loans/${selectedLoan.id}/approve`);
      // toast.success("Loan approved successfully"); // Replaced by modal flow naturally closing
      setShowApproveModal(false);
      setSelectedLoan(null);
      fetchLoans();
      toast.success('Loan approved');
    } catch (error) {
      toast.error("Failed to approve loan");
    }
  };

  const handleRejectClick = (loan) => {
    setSelectedLoan(loan);
    setShowRejectModal(true);
    setRejectReason('');
  };

  const confirmRejectLoan = async () => {
    if (!selectedLoan) return;
    if (!rejectReason.trim()) {
      toast.warning("Please provide a reason for rejection");
      return;
    }

    try {
      await api.put(`/admin/loans/${selectedLoan.id}/reject`, { reason: rejectReason });
      // toast.info("Loan rejected");
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedLoan(null);
      fetchLoans();
      toast.info('Loan rejected');
    } catch (error) {
      toast.error("Failed to reject loan");
    }
  };

  const handleApproveLoan = async (loanId) => {
    try {
      await api.put(`/admin/loans/${loanId}/approve`);
      toast.success("Loan approved successfully");
      fetchLoans();
    } catch (error) {
      toast.error("Failed to approve loan");
    }
  };



  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div>
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-icon">
                    <i className={`fas ${stat.icon}`}></i>
                  </div>
                  <div className="stat-info">
                    <h3>{stat.title}</h3>
                    <div className="stat-number">{stat.value}</div>
                    <span className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="charts-section">
              <div className="chart-card">
                <h3>Transaction Trends</h3>
                <div className="chart-placeholder">
                  <i className="fas fa-chart-line"></i>
                  <p>Transaction volume over time</p>
                </div>
              </div>
              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {activities.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <i className={`fas ${activity.icon}`}></i>
                      <div>
                        <p>{activity.text}</p>
                        <span>{new Date(activity.time).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div>
            <div className="section-header">
              <h2>User Management</h2>
              <button className="btn-primary" onClick={() => setShowAddUserModal(true)}>
                Add New User
              </button>
            </div>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={index}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.mobile}</td>
                      <td>
                        <span className={`status ${user.is_active ? 'active' : 'blocked'}`}>
                          {user.is_active ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td>
                        <button className="btn-action edit">Edit</button>
                        <button
                          className={`btn-action ${user.is_active ? 'block' : 'unblock'}`}
                          onClick={() => user.is_active ? handleBlockUser(user.id) : handleUnblockUser(user.id)}
                        >
                          {user.is_active ? 'Block' : 'Unblock'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'loans':
        return (
          <div>
            <div className="section-header">
              <h2>Loan Management</h2>
            </div>
            <div className="users-table"> {/* Reusing table styles */}
              <table>
                <thead>
                  <tr>
                    <th>Loan ID</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan, index) => (
                    <tr key={index}>
                      <td>{loan.id}</td>
                      <td>
                        <div>{loan.user_name}</div>
                        <small style={{ color: '#718096' }}>{loan.user_email}</small>
                      </td>
                      <td>{loan.type}</td>
                      <td>₹{loan.amount.toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`status ${loan.status === 'approved' ? 'active' : loan.status === 'rejected' ? 'blocked' : 'pending'}`}
                          style={{
                            backgroundColor: loan.status === 'pending' ? 'rgba(236, 201, 75, 0.2)' : undefined,
                            color: loan.status === 'pending' ? '#d69e2e' : undefined
                          }}>
                          {loan.status.toUpperCase()}
                        </span>
                      </td>
                      <td>{loan.created_at}</td>
                      <td>
                        {loan.status === 'pending' && (
                          <>
                            <button
                              className="btn-action active"
                              style={{ backgroundColor: '#38a169', color: 'white', marginRight: '8px' }}
                              onClick={() => handleApproveClick(loan)}
                            >
                              Approve
                            </button>
                            <button
                              className="btn-action blocked"
                              style={{ backgroundColor: '#e53e3e', color: 'white' }}
                              onClick={() => handleRejectClick(loan)}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {loan.status !== 'pending' && (
                          <span style={{ color: '#718096', fontSize: '12px' }}>{loan.status === 'approved' ? 'Approved' : 'Rejected'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'transactions':
        return (
          <div>
            <div className="section-header">
              <h2>Transaction Monitoring</h2>
              <div className="filters">
                <select onChange={(e) => setFilterStatus(e.target.value)} value={filterStatus}>
                  <option value="All">All Transactions</option>
                  <option value="success">Successful</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
                <input type="date" defaultValue="2024-01-15" />
              </div>
            </div>
            <div className="transactions-table">
              <table>
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .filter(t => filterStatus === 'All' || t.status === filterStatus)
                    .map((transaction, index) => (
                      <tr key={index}>
                        <td>{transaction.id}</td>
                        <td>
                          <div>{transaction.user}</div>
                          <small style={{ color: '#718096' }}>{transaction.user_email}</small>
                        </td>
                        <td>{transaction.type}</td>
                        <td>{transaction.amount}</td>
                        <td>
                          <span className={`status ${transaction.status}`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </td>
                        <td>{transaction.date}</td>
                        <td>
                          <button className="btn-action view">View</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        );



      case 'reports':
        const generateReport = async (type) => {
          try {
            let endpoint = '';
            if (type === 'Daily Report') endpoint = '/admin/reports/daily';
            if (type === 'Monthly Summary') endpoint = '/admin/reports/monthly';
            if (type === 'User Analytics') endpoint = '/admin/reports/users';

            const response = await api.get(endpoint);
            setReportData(response.data);
            setActiveReport(type);
            toast.success(`${type} generated successfully`);
          } catch (error) {
            console.error("Error generating report", error);
            toast.error("Failed to generate report");
          }
        };

        return (
          <div>
            <h2>Reports & Analytics</h2>
            <div className="reports-grid">
              {[
                { title: 'Daily Report', desc: 'Generate daily transaction and user activity report' },
                { title: 'Monthly Summary', desc: 'Comprehensive monthly performance analysis' },
                { title: 'User Analytics', desc: 'User behavior and engagement metrics' }
              ].map((report, index) => (
                <div key={index} className="report-card">
                  <h3>{report.title}</h3>
                  <p>{report.desc}</p>
                  <button className="btn-secondary" onClick={() => generateReport(report.title)}>
                    Generate Report
                  </button>
                </div>
              ))}
            </div>

            {/* Report Modal */}
            {activeReport && reportData && (
              <div className="modal" onClick={() => { setActiveReport(null); setReportData(null); }}>
                <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
                  <span className="close" onClick={() => { setActiveReport(null); setReportData(null); }}>&times;</span>
                  <div className="report-header">
                    <h2>{reportData.title}</h2>
                    <p>Generated at: {reportData.generated_at}</p>
                    {reportData.period && <p className="period-badge">{reportData.period}</p>}
                  </div>

                  <div className="report-body">
                    {/* Metrics Grid */}
                    {reportData.metrics && (
                      <div className="metrics-grid">
                        {reportData.metrics.map((metric, idx) => (
                          <div key={idx} className="metric-card">
                            <h4>{metric.label}</h4>
                            <p>{metric.value}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Data Table for Monthly Report */}
                    {reportData.data && (
                      <div className="report-table-container">
                        <table className="report-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Volume</th>
                              <th>Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.data.map((row, idx) => (
                              <tr key={idx}>
                                <td>{row.date}</td>
                                <td>{row.volume}</td>
                                <td>{row.count}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="report-actions">
                    <button className="btn-primary" onClick={() => window.print()}>Print Report</button>
                    <button className="btn-secondary" onClick={() => { setActiveReport(null); setReportData(null); }}>Close</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'settings':
        return (
          <div>
            <h2>System Settings</h2>
            <div className="settings-grid">
              <div className="setting-card">
                <h3>Security Settings</h3>
                <div className="setting-item">
                  <label>Two-Factor Authentication</label>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="setting-item">
                  <label>Session Timeout (minutes)</label>
                  <input type="number" defaultValue="30" />
                </div>
              </div>
              <div className="setting-card">
                <h3>Transaction Limits</h3>
                <div className="setting-item">
                  <label>Daily Limit (₹)</label>
                  <input type="number" defaultValue="100000" />
                </div>
                <div className="setting-item">
                  <label>Per Transaction Limit (₹)</label>
                  <input type="number" defaultValue="50000" />
                </div>
              </div>
            </div>
            <button className="btn-primary" onClick={() => toast.success('Settings saved successfully!')}>
              Save Settings
            </button>
          </div>
        );

      case 'messages':
        return (
          <div className="messages-container">
            {/* Conversations List */}
            <div className="conversations-panel">
              <div className="conversations-header">
                <h3>Conversations</h3>
                <p>{conversations.length} conversation(s)</p>
              </div>
              <div className="sidebar-nav" style={{ flex: 1, overflowY: 'auto' }}> {/* Reusing sidebar-nav logic for scroll if needed, or specific class */}
                {conversations.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--admin-text-secondary)' }}>
                    <i className="fas fa-inbox" style={{ fontSize: '48px', marginBottom: '12px' }}></i>
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  conversations.map((conv, index) => (
                    <div
                      key={index}
                      onClick={() => loadConversationMessages(conv.id)}
                      className={`conversation-item ${selectedConversation === conv.id ? 'active' : ''}`}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--admin-text-primary)', fontSize: '15px' }}>
                          {conv.user_name}
                        </div>
                        {conv.unread_count > 0 && (
                          <span className="status blocked" style={{ borderRadius: '12px', padding: '2px 8px', fontSize: '11px' }}>
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', marginBottom: '4px' }}>
                        {conv.user_email}
                      </div>
                      {conv.last_message && (
                        <div style={{
                          fontSize: '13px',
                          color: 'var(--admin-text-secondary)',
                          opacity: 0.8,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {conv.last_message}
                        </div>
                      )}
                      {conv.last_message_time && (
                        <div style={{ fontSize: '11px', color: 'var(--admin-text-secondary)', opacity: 0.6, marginTop: '4px' }}>
                          {new Date(conv.last_message_time).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="chat-panel">
              {!selectedConversation ? (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--admin-text-secondary)',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <i className="fas fa-comments" style={{ fontSize: '64px' }}></i>
                  <p style={{ fontSize: '16px' }}>Select a conversation to view messages</p>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="chat-header">
                    <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--admin-text-primary)' }}>
                      {conversations.find(c => c.id === selectedConversation)?.user_name}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--admin-text-secondary)' }}>
                      {conversations.find(c => c.id === selectedConversation)?.user_email}
                    </p>
                  </div>

                  {/* Messages Area */}
                  <div className="chat-messages">
                    {conversationMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`message-row ${msg.sender_type === 'admin' ? 'admin' : 'user'}`}
                      >
                        <div className={`message-bubble ${msg.sender_type === 'admin' ? 'admin-bg' : 'user-bg'}`}>
                          {msg.sender_type === 'user' && (
                            <div style={{ fontSize: '11px', color: 'var(--admin-text-secondary)', marginBottom: '4px', fontWeight: '600' }}>
                              User
                            </div>
                          )}
                          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{msg.message_text}</div>
                          <div style={{
                            fontSize: '10px',
                            color: msg.sender_type === 'admin' ? 'rgba(255,255,255,0.7)' : 'var(--admin-text-secondary)',
                            marginTop: '4px'
                          }}>
                            {new Date(msg.created_at).toLocaleString('en-IN', {
                              timeZone: 'Asia/Kolkata',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Area */}
                  <div className="chat-input-area">
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                      <textarea
                        placeholder="Type your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows="2"
                        className="chat-input"
                      />
                      <button
                        className="btn-primary"
                        onClick={handleSendReply}
                        style={{
                          padding: '12px 24px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          height: 'fit-content'
                        }}
                      >
                        <i className="fas fa-paper-plane"></i>
                        Send
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/sn4-logo.jpg" alt="SN4 Logo" className="logo-image" />
          <span style={{ fontSize: '24px', fontWeight: 'bold' }}>SN4 Admin</span>
        </div>
        <nav className="sidebar-nav">
          {[
            { key: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
            { key: 'users', icon: 'fa-users', label: 'User Management' },
            { key: 'loans', icon: 'fa-money-bill-wave', label: 'Loans' }, // Added Loan Item
            { key: 'transactions', icon: 'fa-exchange-alt', label: 'Transactions' },
            { key: 'messages', icon: 'fa-envelope', label: 'Messages' },
            { key: 'reports', icon: 'fa-chart-bar', label: 'Reports' },
            { key: 'settings', icon: 'fa-cog', label: 'Settings' }
          ].map((item) => (
            <a
              key={item.key}
              href="#!"
              className={`nav-item ${activeSection === item.key ? 'active' : ''}`}
              onClick={() => setActiveSection(item.key)}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
            </a>
          ))}
          <a href="#!" className="nav-item logout" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="admin-header">
          <h1>
            {activeSection === 'dashboard' ? 'Dashboard Overview' :
              activeSection === 'users' ? 'User Management' :
                activeSection === 'loans' ? 'Loan Management' :
                  activeSection === 'transactions' ? 'Transaction Monitoring' :
                    activeSection === 'messages' ? 'User Messages' :
                      activeSection === 'reports' ? 'Reports & Analytics' :
                        'System Settings'}
          </h1>
          <div className="admin-info">
            <span>Admin: <strong>System Administrator</strong></span>
            <i className="fas fa-user-shield"></i>
          </div>
        </header>

        <section className="content-section active">
          {renderContent()}
        </section>
      </main>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal" onClick={() => setShowAddUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setShowAddUserModal(false)}>&times;</span>
            <h2>Add New User</h2>
            <form onSubmit={handleAddUser}>
              {[
                { name: 'name', label: 'Full Name', type: 'text' },
                { name: 'email', label: 'Email', type: 'email' },
                { name: 'phone', label: 'Phone', type: 'tel' },
                { name: 'balance', label: 'Initial Balance', type: 'number' }
              ].map((field, index) => (
                <div key={index} className="form-group">
                  <label>{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    required={field.name !== 'balance'}
                  />
                </div>
              ))}
              <button type="submit" className="btn-submit">Add User</button>
            </form>
          </div>
        </div>
      )}

      {/* Reject Loan Modal */}
      {showRejectModal && (
        <div className="modal" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <span className="close" onClick={() => setShowRejectModal(false)}>&times;</span>
            <h2 style={{ color: '#e53e3e' }}>Reject Loan Application</h2>
            <p className="mb-4">Please provide a reason for rejecting this loan application.</p>
            <div className="form-group">
              <label>Rejection Reason</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows="4"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  marginTop: '8px'
                }}
                placeholder="Ex: Low credit score, Insufficient income documentation..."
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button className="btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button
                className="btn-primary"
                style={{ backgroundColor: '#e53e3e' }}
                onClick={confirmRejectLoan}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Loan Modal */}
      {showApproveModal && selectedLoan && (
        <div className="modal" onClick={() => setShowApproveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <span className="close" onClick={() => setShowApproveModal(false)}>&times;</span>
            <h2 style={{ color: '#38a169' }}>Approve Loan Application</h2>
            <div style={{ margin: '20px 0', padding: '20px', backgroundColor: '#f0fff4', borderRadius: '12px', border: '1px solid #c6f6d5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Loan Amount:</span>
                <strong>₹{selectedLoan.amount.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Interest Rate:</span>
                <strong>{selectedLoan.interest_rate}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Tenure:</span>
                <strong>{selectedLoan.tenure_months} Months</strong>
              </div>
              <div style={{ borderTop: '1px dashed #48bb78', margin: '10px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#2f855a' }}>
                <span>Total Amount Receivable:</span>
                <strong>₹{(selectedLoan.emi * selectedLoan.tenure_months).toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: '#38a169' }}>
                <span>Bank Profit (Interest):</span>
                <span>₹{Math.round((selectedLoan.emi * selectedLoan.tenure_months) - selectedLoan.amount).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: '#718096', marginBottom: '20px' }}>
              Approving this loan will disburse <strong>₹{selectedLoan.amount.toLocaleString('en-IN')}</strong> to the user's account immediately.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => setShowApproveModal(false)}>Cancel</button>
              <button
                className="btn-primary"
                style={{ backgroundColor: '#38a169' }}
                onClick={confirmApproveLoan}
              >
                Confirm & Disburse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;