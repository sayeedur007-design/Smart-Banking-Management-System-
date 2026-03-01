import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BlockedAccountModal from './BlockedAccountModal';
import IncorrectPasswordModal from './IncorrectPasswordModal';

const LoginModal = ({ type, onClose, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    adminCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [showIncorrectPasswordModal, setShowIncorrectPasswordModal] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (type === 'admin' && !formData.adminCode) {
      toast.error('Admin code is required');
      setLoading(false);
      return;
    }

    try {
      await login(formData.email, formData.password, type, formData.adminCode);
      onClose();
      toast.success('Login successful');
      // Open dashboard in a new tab
      const dashboardUrl = type === 'admin' ? '/admin-dashboard' : '/user-dashboard';
      window.open(dashboardUrl, '_blank');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.detail || 'Login failed. Please check credentials.';

      // Check if the error is about blocked account
      if (errorMessage.toLowerCase().includes('blocked') || errorMessage.toLowerCase().includes('inactive')) {
        setShowBlockedModal(true);
      } else if (
        errorMessage.toLowerCase().includes('invalid credentials') ||
        errorMessage.toLowerCase().includes('password') ||
        errorMessage.toLowerCase().includes('incorrect') // Added to catch "Incorrect email or password"
      ) {
        // Show specific modal for incorrect password/credentials
        setShowIncorrectPasswordModal(true);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      {!showIncorrectPasswordModal && (
        <div className="modal" onClick={onClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={onClose}>&times;</span>
            <div className={`login-form ${type === 'admin' ? 'admin-login' : ''}`}>
              <div className="form-header">
                <i className={`fas ${type === 'admin' ? 'fa-user-shield' : 'fa-user'}`}></i>
                <h2>{type === 'admin' ? 'Admin Login' : 'User Login'}</h2>
                <p>{type === 'admin' ? 'Administrative access only' : 'Access your personal banking account'}</p>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>{type === 'admin' ? 'Admin Email' : 'Email or Mobile Number'}</label>
                  <input
                    type={type === 'admin' ? 'email' : 'text'}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{type === 'admin' ? 'Admin Password' : 'Password'}</label>
                  <div className="password-input">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <i
                      className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                      onClick={() => setShowPassword(!showPassword)}
                    ></i>
                  </div>
                </div>
                {type === 'admin' && (
                  <div className="form-group">
                    <label>Admin Code</label>
                    <input
                      type="text"
                      name="adminCode"
                      value={formData.adminCode}
                      onChange={handleChange}
                      placeholder="Enter admin verification code"
                      required
                    />
                  </div>
                )}
                <button
                  type="submit"
                  className={`btn-submit ${type === 'admin' ? 'admin-btn' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : type === 'admin' ? 'Admin Login' : 'Login to Account'}
                </button>
                {type === 'user' && (
                  <a href="#!" className="forgot-password">Forgot Password?</a>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      <BlockedAccountModal
        show={showBlockedModal}
        onClose={() => setShowBlockedModal(false)}
      />

      <IncorrectPasswordModal
        show={showIncorrectPasswordModal}
        onClose={() => setShowIncorrectPasswordModal(false)}
        onSignUp={onSwitchToRegister}
      />
    </>
  );
};

export default LoginModal;