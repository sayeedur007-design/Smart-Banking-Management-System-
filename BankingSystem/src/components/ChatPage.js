import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const ChatPage = () => {
    const { darkMode } = useTheme();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const messagesEndRef = useRef(null);
    const toast = useToast();

    const theme = {
        bg: darkMode ? '#0a1929' : '#f5f7fa',
        headerBg: darkMode ? '#0d1f2d' : '#ffffff',
        text: darkMode ? '#d1d4dc' : '#2d3748',
        textSecondary: darkMode ? '#8899aa' : '#718096',
        border: darkMode ? '#1a3a52' : '#e2e8f0',
        cardBg: darkMode ? '#1a1f2e' : '#ffffff',
        inputBg: darkMode ? '#1a1f2e' : '#edf2f7',
        heading: darkMode ? '#ffffff' : '#1a202c',
        messageUser: '#ff6b6b',
        messageAdmin: darkMode ? '#1a1f2e' : '#ffffff',
        messageAdminText: darkMode ? '#fff' : '#2d3748',
        messageAdminBorder: darkMode ? '#2d3748' : '#e2e8f0'
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserInfo();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchUserInfo = async () => {
        try {
            const response = await api.get('/users/me');
            setUserEmail(response.data.email);
            setUserName(response.data.name);
            setIsAuthenticated(true);
            // Load previous messages
            loadMessages(response.data.email);
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    const loadMessages = async (email) => {
        try {
            const response = await api.get('/admin/messages');
            const userMessages = response.data.filter(msg => msg.email === email);
            setMessages(userMessages.map(msg => ({
                text: msg.message,
                sender: 'user',
                timestamp: new Date(msg.created_at)
            })));
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/verify-email', { email: userEmail });
            if (response.data.exists) {
                setUserName(response.data.name);
                setIsAuthenticated(true);
                loadMessages(userEmail);
            }
        } catch (error) {
            toast.error('Email not registered. Please register first.');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const message = {
            text: newMessage,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages([...messages, message]);
        setNewMessage('');

        // Send to backend
        try {
            await api.post('/admin/messages', {
                email: userEmail,
                message: newMessage
            });
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    if (!isAuthenticated) {
        return (
            <div style={{
                backgroundColor: theme.bg,
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                transition: 'background-color 0.3s'
            }}>
                <div style={{
                    backgroundColor: theme.cardBg,
                    padding: '40px',
                    borderRadius: '15px',
                    border: `1px solid ${theme.border}`,
                    maxWidth: '400px',
                    width: '100%',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    transition: 'background-color 0.3s, border-color 0.3s'
                }}>
                    <h2 style={{ color: theme.heading, marginBottom: '20px', textAlign: 'center' }}>
                        <i className="fas fa-comments" style={{ marginRight: '10px', color: '#ff6b6b' }}></i>
                        Start Chat
                    </h2>
                    <p style={{ color: theme.textSecondary, marginBottom: '30px', textAlign: 'center' }}>
                        Enter your registered email to continue
                    </p>
                    <form onSubmit={handleEmailSubmit}>
                        <input
                            type="email"
                            placeholder="Enter your registered email"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                backgroundColor: theme.inputBg,
                                border: `1px solid ${theme.border}`,
                                borderRadius: '8px',
                                color: theme.text,
                                fontSize: '14px',
                                marginBottom: '20px',
                                outline: 'none'
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#ff6b6b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Start Chat
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: theme.bg,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            transition: 'background-color 0.3s'
        }}>
            {/* Header */}
            <div style={{
                backgroundColor: theme.headerBg,
                padding: '16px 24px',
                borderBottom: `1px solid ${theme.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background-color 0.3s, border-color 0.3s'
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '500', color: theme.heading }}>
                        <i className="fas fa-headset" style={{ marginRight: '10px', color: '#ff6b6b' }}></i>
                        Support Chat
                    </h1>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: theme.textSecondary }}>
                        Connected as {userName}
                    </p>
                </div>
                <button
                    onClick={() => window.close()}
                    style={{
                        backgroundColor: '#ef5350',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    Close
                </button>
            </div>

            {/* Messages Area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                maxWidth: '900px',
                width: '100%',
                margin: '0 auto'
            }}>
                {messages.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        color: theme.textSecondary,
                        marginTop: '50px'
                    }}>
                        <i className="fas fa-comments" style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.5 }}></i>
                        <p style={{ fontSize: '16px' }}>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                marginBottom: '16px'
                            }}
                        >
                            <div style={{
                                maxWidth: '70%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                backgroundColor: msg.sender === 'user' ? theme.messageUser : theme.messageAdmin,
                                color: msg.sender === 'user' ? '#fff' : theme.messageAdminText,
                                border: msg.sender === 'admin' ? `1px solid ${theme.messageAdminBorder}` : 'none',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}>
                                {msg.sender === 'admin' && (
                                    <div style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '4px', fontWeight: '500' }}>
                                        Admin Support
                                    </div>
                                )}
                                <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{msg.text}</div>
                                <div style={{
                                    fontSize: '11px',
                                    color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : theme.textSecondary,
                                    marginTop: '4px'
                                }}>
                                    {msg.timestamp.toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
                backgroundColor: theme.headerBg,
                borderTop: `1px solid ${theme.border}`,
                padding: '20px',
                transition: 'background-color 0.3s, border-color 0.3s'
            }}>
                <form onSubmit={handleSendMessage} style={{
                    maxWidth: '900px',
                    margin: '0 auto',
                    display: 'flex',
                    gap: '12px'
                }}>
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            backgroundColor: theme.inputBg,
                            border: `1px solid ${theme.border}`,
                            borderRadius: '8px',
                            color: theme.text,
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'background-color 0.3s, border-color 0.3s, color 0.3s'
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#ff6b6b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <i className="fas fa-paper-plane"></i>
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPage;
