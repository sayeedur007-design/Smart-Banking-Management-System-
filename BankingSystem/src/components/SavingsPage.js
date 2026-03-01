import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const SavingsPage = () => {
    const { user } = useAuth();
    // const { darkMode } = useTheme();
    const darkMode = true; // Always dark theme
    const [balance, setBalance] = useState(0);
    const [cards, setCards] = useState([]);
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);

    const theme = {
        bg: darkMode ? '#0a1929' : '#f5f7fa',
        headerBg: darkMode ? '#0d1f2d' : '#ffffff',
        text: darkMode ? '#d1d4dc' : '#2d3748',
        textSecondary: darkMode ? '#8899aa' : '#718096',
        border: darkMode ? '#1a3a52' : '#e2e8f0',
        cardBg: darkMode ? '#0d1f2d' : '#ffffff',
        heading: darkMode ? '#ffffff' : '#1a202c',
        tableHeaderBg: darkMode ? '#1a3a52' : '#edf2f7',
        tableRowHover: darkMode ? '#1a3a52' : '#edf2f7',
        cardShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.05)'
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const balanceRes = await api.get('/users/balance');
                setBalance(balanceRes.data.balance);

                const cardsRes = await api.get('/services/cards');
                setCards(cardsRes.data);

                const investmentsRes = await api.get('/services/investments');
                setInvestments(investmentsRes.data);
            } catch (error) {
                console.error('Error fetching savings data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const totalInvestmentValue = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const totalAssets = balance + totalInvestmentValue;

    return (
        <div style={{
            backgroundColor: theme.bg,
            minHeight: '100vh',
            color: theme.text,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            padding: 0,
            margin: 0,
            transition: 'background-color 0.3s, color 0.3s'
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
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '500', color: theme.heading }}>My Savings Dashboard</h1>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: theme.textSecondary }}>Welcome, {user?.name}</p>
                </div>
                <button
                    onClick={() => window.close()}
                    style={{
                        backgroundColor: '#ef5350',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '10px 20px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    Close
                </button>
            </div>

            {loading ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 'calc(100vh - 80px)',
                    fontSize: '18px',
                    color: theme.textSecondary
                }}>
                    Loading...
                </div>
            ) : (
                <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
                    {/* Summary Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '20px',
                        marginBottom: '32px'
                    }}>
                        {/* Total Assets */}
                        <div style={{
                            backgroundColor: theme.cardBg,
                            borderRadius: '12px',
                            padding: '24px',
                            border: `1px solid ${theme.border}`,
                            background: darkMode ? 'linear-gradient(135deg, #1a3a52 0%, #0d1f2d 100%)' : 'linear-gradient(135deg, #e2e8f0 0%, #ffffff 100%)',
                            transition: 'background-color 0.3s, border-color 0.3s'
                        }}>
                            <div style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '8px' }}>Total Assets</div>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: theme.heading, marginBottom: '8px' }}>
                                ₹{totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64b5f6' }}>
                                💎 Across all accounts
                            </div>
                        </div>

                        {/* Bank Balance */}
                        <div style={{
                            backgroundColor: theme.cardBg,
                            borderRadius: '12px',
                            padding: '24px',
                            border: `1px solid ${theme.border}`,
                            transition: 'background-color 0.3s, border-color 0.3s'
                        }}>
                            <div style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '8px' }}>Bank Balance</div>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#26a69a', marginBottom: '8px' }}>
                                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                            <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                                💰 Available funds
                            </div>
                        </div>

                        {/* Total Investments */}
                        <div style={{
                            backgroundColor: theme.cardBg,
                            borderRadius: '12px',
                            padding: '24px',
                            border: `1px solid ${theme.border}`,
                            transition: 'background-color 0.3s, border-color 0.3s'
                        }}>
                            <div style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '8px' }}>Total Investments</div>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#64b5f6', marginBottom: '8px' }}>
                                ₹{totalInvestmentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                            <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                                📈 {investments.length} investment(s)
                            </div>
                        </div>
                    </div>

                    {/* Cards Section */}
                    <div style={{ marginBottom: '32px' }}>
                        <h2 style={{
                            fontSize: '20px',
                            fontWeight: '500',
                            color: theme.heading,
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            💳 My Cards
                            <span style={{ fontSize: '14px', color: theme.textSecondary, fontWeight: 'normal' }}>
                                ({cards.length})
                            </span>
                        </h2>
                        {cards.length === 0 ? (
                            <div style={{
                                backgroundColor: theme.cardBg,
                                borderRadius: '12px',
                                padding: '40px',
                                border: `1px solid ${theme.border}`,
                                textAlign: 'center',
                                color: theme.textSecondary,
                                transition: 'background-color 0.3s, border-color 0.3s'
                            }}>
                                No cards found. Apply for a new card from the dashboard.
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                                gap: '20px'
                            }}>
                                {cards.map((card, index) => (
                                    <div key={card.id || index} style={{
                                        backgroundColor: theme.cardBg,
                                        borderRadius: '12px',
                                        padding: '24px',
                                        border: `1px solid ${theme.border}`,
                                        background: card.type === 'Credit'
                                            ? 'linear-gradient(135deg, #2962ff 0%, #1a3a52 100%)'
                                            : 'linear-gradient(135deg, #26a69a 0%, #1a3a52 100%)',
                                        boxShadow: theme.cardShadow,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transition: 'background-color 0.3s, border-color 0.3s'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            top: '-20px',
                                            right: '-20px',
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: '50%',
                                            background: 'rgba(255,255,255,0.1)',
                                            filter: 'blur(20px)'
                                        }} />
                                        <div style={{ position: 'relative', zIndex: 1 }}>
                                            <div style={{
                                                fontSize: '12px',
                                                color: 'rgba(255,255,255,0.7)',
                                                marginBottom: '8px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '1px'
                                            }}>
                                                {card.type} Card
                                            </div>
                                            <div style={{
                                                fontSize: '20px',
                                                fontWeight: '600',
                                                color: '#fff',
                                                marginBottom: '16px',
                                                letterSpacing: '2px'
                                            }}>
                                                •••• •••• •••• {Math.floor(1000 + Math.random() * 9000)}
                                            </div>
                                            <div style={{ marginBottom: '12px' }}>
                                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                                                    CARD HOLDER
                                                </div>
                                                <div style={{ fontSize: '14px', color: '#fff', fontWeight: '500' }}>
                                                    {card.card_holder || user?.name}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                                                    LIMIT
                                                </div>
                                                <div style={{ fontSize: '16px', color: '#fff', fontWeight: '600' }}>
                                                    ₹{(card.limit || 0).toLocaleString('en-IN')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Investments Section */}
                    <div>
                        <h2 style={{
                            fontSize: '20px',
                            fontWeight: '500',
                            color: theme.heading,
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            📊 My Investments
                            <span style={{ fontSize: '14px', color: theme.textSecondary, fontWeight: 'normal' }}>
                                ({investments.length})
                            </span>
                        </h2>
                        {investments.length === 0 ? (
                            <div style={{
                                backgroundColor: theme.cardBg,
                                borderRadius: '12px',
                                padding: '40px',
                                border: `1px solid ${theme.border}`,
                                textAlign: 'center',
                                color: theme.textSecondary,
                                transition: 'background-color 0.3s, border-color 0.3s'
                            }}>
                                No investments yet. Start investing from the dashboard.
                            </div>
                        ) : (
                            <div style={{
                                backgroundColor: theme.cardBg,
                                borderRadius: '12px',
                                border: `1px solid ${theme.border}`,
                                overflow: 'hidden',
                                transition: 'background-color 0.3s, border-color 0.3s'
                            }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: theme.tableHeaderBg, transition: 'background-color 0.3s' }}>
                                            <th style={{
                                                padding: '16px 20px',
                                                textAlign: 'left',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                color: theme.heading,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>Name</th>
                                            <th style={{
                                                padding: '16px 20px',
                                                textAlign: 'left',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                color: theme.heading,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>Type</th>
                                            <th style={{
                                                padding: '16px 20px',
                                                textAlign: 'right',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                color: theme.heading,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {investments.map((investment, index) => (
                                            <tr key={investment.id || index} style={{
                                                borderBottom: index < investments.length - 1 ? `1px solid ${theme.border}` : 'none',
                                                transition: 'background-color 0.2s'
                                            }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.tableRowHover}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <td style={{ padding: '16px 20px', color: theme.text, fontSize: '14px' }}>
                                                    {investment.name || 'Investment'}
                                                </td>
                                                <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                                                    <span style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '12px',
                                                        backgroundColor: theme.tableRowHover,
                                                        color: '#64b5f6',
                                                        fontSize: '12px',
                                                        fontWeight: '500'
                                                    }}>
                                                        {investment.type || 'N/A'}
                                                    </span>
                                                </td>
                                                <td style={{
                                                    padding: '16px 20px',
                                                    textAlign: 'right',
                                                    color: '#26a69a',
                                                    fontSize: '15px',
                                                    fontWeight: '600'
                                                }}>
                                                    ₹{(investment.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavingsPage;
