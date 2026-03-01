import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const RegisterModal = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    gender: '',
    profile_photo: '',
    adhar_number: '',
    dob: '',
    upi_pin: '',
    confirm_upi_pin: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showUpiPin, setShowUpiPin] = useState(false);
  const [showConfirmUpiPin, setShowConfirmUpiPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultType, setResultType] = useState('success'); // 'success' or 'error'
  const [resultMessage, setResultMessage] = useState('');

  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          profile_photo: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.mobile) {
      setResultType('error');
      setResultMessage('Please fill in all fields');
      setShowResultModal(true);
      return false;
    }

    if (formData.name.length < 2) {
      setResultType('error');
      setResultMessage('Name must be at least 2 characters long');
      setShowResultModal(true);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setResultType('error');
      setResultMessage('Please enter a valid email address');
      setShowResultModal(true);
      return false;
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.mobile)) {
      setResultType('error');
      setResultMessage('Please enter a valid 10-digit mobile number');
      setShowResultModal(true);
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!formData.gender || !formData.adhar_number || !formData.dob) {
      setResultType('error');
      setResultMessage('Please fill in all required fields');
      setShowResultModal(true);
      return false;
    }

    const adharRegex = /^\d{12}$/;
    if (!adharRegex.test(formData.adhar_number)) {
      setResultType('error');
      setResultMessage('Please enter a valid 12-digit Aadhar number');
      setShowResultModal(true);
      return false;
    }

    const today = new Date();
    const birthDate = new Date(formData.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      setResultType('error');
      setResultMessage('You must be at least 18 years old to register');
      setShowResultModal(true);
      return false;
    }

    return true;
  };

  const validateStep3 = () => {
    if (!formData.password || !formData.upi_pin || !formData.confirm_upi_pin) {
      setResultType('error');
      setResultMessage('Please fill in all required fields');
      setShowResultModal(true);
      return false;
    }

    if (formData.password.length < 6) {
      setResultType('error');
      setResultMessage('Password must be at least 6 characters long');
      setShowResultModal(true);
      return false;
    }

    const upiPinRegex = /^\d{6}$/;
    if (!upiPinRegex.test(formData.upi_pin)) {
      setResultType('error');
      setResultMessage('UPI PIN must be exactly 6 digits');
      setShowResultModal(true);
      return false;
    }

    if (formData.upi_pin !== formData.confirm_upi_pin) {
      setResultType('error');
      setResultMessage('UPI PIN and Confirm UPI PIN do not match');
      setShowResultModal(true);
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep3()) {
      return;
    }

    setLoading(true);

    try {
      const { confirm_upi_pin, ...registrationData } = formData;
      await register(registrationData);

      setResultType('success');
      setResultMessage('Account created successfully! Redirecting to login...');
      setShowResultModal(true);

      // Auto-close and redirect after 2 seconds
      setTimeout(() => {
        setShowResultModal(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setResultType('error');
      setResultMessage(error.response?.data?.detail || 'Registration failed. Please try again.');
      setShowResultModal(true);
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => {
    const progress = (currentStep / 3) * 100;
    return (
      <div style={{ marginBottom: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '14px', color: '#4a5568', fontWeight: '600' }}>
            Step {currentStep} of 3
          </span>
          <span style={{ fontSize: '14px', color: '#4a5568' }}>
            {currentStep === 1 ? 'Basic Information' : currentStep === 2 ? 'Personal Details' : 'Security Setup'}
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: '#e2e8f0',
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#4299e1',
            transition: 'width 0.3s ease',
            borderRadius: '10px'
          }}></div>
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <>
      <div className="form-group">
        <label>Full Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          required
        />
      </div>
      <div className="form-group">
        <label>Email Address *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />
      </div>
      <div className="form-group">
        <label>Mobile Number *</label>
        <input
          type="tel"
          name="mobile"
          value={formData.mobile}
          onChange={handleChange}
          placeholder="10-digit mobile number"
          maxLength="10"
          required
        />
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="form-group">
        <label>Gender *</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="form-group">
        <label>Date of Birth *</label>
        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
          required
        />
      </div>
      <div className="form-group">
        <label>Aadhar Card Number *</label>
        <input
          type="text"
          name="adhar_number"
          value={formData.adhar_number}
          onChange={handleChange}
          placeholder="12-digit Aadhar number"
          maxLength="12"
          required
        />
      </div>
      <div className="form-group">
        <label>Profile Photo (Optional)</label>
        <input
          type="file"
          name="profile_photo"
          accept="image/*"
          onChange={handleFileChange}
        />
        {formData.profile_photo && (
          <small style={{ color: '#38a169', marginTop: '5px', display: 'block' }}>
            ✓ Photo uploaded
          </small>
        )}
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <div className="form-group">
        <label>Password *</label>
        <div className="password-input">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
            required
          />
          <i
            className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
            onClick={() => setShowPassword(!showPassword)}
          ></i>
        </div>
      </div>
      <div className="form-group">
        <label>UPI PIN *</label>
        <div className="password-input">
          <input
            type={showUpiPin ? 'text' : 'password'}
            name="upi_pin"
            value={formData.upi_pin}
            onChange={handleChange}
            placeholder="6-digit UPI PIN"
            maxLength="6"
            required
          />
          <i
            className={`fas ${showUpiPin ? 'fa-eye-slash' : 'fa-eye'}`}
            onClick={() => setShowUpiPin(!showUpiPin)}
          ></i>
        </div>
      </div>
      <div className="form-group">
        <label>Confirm UPI PIN *</label>
        <div className="password-input">
          <input
            type={showConfirmUpiPin ? 'text' : 'password'}
            name="confirm_upi_pin"
            value={formData.confirm_upi_pin}
            onChange={handleChange}
            placeholder="Re-enter 6-digit UPI PIN"
            maxLength="6"
            required
          />
          <i
            className={`fas ${showConfirmUpiPin ? 'fa-eye-slash' : 'fa-eye'}`}
            onClick={() => setShowConfirmUpiPin(!showConfirmUpiPin)}
          ></i>
        </div>
      </div>
    </>
  );

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={onClose}>&times;</span>
        <div className="register-form">
          <div className="form-header">
            <i className="fas fa-university"></i>
            <h2>Create Account</h2>
          </div>

          {renderProgressBar()}

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              {currentStep > 1 && (
                <button
                  type="button"
                  className="btn-back"
                  onClick={handleBack}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#e2e8f0',
                    color: '#2d3748',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  className="btn-submit"
                  onClick={handleNext}
                  style={{ flex: 1 }}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Success/Error Result Modal */}
      {showResultModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            animation: 'fadeIn 0.3s ease-in-out'
          }}
          onClick={() => resultType === 'error' && setShowResultModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '40px 30px',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              animation: 'slideUp 0.4s ease-out',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: resultType === 'success' ? 'rgba(56, 161, 105, 0.1)' : 'rgba(229, 62, 62, 0.1)',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: resultType === 'success' ? 'scaleIn 0.5s ease-out' : 'shake 0.5s ease-out'
            }}>
              <i
                className={`fas ${resultType === 'success' ? 'fa-check' : 'fa-times'}`}
                style={{
                  fontSize: '40px',
                  color: resultType === 'success' ? '#38a169' : '#e53e3e',
                  animation: 'fadeIn 0.6s ease-in-out'
                }}
              ></i>
            </div>

            {/* Title */}
            <h2 style={{
              color: resultType === 'success' ? '#38a169' : '#e53e3e',
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '10px'
            }}>
              {resultType === 'success' ? 'Success!' : 'Oops!'}
            </h2>

            {/* Message */}
            <p style={{
              color: '#4a5568',
              fontSize: '16px',
              lineHeight: '1.5',
              marginBottom: '30px'
            }}>
              {resultMessage}
            </p>

            {/* Close Button (only for errors) */}
            {resultType === 'error' && (
              <button
                onClick={() => setShowResultModal(false)}
                style={{
                  backgroundColor: '#e53e3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 30px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(229, 62, 62, 0.3)'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#c53030'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#e53e3e'}
              >
                Try Again
              </button>
            )}

            {/* Loading indicator for success */}
            {resultType === 'success' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                color: '#38a169',
                fontSize: '14px'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '3px solid rgba(56, 161, 105, 0.3)',
                  borderTop: '3px solid #38a169',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span>Redirecting...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RegisterModal;