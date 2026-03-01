import React from 'react';
import './IncorrectPasswordModal.css';

const IncorrectPasswordModal = ({ show, onClose, onSignUp }) => {
    if (!show) return null;

    return (
        <div className="incorrect-password-overlay" onClick={onClose}>
            <div className="incorrect-password-container" onClick={(e) => e.stopPropagation()}>
                <div className="incorrect-password-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="#ff4444" strokeWidth="2" fill="rgba(255, 68, 68, 0.1)" />
                        <path d="M15 9L9 15M9 9L15 15" stroke="#ff4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                <h2 className="incorrect-password-title">Incorrect Credentials</h2>
                <p className="incorrect-password-message">
                    The email or password you entered is incorrect. Do you want to sign up instead?
                </p>

                <div className="incorrect-password-actions">
                    <button className="incorrect-password-button" onClick={onClose}>
                        Try Again
                    </button>
                    {onSignUp && (
                        <button className="incorrect-password-signup-button" onClick={onSignUp}>
                            Sign Up
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IncorrectPasswordModal;
