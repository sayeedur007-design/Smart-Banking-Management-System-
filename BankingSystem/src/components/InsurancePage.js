import React, { useState, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import ChatWidget from './ChatWidget';

const InsurancePage = () => {
    // const { darkMode } = useTheme();
    const darkMode = true; // Always dark theme for consistency
    const [selectedCategory, setSelectedCategory] = useState('All');

    const theme = {
        bg: '#052035', // Darker shade of Deep Blue for background
        headerBg: '#0A3D62', // Deep Blue
        cardBg: '#0A3D62', // Deep Blue
        text: '#ecf0f1',
        textSecondary: '#bdc3c7',
        border: '#14507a',
        accent: '#2ECC71', // Soft Green
        success: '#2ECC71', // Soft Green
        warning: '#f1c40f',
        danger: '#e74c3c',
        hoverBg: '#0d4b76',
    };

    const policies = [
        { id: 1, provider: 'LIC', name: 'Jeevan Anand', type: 'Life', premium: 12000, coverage: '10 Lakhs', tenure: '20 Years', popularity: 95 },
        { id: 2, provider: 'HDFC Life', name: 'Click 2 Protect', type: 'Term Life', premium: 8000, coverage: '1 Crore', tenure: '30 Years', popularity: 88 },
        { id: 3, provider: 'Star Health', name: 'Family Health Optima', type: 'Health', premium: 15000, coverage: '5 Lakhs', tenure: '1 Year', popularity: 92 },
        { id: 4, provider: 'ICICI Lombard', name: 'Car Protect', type: 'Vehicle', premium: 5000, coverage: 'IDV 4 Lakhs', tenure: '1 Year', popularity: 85 },
        { id: 5, provider: 'Max Life', name: 'Savings Plan', type: 'Life', premium: 25000, coverage: '15 Lakhs', tenure: '15 Years', popularity: 78 },
        { id: 6, provider: 'Niva Bupa', name: 'ReAssure 2.0', type: 'Health', premium: 18000, coverage: '10 Lakhs', tenure: '1 Year', popularity: 90 },
        { id: 7, provider: 'Bajaj Allianz', name: 'Two Wheeler Package', type: 'Vehicle', premium: 1200, coverage: 'IDV 50k', tenure: '1 Year', popularity: 82 },
        { id: 8, provider: 'SBI Life', name: 'Smart Shield', type: 'Term Life', premium: 9500, coverage: '75 Lakhs', tenure: '25 Years', popularity: 80 },
    ];

    const statsData = [
        { name: 'Life Insurance', value: 35, color: '#3182ce' },
        { name: 'Health Insurance', value: 30, color: '#38a169' },
        { name: 'Vehicle Insurance', value: 25, color: '#d69e2e' },
        { name: 'Term Life', value: 10, color: '#e53e3e' },
    ];

    const filteredPolicies = selectedCategory === 'All'
        ? policies
        : policies.filter(p => p.type.includes(selectedCategory) || (selectedCategory === 'Life' && p.type === 'Term Life'));

    const categories = ['All', 'Life', 'Health', 'Vehicle'];

    const [showModal, setShowModal] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [selectedYears, setSelectedYears] = useState(1);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const toast = useToast();

    const handleViewDetails = (policy) => {
        setSelectedPolicy(policy);
        setSelectedYears(1);
        setShowModal(true);
    };

    const handleBuyPolicy = async () => {
        if (!selectedPolicy) return;

        try {
            await api.post('/services/insurance', {
                provider: selectedPolicy.provider,
                type: selectedPolicy.type,
                premium: selectedPolicy.premium,
                coverage: parseFloat(selectedPolicy.coverage.replace(/[^0-9.]/g, '')), // Basic parsing, might need adjustment
                years: selectedYears,
                expiry_date: "" // Backend calculates this now
            });
            setShowModal(false);
            setShowSuccessModal(true);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to buy policy');
        }
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
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '500', color: theme.text }}>Insurance Center</h1>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: theme.textSecondary }}>Secure your future with top policies</p>
                </div>
                <button onClick={() => window.close()} style={{
                    backgroundColor: theme.danger, color: 'white', border: 'none', borderRadius: '6px',
                    padding: '8px 16px', cursor: 'pointer', fontWeight: '500'
                }}>Close</button>
            </div>

            <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>

                {/* Stats Section */}
                <div style={{
                    backgroundColor: theme.cardBg,
                    borderRadius: '12px',
                    padding: '24px',
                    border: `1px solid ${theme.border}`,
                    marginBottom: '30px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-around'
                }}>
                    <div style={{ flex: '1 1 300px', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '18px', marginBottom: '20px', color: theme.text }}>Most Sold Policy Types</h2>
                        <div style={{ width: '100%', height: '250px' }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={statsData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
                                        itemStyle={{ color: theme.text }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div style={{ flex: '1 1 400px', padding: '20px' }}>
                        <h3 style={{ fontSize: '16px', color: theme.textSecondary, marginBottom: '15px' }}>Top Performing Companies</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '500' }}>LIC</span>
                                <div style={{ width: '60%', backgroundColor: theme.border, height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: '90%', backgroundColor: theme.success, height: '100%' }}></div>
                                </div>
                                <span style={{ fontSize: '12px', color: theme.textSecondary }}>90% Trust</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '500' }}>HDFC Life</span>
                                <div style={{ width: '60%', backgroundColor: theme.border, height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: '85%', backgroundColor: theme.accent, height: '100%' }}></div>
                                </div>
                                <span style={{ fontSize: '12px', color: theme.textSecondary }}>85% Trust</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '500' }}>Star Health</span>
                                <div style={{ width: '60%', backgroundColor: theme.border, height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: '75%', backgroundColor: theme.warning, height: '100%' }}></div>
                                </div>
                                <span style={{ fontSize: '12px', color: theme.textSecondary }}>75% Trust</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: 'none',
                                backgroundColor: selectedCategory === cat ? theme.accent : theme.cardBg,
                                color: selectedCategory === cat ? 'white' : theme.textSecondary,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontWeight: '500'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Policies Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {filteredPolicies.map(policy => (
                        <div key={policy.id} style={{
                            backgroundColor: theme.cardBg,
                            borderRadius: '12px',
                            padding: '20px',
                            border: `1px solid ${theme.border}`,
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            cursor: 'pointer'
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                                <div>
                                    <div style={{ fontSize: '12px', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{policy.provider}</div>
                                    <h3 style={{ margin: '5px 0', fontSize: '18px', color: theme.text }}>{policy.name}</h3>
                                </div>
                                <span style={{
                                    padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                                    backgroundColor: policy.type === 'Health' ? 'rgba(56, 161, 105, 0.1)' : policy.type === 'Vehicle' ? 'rgba(214, 158, 46, 0.1)' : 'rgba(49, 130, 206, 0.1)',
                                    color: policy.type === 'Health' ? theme.success : policy.type === 'Vehicle' ? theme.warning : theme.accent
                                }}>
                                    {policy.type}
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                <div>
                                    <div style={{ fontSize: '12px', color: theme.textSecondary }}>Premium (Yr)</div>
                                    <div style={{ fontSize: '16px', fontWeight: '600', color: theme.text }}>₹{policy.premium.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: theme.textSecondary }}>Coverage</div>
                                    <div style={{ fontSize: '16px', fontWeight: '600', color: theme.text }}>{policy.coverage}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: theme.textSecondary }}>Tenure</div>
                                    <div style={{ fontSize: '14px', color: theme.text }}>{policy.tenure}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: theme.textSecondary }}>Popularity</div>
                                    <div style={{ fontSize: '14px', color: theme.success, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span style={{ fontSize: '10px' }}>🔥</span> {policy.popularity}%
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleViewDetails(policy)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: theme.hoverBg,
                                    color: theme.accent,
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}>
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Policy Details Modal */}
            {showModal && selectedPolicy && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }} onClick={() => setShowModal(false)}>
                    <div style={{
                        backgroundColor: theme.cardBg, padding: '30px', borderRadius: '12px', width: '500px', maxWidth: '90%',
                        border: `1px solid ${theme.border}`, boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                            <div>
                                <h2 style={{ margin: 0, color: theme.text }}>{selectedPolicy.name}</h2>
                                <p style={{ margin: '5px 0 0 0', color: theme.textSecondary }}>{selectedPolicy.provider}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: theme.textSecondary, fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <div style={{ marginBottom: '25px', padding: '20px', backgroundColor: theme.hoverBg, borderRadius: '8px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', color: theme.textSecondary }}>Type</label>
                                    <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', color: theme.text }}>{selectedPolicy.type}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: theme.textSecondary }}>Years</label>
                                    <select
                                        value={selectedYears}
                                        onChange={(e) => setSelectedYears(parseInt(e.target.value))}
                                        style={{
                                            display: 'block', width: '100%', padding: '6px', borderRadius: '4px', border: `1px solid ${theme.border}`,
                                            backgroundColor: theme.bg, color: theme.text, outline: 'none', marginTop: '4px'
                                        }}
                                    >
                                        {[1, 2, 3, 4, 5].map(year => (
                                            <option key={year} value={year}>{year} Year{year > 1 ? 's' : ''}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: theme.textSecondary }}>Coverage</label>
                                    <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', color: theme.text }}>{selectedPolicy.coverage}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: theme.textSecondary }}>Total Premium</label>
                                    <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', color: theme.accent, fontSize: '18px' }}>
                                        ₹{(selectedPolicy.premium * selectedYears).toLocaleString()}
                                    </p>
                                    <small style={{ fontSize: '10px', color: theme.textSecondary }}>₹{selectedPolicy.premium.toLocaleString()} / year</small>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '25px', color: theme.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                            <p>Get comprehensive protection with {selectedPolicy.name}. This policy covers you for {selectedPolicy.tenure} with a coverage of {selectedPolicy.coverage}. Secure your peace of mind today.</p>
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button onClick={() => setShowModal(false)} style={{
                                flex: 1, padding: '12px', backgroundColor: 'transparent', color: theme.textSecondary,
                                border: `1px solid ${theme.border}`, borderRadius: '6px', cursor: 'pointer', fontWeight: '500'
                            }}>
                                Cancel
                            </button>
                            <button onClick={handleBuyPolicy} style={{
                                flex: 2, padding: '12px', backgroundColor: theme.success, color: 'white',
                                border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '16px'
                            }}>
                                Buy Policy Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100
                }} onClick={() => setShowSuccessModal(false)}>
                    <div style={{
                        backgroundColor: theme.cardBg, padding: '30px', borderRadius: '12px', width: '400px', maxWidth: '90%',
                        border: `1px solid ${theme.border}`, textAlign: 'center'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(46, 204, 113, 0.2)',
                            color: theme.success, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '30px', margin: '0 auto 20px auto'
                        }}>✓</div>
                        <h2 style={{ color: theme.text, marginBottom: '10px' }}>Policy Purchased!</h2>
                        <p style={{ color: theme.textSecondary, marginBottom: '25px' }}>
                            You have successfully purchased <strong>{selectedPolicy?.name}</strong>. The policy details have been sent to your email.
                        </p>
                        <button onClick={() => setShowSuccessModal(false)} style={{
                            width: '100%', padding: '12px', backgroundColor: theme.accent, color: 'white',
                            border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer'
                        }}>Done</button>
                    </div>
                </div>
            )}

            <ChatWidget />
        </div>
    );
};

export default InsurancePage;
