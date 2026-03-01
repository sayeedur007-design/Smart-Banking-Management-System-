import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const LoansPage = () => {
    const { user } = useAuth();
    const { darkMode } = useTheme();
    const toast = useToast(); // Correctly get the toast object
    const [loanStatus, setLoanStatus] = useState({ credit_score: 0, is_loan_active: false });
    const [myLoans, setMyLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [formData, setFormData] = useState({
        type: 'Personal Loan',
        amount: '',
        tenure_months: 12,
        interest_rate: 10.5
    });
    const [calculatedEMI, setCalculatedEMI] = useState(0);

    const theme = {
        bg: darkMode ? '#0a1929' : '#f5f7fa',
        headerBg: darkMode ? '#0d1f2d' : '#ffffff',
        text: darkMode ? '#d1d4dc' : '#2d3748',
        textSecondary: darkMode ? '#8899aa' : '#718096',
        border: darkMode ? '#1a3a52' : '#e2e8f0',
        cardBg: darkMode ? '#0d1f2d' : '#ffffff',
        heading: darkMode ? '#ffffff' : '#1a202c',
        inputBg: darkMode ? '#1a3a52' : '#edf2f7',
        accent: '#3182ce',
        success: '#38a169',
        warning: '#e53e3e'
    };

    const calculateEMI = React.useCallback(() => {
        const principal = parseFloat(formData.amount);
        const ratePerMonth = parseFloat(formData.interest_rate) / (12 * 100);
        const tenure = parseFloat(formData.tenure_months);

        if (principal && ratePerMonth && tenure) {
            const emi = (principal * ratePerMonth * Math.pow(1 + ratePerMonth, tenure)) /
                (Math.pow(1 + ratePerMonth, tenure) - 1);
            setCalculatedEMI(Math.round(emi));
        } else {
            setCalculatedEMI(0);
        }
    }, [formData.amount, formData.interest_rate, formData.tenure_months]);

    const fetchData = React.useCallback(async () => {
        try {
            setLoading(true);
            const statusRes = await api.get('/loans/status');
            setLoanStatus(statusRes.data);

            const loansRes = await api.get('/loans/my-loans');
            setMyLoans(loansRes.data);
        } catch (error) {
            console.error('Error fetching loan data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        calculateEMI();
    }, [calculateEMI]);

    const handleApply = async (e) => {
        e.preventDefault();
        try {
            await api.post('/loans/apply', {
                ...formData,
                amount: parseFloat(formData.amount),
                interest_rate: parseFloat(formData.interest_rate),
                tenure_months: parseInt(formData.tenure_months),
                emi: calculatedEMI
            });
            setShowSuccessModal(true);
            fetchData();
            setFormData({ ...formData, amount: '' });
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to apply for loan');
        }
    };

    const getScoreColor = (score) => {
        if (score >= 780) return '#38a169'; // Excellent (Green)
        if (score >= 700) return '#ecc94b'; // Good (Yellow)
        if (score >= 600) return '#dd6b20'; // Fair (Orange)
        return '#e53e3e'; // Bad (Red)
    };

    return (
        <div style={{
            backgroundColor: theme.bg,
            minHeight: '100vh',
            color: theme.text,
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
                alignItems: 'center'
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '500', color: theme.heading }}>Loans & Credit</h1>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: theme.textSecondary }}>Manage your loans and check eligibility</p>
                </div>
                <button onClick={() => window.close()} style={{
                    backgroundColor: '#ef5350', color: 'white', border: 'none', borderRadius: '6px',
                    padding: '8px 16px', cursor: 'pointer', fontWeight: '500'
                }}>Close</button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px', color: theme.textSecondary }}>Loading...</div>
            ) : (
                <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Credit Score Section */}
                    <div style={{
                        backgroundColor: theme.cardBg,
                        borderRadius: '12px',
                        padding: '30px',
                        border: `1px solid ${theme.border}`,
                        marginBottom: '30px',
                        textAlign: 'center',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                    }}>
                        <h2 style={{ color: theme.textSecondary, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Credit Score</h2>
                        <div style={{ position: 'relative', display: 'inline-block', margin: '20px 0', width: '300px', height: '160px' }}>
                            {/* SVG Gauge */}
                            <svg viewBox="0 0 200 110" style={{ width: '100%', height: '100%' }}>
                                {/* Segments - 180 degrees total, 4 segments of 45 degrees each */}
                                {/* Bad (Red) */}
                                <path d="M 20 100 A 80 80 0 0 1 43.4 43.4" fill="none" stroke="#ef5350" strokeWidth="20" />
                                {/* Fair (Orange) */}
                                <path d="M 43.4 43.4 A 80 80 0 0 1 100 20" fill="none" stroke="#f6ad55" strokeWidth="20" />
                                {/* Good (Yellow) */}
                                <path d="M 100 20 A 80 80 0 0 1 156.6 43.4" fill="none" stroke="#f6e05e" strokeWidth="20" />
                                {/* Excellent (Green) */}
                                <path d="M 156.6 43.4 A 80 80 0 0 1 180 100" fill="none" stroke="#48bb78" strokeWidth="20" />

                                {/* Needle */}
                                <g style={{
                                    transformOrigin: '100px 100px',
                                    transform: `rotate(${((loanStatus.credit_score - 300) / (900 - 300) * 180) - 90}deg)`,
                                    transition: 'transform 1s cubic-bezier(0.4, 0.0, 0.2, 1)'
                                }}>
                                    <path d="M 100 100 L 100 35" stroke="#2d3748" strokeWidth="4" strokeLinecap="round" />
                                    <circle cx="100" cy="100" r="6" fill="#2d3748" />
                                </g>
                            </svg>

                            {/* Score Display */}
                            <div style={{
                                position: 'absolute',
                                bottom: '0',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                textAlign: 'center',
                                zIndex: 3
                            }}>
                                <div style={{
                                    fontSize: '36px',
                                    fontWeight: 'bold',
                                    color: getScoreColor(loanStatus.credit_score),
                                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    {loanStatus.credit_score}
                                </div>
                                <div style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: getScoreColor(loanStatus.credit_score),
                                    textTransform: 'uppercase'
                                }}>
                                    {loanStatus.credit_score >= 780 ? 'Excellent' :
                                        loanStatus.credit_score >= 700 ? 'Good' :
                                            loanStatus.credit_score >= 600 ? 'Fair' : 'Bad'}
                                </div>
                            </div>
                        </div>
                        <p style={{ color: theme.textSecondary, marginTop: '10px' }}>
                            {loanStatus.credit_score >= 780 ? 'Excellent! You are eligible for premium loans.' :
                                loanStatus.credit_score >= 700 ? 'Good. You can apply for most loans.' :
                                    loanStatus.credit_score >= 600 ? 'Fair. Interest rates may be higher.' : 'Bad. Consider improving your score.'}
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
                        {/* Loan Application Form */}
                        <div style={{
                            backgroundColor: theme.cardBg,
                            borderRadius: '12px',
                            padding: '30px',
                            border: `1px solid ${theme.border}`
                        }}>
                            <h2 style={{ color: theme.heading, marginBottom: '20px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px' }}>
                                Apply for a Loan
                            </h2>

                            {/* Loan Form is now open for everyone */}
                            <form onSubmit={handleApply}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: theme.textSecondary }}>Loan Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        style={{
                                            width: '100%', padding: '12px', borderRadius: '8px',
                                            border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text
                                        }}
                                    >
                                        <option>Personal Loan</option>
                                        <option>Home Loan</option>
                                        <option>Car Loan</option>
                                        <option>Education Loan</option>
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', color: theme.textSecondary }}>Amount (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            placeholder="Ex: 500000"
                                            required
                                            style={{
                                                width: '100%', padding: '12px', borderRadius: '8px',
                                                border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', color: theme.textSecondary }}>Tenure (Months)</label>
                                        <input
                                            type="number"
                                            value={formData.tenure_months}
                                            onChange={(e) => setFormData({ ...formData, tenure_months: e.target.value })}
                                            required
                                            style={{
                                                width: '100%', padding: '12px', borderRadius: '8px',
                                                border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: theme.textSecondary }}>Interest Rate (% p.a)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.interest_rate}
                                        onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                                        required
                                        style={{
                                            width: '100%', padding: '12px', borderRadius: '8px',
                                            border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text
                                        }}
                                    />
                                </div>

                                <div style={{
                                    backgroundColor: darkMode ? 'rgba(49, 130, 206, 0.1)' : '#ebf8ff',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    marginBottom: '20px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '14px', color: theme.textSecondary }}>Estimated Monthly EMI</div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.accent }}>
                                        ₹{calculatedEMI.toLocaleString('en-IN')}
                                    </div>
                                    <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-around', borderTop: `1px solid ${theme.border}`, paddingTop: '15px' }}>
                                        <div>
                                            <div style={{ fontSize: '12px', color: theme.textSecondary }}>Total Interest</div>
                                            <div style={{ fontSize: '16px', fontWeight: '600', color: theme.warning }}>
                                                ₹{(calculatedEMI * formData.tenure_months - formData.amount).toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '12px', color: theme.textSecondary }}>Total Payment</div>
                                            <div style={{ fontSize: '16px', fontWeight: '600', color: theme.heading }}>
                                                ₹{(calculatedEMI * formData.tenure_months).toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" style={{
                                    width: '100%', padding: '14px', backgroundColor: theme.accent, color: 'white',
                                    border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer'
                                }}>
                                    Apply Now
                                </button>
                            </form>
                        </div>

                        {/* Loan History */}
                        <div style={{
                            backgroundColor: theme.cardBg,
                            borderRadius: '12px',
                            padding: '30px',
                            border: `1px solid ${theme.border}`
                        }}>
                            <h2 style={{ color: theme.heading, marginBottom: '20px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px' }}>
                                My Loans
                            </h2>
                            {myLoans.length === 0 ? (
                                <p style={{ color: theme.textSecondary, textAlign: 'center', marginTop: '40px' }}>No active loans found.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {myLoans.map((loan) => (
                                        <div key={loan.id} style={{
                                            padding: '15px',
                                            border: `1px solid ${theme.border}`,
                                            borderRadius: '8px',
                                            backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontWeight: '600', color: theme.heading }}>{loan.type}</span>
                                                <span style={{
                                                    padding: '2px 8px', borderRadius: '4px', fontSize: '12px',
                                                    backgroundColor: loan.status === 'approved' ? 'rgba(56, 161, 105, 0.1)' : 'rgba(214, 158, 46, 0.1)',
                                                    color: loan.status === 'approved' ? '#38a169' : '#d69e2e'
                                                }}>{loan.status.toUpperCase()}</span>
                                            </div>
                                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: theme.heading, marginBottom: '8px' }}>
                                                ₹{loan.amount.toLocaleString('en-IN')}
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: theme.textSecondary }}>
                                                <span>EMI: <span style={{ color: theme.heading, fontWeight: '500' }}>₹{loan.emi.toLocaleString('en-IN')}</span></span>
                                                <span>Rate: <span style={{ color: theme.heading, fontWeight: '500' }}>{loan.interest_rate}%</span></span>
                                                <span>Tenure: <span style={{ color: theme.heading, fontWeight: '500' }}>{loan.tenure_months}m</span></span>
                                                <span>Total: <span style={{ color: theme.heading, fontWeight: '500' }}>₹{(loan.emi * loan.tenure_months).toLocaleString('en-IN')}</span></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: theme.cardBg,
                        padding: '30px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        maxWidth: '400px',
                        width: '90%',
                        border: `1px solid ${theme.border}`,
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            backgroundColor: 'rgba(56, 161, 105, 0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            margin: '0 auto 20px auto'
                        }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#38a169" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', color: theme.heading }}>Application Submitted!</h3>
                        <p style={{ color: theme.textSecondary, marginBottom: '24px', lineHeight: '1.5' }}>
                            Your loan application has been submitted successfully. It is now waiting for Bank to respond.
                        </p>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            style={{
                                backgroundColor: theme.accent,
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '10px 24px',
                                fontSize: '16px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                width: '100%'
                            }}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default LoansPage;
