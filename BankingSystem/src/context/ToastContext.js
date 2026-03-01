import React, { createContext, useContext, useState, useCallback } from 'react';
import './Toast.css';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, duration }]);

        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.map(toast =>
            toast.id === id ? { ...toast, hiding: true } : toast
        ));

        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 300); // Wait for animation
    }, []);

    const showToast = {
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        info: (msg) => addToast(msg, 'info')
    };

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`toast toast-${toast.type} ${toast.hiding ? 'hiding' : ''}`}
                    >
                        <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' :
                                toast.type === 'error' ? 'fa-exclamation-circle' :
                                    'fa-info-circle'
                            }`}></i>
                        <span className="toast-message">{toast.message}</span>
                        <div className="toast-progress">
                            <div
                                className="toast-progress-bar"
                                style={{
                                    animationDuration: `${toast.duration}ms`,
                                    color: toast.type === 'success' ? '#48bb78' :
                                        toast.type === 'error' ? '#f56565' : '#4299e1'
                                }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
