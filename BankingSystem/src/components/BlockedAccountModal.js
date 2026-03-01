import React from 'react';
import './BlockedAccountModal.css';

const BlockedAccountModal = ({ show, onClose }) => {
    if (!show) return null;

    return (
        <div className="blocked-modal-overlay" onClick={onClose}>
            <div className="blocked-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="blocked-modal-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="#ff4444" strokeWidth="2" />
                        <path d="M15 9L9 15M9 9L15 15" stroke="#ff4444" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>

                <h2 className="blocked-modal-title">Account Blocked</h2>
                <p className="blocked-modal-message">
                    Your account has been blocked by the bank.
                </p>
                <p className="blocked-modal-submessage">
                    Please contact customer support for assistance.
                </p>

                <button className="blocked-modal-button" onClick={onClose}>
                    OK
                </button>
            </div>
        </div>
    );
};

export default BlockedAccountModal;
