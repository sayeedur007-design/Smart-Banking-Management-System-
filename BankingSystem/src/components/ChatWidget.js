import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [conversationId, setConversationId] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef(null);
    const toast = useToast();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Load conversation when widget is opened
        if (isOpen) {
            loadConversation();
        }
    }, [isOpen]);

    useEffect(() => {
        // Poll for new messages every 5 seconds when open
        let interval;
        if (isOpen) {
            interval = setInterval(() => {
                loadConversation();
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isOpen]);

    const loadConversation = async () => {
        try {
            const response = await api.get('/chat/user/conversation');
            setConversationId(response.data.conversation.id);
            setMessages(response.data.messages);

            // Count unread admin messages
            const unread = response.data.messages.filter(
                msg => msg.sender_type === 'admin' && msg.is_read === 0
            ).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Error loading conversation:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await api.post('/chat/user/message', {
                message_text: newMessage
            });

            setNewMessage('');
            loadConversation(); // Reload to get the new message
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message. Please try again.');
        }
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    if (!isOpen) {
        return (
            <div
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#ff6b6b',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(255, 107, 107, 0.4)',
                    zIndex: 9999,
                    transition: 'all 0.3s ease',
                    fontSize: '24px'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 107, 107, 0.6)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.4)';
                }}
            >
                <i className="fas fa-comments"></i>
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        backgroundColor: '#ef5350',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        border: '2px solid white'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: isFullScreen ? '0' : '20px',
            right: isFullScreen ? '0' : '20px',
            width: isFullScreen ? '100vw' : '380px',
            height: isFullScreen ? '100vh' : '500px',
            backgroundColor: '#0a1929',
            borderRadius: isFullScreen ? '0' : '12px',
            boxShadow: isFullScreen ? 'none' : '0 8px 24px rgba(0, 0, 0, 0.3)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            transition: 'all 0.3s ease'
        }}>
            {/* Header */}
            <div style={{
                backgroundColor: '#ff6b6b',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: 'white'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fas fa-headset"></i>
                    <span style={{ fontWeight: '600', fontSize: '16px' }}>Support Chat</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={toggleFullScreen}
                        style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                        title={isFullScreen ? 'Exit full screen' : 'Full screen'}
                    >
                        <i className={`fas fa-${isFullScreen ? 'compress' : 'expand'}`}></i>
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                backgroundColor: '#0d1f2d'
            }}>
                {messages.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        color: '#8899aa',
                        marginTop: '50px'
                    }}>
                        <i className="fas fa-comments" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}></i>
                        <p style={{ fontSize: '14px' }}>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                justifyContent: msg.sender_type === 'user' ? 'flex-end' : 'flex-start',
                                marginBottom: '12px'
                            }}
                        >
                            <div style={{
                                maxWidth: '75%',
                                padding: '10px 14px',
                                borderRadius: '12px',
                                backgroundColor: msg.sender_type === 'user' ? '#ff6b6b' : '#1a1f2e',
                                color: '#fff',
                                border: msg.sender_type === 'admin' ? '1px solid #2d3748' : 'none',
                                wordWrap: 'break-word'
                            }}>
                                {msg.sender_type === 'admin' && (
                                    <div style={{ fontSize: '11px', color: '#8899aa', marginBottom: '4px', fontWeight: '500' }}>
                                        Admin Support
                                    </div>
                                )}
                                <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{msg.message_text}</div>
                                <div style={{
                                    fontSize: '10px',
                                    color: msg.sender_type === 'user' ? 'rgba(255,255,255,0.7)' : '#8899aa',
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
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
                backgroundColor: '#0d1f2d',
                borderTop: '1px solid #1a3a52',
                padding: '12px'
            }}>
                <form onSubmit={handleSendMessage} style={{
                    display: 'flex',
                    gap: '8px'
                }}>
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '10px 12px',
                            backgroundColor: '#1a1f2e',
                            border: '1px solid #2d3748',
                            borderRadius: '8px',
                            color: '#e8e8e8',
                            fontSize: '14px',
                            outline: 'none'
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            padding: '10px 16px',
                            backgroundColor: '#ff6b6b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWidget;
