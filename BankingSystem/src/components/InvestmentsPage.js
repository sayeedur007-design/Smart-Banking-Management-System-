import React, { useState, useEffect, useMemo } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import ChatWidget from './ChatWidget';
import api from '../services/api';

const CandleStick = (props) => {
    const { x, y, width, height, payload } = props;

    if (!payload || !payload.high || !payload.low || !payload.open || !payload.close) {
        return null;
    }

    const isGreen = payload.close >= payload.open;
    const high = payload.high;
    const low = payload.low;
    const open = payload.open;
    const close = payload.close;

    // Calculate positions
    const range = high - low;
    const bodyTop = Math.min(open, close);
    // const bodyBottom = Math.max(open, close); // Unused
    const bodyHeight = Math.abs(close - open);

    // Scale to pixel coordinates
    const pixelPerUnit = height / range;
    const wickY = y;
    const wickHeight = height;
    const bodyPixelY = y + (high - bodyTop) * pixelPerUnit;
    const bodyPixelHeight = bodyHeight * pixelPerUnit || 1;

    const color = isGreen ? '#26a69a' : '#ef5350';

    return (
        <g>
            {/* Wick (High-Low line) */}
            <line
                x1={x + width / 2}
                y1={wickY}
                x2={x + width / 2}
                y2={wickY + wickHeight}
                stroke={color}
                strokeWidth={1}
            />
            {/* Body (Open-Close box) */}
            <rect
                x={x + 1}
                y={bodyPixelY}
                width={width - 2}
                height={bodyPixelHeight}
                fill={color}
                stroke={color}
                strokeWidth={1}
            />
        </g>
    );
};

const InvestmentsPage = () => {
    // const { darkMode } = useTheme();
    const darkMode = true; // Always dark theme
    const toast = useToast();
    const [selectedCompany, setSelectedCompany] = useState(0);
    const [chartData, setChartData] = useState([]);
    const [chartType, setChartType] = useState('candle'); // Added chartType state
    const [showInvestModal, setShowInvestModal] = useState(false); // State for invest modal
    const [investAmount, setInvestAmount] = useState(''); // State for investment amount
    const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success modal
    const [lastInvestment, setLastInvestment] = useState(null); // State for last investment details

    const theme = {
        bg: darkMode ? '#0a1929' : '#f5f7fa',
        headerBg: darkMode ? '#0d1f2d' : '#ffffff',
        sidebarBg: darkMode ? '#0d1f2d' : '#ffffff',
        text: darkMode ? '#d1d4dc' : '#2d3748',
        textSecondary: darkMode ? '#8899aa' : '#718096',
        border: darkMode ? '#1a3a52' : '#e2e8f0',
        cardBg: darkMode ? '#0d1f2d' : '#ffffff',
        hoverBg: darkMode ? '#1a3a52' : '#edf2f7',
        activeBg: darkMode ? '#1a3a52' : '#e2e8f0',
        inputBg: darkMode ? '#0a1929' : '#edf2f7',
        chartGrid: darkMode ? '#1a3a52' : '#e2e8f0',
        tooltipBg: darkMode ? '#0d1f2d' : '#ffffff',
        tooltipText: darkMode ? '#d1d4dc' : '#2d3748',
        heading: darkMode ? '#ffffff' : '#1a202c'
    };

    const topCompanies = useMemo(() => [
        {
            id: 1, name: 'Reliance Industries', symbol: 'RELIANCE', price: 2450.00, change: 1.2, marketCap: '16.5T',
            history: [
                { year: 2021, growth: 15.4 }, { year: 2022, growth: 8.2 }, { year: 2023, growth: 12.1 }, { year: 2024, growth: -2.5 }, { year: 2025, growth: 18.6 }
            ]
        },
        {
            id: 2, name: 'Tata Consultancy Services', symbol: 'TCS', price: 3450.00, change: -0.5, marketCap: '12.8T',
            history: [
                { year: 2021, growth: 22.1 }, { year: 2022, growth: 14.5 }, { year: 2023, growth: -5.2 }, { year: 2024, growth: 9.8 }, { year: 2025, growth: 11.2 }
            ]
        },
        {
            id: 3, name: 'HDFC Bank', symbol: 'HDFCBANK', price: 1650.00, change: 0.8, marketCap: '9.2T',
            history: [
                { year: 2021, growth: 10.5 }, { year: 2022, growth: 12.8 }, { year: 2023, growth: 15.4 }, { year: 2024, growth: 8.9 }, { year: 2025, growth: 13.5 }
            ]
        },
        {
            id: 4, name: 'Infosys', symbol: 'INFY', price: 1450.00, change: 1.5, marketCap: '6.1T',
            history: [
                { year: 2021, growth: 18.2 }, { year: 2022, growth: 9.5 }, { year: 2023, growth: -3.8 }, { year: 2024, growth: 14.2 }, { year: 2025, growth: 7.6 }
            ]
        },
        {
            id: 5, name: 'ICICI Bank', symbol: 'ICICIBANK', price: 950.00, change: 2.1, marketCap: '6.6T',
            history: [
                { year: 2021, growth: 25.4 }, { year: 2022, growth: 18.6 }, { year: 2023, growth: 22.1 }, { year: 2024, growth: 15.4 }, { year: 2025, growth: 20.8 }
            ]
        },
        {
            id: 6, name: 'Hindustan Unilever', symbol: 'HINDUNILVR', price: 2550.00, change: -0.2, marketCap: '6.0T',
            history: [
                { year: 2021, growth: 5.2 }, { year: 2022, growth: 4.8 }, { year: 2023, growth: 6.5 }, { year: 2024, growth: 3.2 }, { year: 2025, growth: 7.1 }
            ]
        },
        {
            id: 7, name: 'State Bank of India', symbol: 'SBIN', price: 580.00, change: 1.1, marketCap: '5.2T',
            history: [
                { year: 2021, growth: 30.5 }, { year: 2022, growth: 25.2 }, { year: 2023, growth: 18.4 }, { year: 2024, growth: 12.6 }, { year: 2025, growth: 15.8 }
            ]
        },
        {
            id: 8, name: 'Bharti Airtel', symbol: 'BHARTIARTL', price: 850.00, change: 0.9, marketCap: '4.8T',
            history: [
                { year: 2021, growth: -8.5 }, { year: 2022, growth: 12.4 }, { year: 2023, growth: 28.5 }, { year: 2024, growth: 18.2 }, { year: 2025, growth: 22.5 }
            ]
        },
        {
            id: 9, name: 'ITC', symbol: 'ITC', price: 450.00, change: 0.5, marketCap: '5.6T',
            history: [
                { year: 2021, growth: 2.5 }, { year: 2022, growth: 15.6 }, { year: 2023, growth: 35.4 }, { year: 2024, growth: 28.2 }, { year: 2025, growth: 12.5 }
            ]
        },
        {
            id: 10, name: 'Kotak Mahindra Bank', symbol: 'KOTAKBANK', price: 1850.00, change: -0.8, marketCap: '3.7T',
            history: [
                { year: 2021, growth: 8.5 }, { year: 2022, growth: 6.2 }, { year: 2023, growth: 4.8 }, { year: 2024, growth: -1.2 }, { year: 2025, growth: 5.4 }
            ]
        },
    ], []);

    useEffect(() => {
        // Generate more realistic OHLC data with trends
        const generateData = () => {
            const data = [];
            let basePrice = topCompanies[selectedCompany].price;
            let trend = 0;

            for (let i = 0; i < 60; i++) {
                // Add trend component for more realistic movement
                trend = trend * 0.95 + (Math.random() - 0.5) * 0.3;

                const open = basePrice;
                const volatility = basePrice * 0.015; // Reduced volatility for stability
                const trendEffect = trend * volatility;
                const randomEffect = (Math.random() - 0.5) * volatility * 0.5;
                const close = open + trendEffect + randomEffect;

                // High and low with realistic spreads
                const spreadHigh = Math.random() * volatility * 0.4;
                const spreadLow = Math.random() * volatility * 0.4;
                const high = Math.max(open, close) + spreadHigh;
                const low = Math.min(open, close) - spreadLow;

                const volume = Math.floor(Math.random() * 500000) + 300000;

                data.push({
                    time: i,
                    open: parseFloat(open.toFixed(2)),
                    close: parseFloat(close.toFixed(2)),
                    high: parseFloat(high.toFixed(2)),
                    low: parseFloat(low.toFixed(2)),
                    volume,
                    price: parseFloat(close.toFixed(2)) // For trend line
                });

                basePrice = close;
            }
            return data;
        };

        setChartData(generateData());

        // Update data in real-time with more stable movements
        const interval = setInterval(() => {
            setChartData(prevData => {
                if (prevData.length === 0) return prevData;

                const newData = [...prevData.slice(1)];
                const lastCandle = prevData[prevData.length - 1];
                const basePrice = lastCandle.close;
                const volatility = basePrice * 0.015;

                // More controlled movement
                const open = basePrice;
                const priceChange = (Math.random() - 0.5) * volatility * 0.6;
                const close = open + priceChange;

                const spreadHigh = Math.random() * volatility * 0.3;
                const spreadLow = Math.random() * volatility * 0.3;
                const high = Math.max(open, close) + spreadHigh;
                const low = Math.min(open, close) - spreadLow;

                const volume = Math.floor(Math.random() * 500000) + 300000;

                newData.push({
                    time: lastCandle.time + 1,
                    open: parseFloat(open.toFixed(2)),
                    close: parseFloat(close.toFixed(2)),
                    high: parseFloat(high.toFixed(2)),
                    low: parseFloat(low.toFixed(2)),
                    volume,
                    price: parseFloat(close.toFixed(2))
                });

                return newData;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [selectedCompany, topCompanies]);

    const handleInvest = async (e) => {
        e.preventDefault();
        try {
            await api.post('/services/investments', {
                name: topCompanies[selectedCompany].name,
                type: 'Stock', // Defaulting to Stock
                amount: parseFloat(investAmount)
            });

            // Calculate profit (12% estimation)
            const amount = parseFloat(investAmount);
            setLastInvestment({
                amount: amount,
                company: topCompanies[selectedCompany].name,
                profit: amount * 0.12
            });

            setShowInvestModal(false);
            setInvestAmount('');
            setShowSuccessModal(true);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to invest');
        }
    };

    const currentCompany = topCompanies[selectedCompany];
    const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : currentCompany.price;
    const priceChange = chartData.length > 0 ? ((currentPrice - chartData[0].open) / chartData[0].open * 100) : currentCompany.change;

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
                padding: '12px 20px',
                borderBottom: `1px solid ${theme.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background-color 0.3s, border-color 0.3s'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '500', color: theme.heading, fontFamily: "'Algerain', serif", fontSize: '24px' }}>SN4 Stock Exchange</h2>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button
                            onClick={() => setChartType('candle')}
                            style={{
                                backgroundColor: chartType === 'candle' ? theme.activeBg : 'transparent',
                                border: `1px solid ${theme.border}`,
                                color: chartType === 'candle' ? '#64b5f6' : theme.textSecondary,
                                cursor: 'pointer',
                                fontSize: '13px',
                                padding: '6px 14px',
                                borderRadius: '4px',
                                fontWeight: '500'
                            }}>CANDLE</button>
                        <button
                            onClick={() => setChartType('line')}
                            style={{
                                backgroundColor: chartType === 'line' ? theme.activeBg : 'transparent',
                                border: `1px solid ${theme.border}`,
                                color: chartType === 'line' ? '#64b5f6' : theme.textSecondary,
                                cursor: 'pointer',
                                fontSize: '13px',
                                padding: '6px 14px',
                                borderRadius: '4px',
                                fontWeight: '500'
                            }}>LINE</button>
                    </div>
                </div>
                <button
                    onClick={() => window.close()}
                    style={{
                        backgroundColor: '#ef5350',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    Close
                </button>
            </div>

            <div style={{ display: 'flex', height: 'calc(100vh - 50px)' }}>
                {/* Left Sidebar - Company List */}
                <div style={{
                    width: '280px',
                    backgroundColor: theme.sidebarBg,
                    borderRight: `1px solid ${theme.border}`,
                    overflowY: 'auto',
                    transition: 'background-color 0.3s, border-color 0.3s'
                }}>
                    <div style={{ padding: '12px', borderBottom: `1px solid ${theme.border}` }}>
                        <input
                            type="text"
                            placeholder="Search stocks..."
                            style={{
                                width: '100%',
                                backgroundColor: theme.inputBg,
                                border: `1px solid ${theme.border}`,
                                borderRadius: '4px',
                                padding: '8px',
                                color: theme.text,
                                fontSize: '13px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    {topCompanies.map((company, index) => (
                        <div
                            key={company.id}
                            onClick={() => setSelectedCompany(index)}
                            style={{
                                padding: '12px 16px',
                                cursor: 'pointer',
                                backgroundColor: selectedCompany === index ? theme.activeBg : 'transparent',
                                borderLeft: selectedCompany === index ? '3px solid #64b5f6' : '3px solid transparent',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '13px',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (selectedCompany !== index) e.currentTarget.style.backgroundColor = theme.hoverBg;
                            }}
                            onMouseLeave={(e) => {
                                if (selectedCompany !== index) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: '500', marginBottom: '4px', color: theme.heading }}>{company.symbol}</div>
                                <div style={{ fontSize: '11px', color: theme.textSecondary }}>{company.name}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: '500', color: theme.heading }}>₹{company.price.toLocaleString()}</div>
                                <div style={{
                                    fontSize: '11px',
                                    color: company.change >= 0 ? '#26a69a' : '#ef5350',
                                    fontWeight: '500'
                                }}>
                                    {company.change >= 0 ? '+' : ''}{company.change}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Chart Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Chart Header */}
                    <div style={{
                        padding: '16px 20px',
                        borderBottom: `1px solid ${theme.border}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: theme.headerBg,
                        transition: 'background-color 0.3s, border-color 0.3s'
                    }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '500', color: theme.heading }}>{currentCompany.symbol}</h1>
                                <span style={{ fontSize: '12px', color: theme.textSecondary }}>{currentCompany.name}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '20px', marginTop: '8px', fontSize: '14px' }}>
                                <div>
                                    <span style={{ color: theme.textSecondary }}>Price: </span>
                                    <span style={{ fontWeight: '500', color: theme.heading }}>₹{currentPrice.toFixed(2)}</span>
                                </div>
                                <div>
                                    <span style={{ color: theme.textSecondary }}>Change: </span>
                                    <span style={{ color: priceChange >= 0 ? '#26a69a' : '#ef5350', fontWeight: '500' }}>
                                        {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                                    </span>
                                </div>
                                <div>
                                    <span style={{ color: theme.textSecondary }}>Market Cap: </span>
                                    <span style={{ color: theme.heading }}>₹{currentCompany.marketCap}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowInvestModal(true)}
                            style={{
                                backgroundColor: '#38a169',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '10px 24px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                boxShadow: '0 4px 6px rgba(56, 161, 105, 0.2)'
                            }}
                        >
                            Invest Now
                        </button>
                    </div>

                    {/* Candlestick Chart with Trend Line */}
                    <div style={{ flex: 1, padding: '20px', backgroundColor: theme.bg, transition: 'background-color 0.3s' }}>
                        <ResponsiveContainer width="100%" height="70%">
                            <ComposedChart data={chartData}>
                                <defs>
                                    <linearGradient id="trendLineGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#64b5f6" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#42a5f5" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} opacity={0.3} />
                                <XAxis
                                    dataKey="time"
                                    stroke={theme.textSecondary}
                                    tick={{ fill: theme.textSecondary, fontSize: 11 }}
                                    axisLine={{ stroke: theme.border }}
                                />
                                <YAxis
                                    domain={['dataMin - 30', 'dataMax + 30']}
                                    stroke={theme.textSecondary}
                                    tick={{ fill: theme.textSecondary, fontSize: 11 }}
                                    orientation="right"
                                    axisLine={{ stroke: theme.border }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: theme.tooltipBg,
                                        border: `1px solid ${theme.border}`,
                                        borderRadius: '6px',
                                        color: theme.tooltipText,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                    }}
                                    formatter={(value) => `₹${value.toFixed(2)}`}
                                    labelStyle={{ color: theme.textSecondary }}
                                />
                                {/* Candlesticks - conditionally render */}
                                {chartType === 'candle' && (
                                    <Bar
                                        dataKey="high"
                                        shape={<CandleStick />}
                                    />
                                )}
                                {/* Trend Line Overlay - conditionally render or adjust style */}
                                {(chartType === 'line' || chartType === 'candle') && (
                                    <Line
                                        type="monotone"
                                        dataKey="price"
                                        stroke="url(#trendLineGradient)"
                                        strokeWidth={chartType === 'line' ? 3 : 1.5} // Thicker line if line chart
                                        dot={false}
                                        activeDot={{ r: 6, fill: '#64b5f6', stroke: '#fff', strokeWidth: 2 }}
                                        opacity={chartType === 'candle' ? 0.3 : 1} // Faint line on candle chart
                                    />
                                )}
                            </ComposedChart>
                        </ResponsiveContainer>

                        {/* Volume Chart */}
                        <ResponsiveContainer width="100%" height="25%">
                            <ComposedChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} opacity={0.3} />
                                <XAxis
                                    dataKey="time"
                                    stroke={theme.textSecondary}
                                    tick={{ fill: theme.textSecondary, fontSize: 11 }}
                                    axisLine={{ stroke: theme.border }}
                                />
                                <YAxis
                                    stroke={theme.textSecondary}
                                    tick={{ fill: theme.textSecondary, fontSize: 11 }}
                                    orientation="right"
                                    axisLine={{ stroke: theme.border }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: theme.tooltipBg,
                                        border: `1px solid ${theme.border}`,
                                        borderRadius: '6px',
                                        color: theme.tooltipText,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                    }}
                                    labelStyle={{ color: theme.textSecondary }}
                                />
                                <Bar
                                    dataKey="volume"
                                    fill="#2196f3"
                                    opacity={0.7}
                                    radius={[4, 4, 0, 0]}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Performance History Section */}
                    <div style={{
                        padding: '24px',
                        borderTop: `1px solid ${theme.border}`,
                        backgroundColor: theme.bg
                    }}>
                        <h3 style={{ color: theme.heading, fontSize: '18px', marginBottom: '20px' }}>Performance History (Last 5 Years)</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
                            {currentCompany.history ? currentCompany.history.map((item, index) => (
                                <div key={index} style={{
                                    padding: '16px',
                                    backgroundColor: theme.cardBg,
                                    borderRadius: '8px',
                                    border: `1px solid ${theme.border}`,
                                    textAlign: 'center'
                                }}>
                                    <div style={{ color: theme.textSecondary, marginBottom: '8px', fontSize: '14px' }}>{item.year}</div>
                                    <div style={{
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        color: item.growth >= 0 ? '#38a169' : '#e53e3e'
                                    }}>
                                        {item.growth >= 0 ? '+' : ''}{item.growth}%
                                    </div>
                                </div>
                            )) : (
                                <p style={{ color: theme.textSecondary }}>History data not available.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Widget */}
            <ChatWidget />

            {/* Investment Modal */}
            {
                showInvestModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }} onClick={() => setShowInvestModal(false)}>
                        <div style={{
                            backgroundColor: theme.cardBg,
                            padding: '30px',
                            borderRadius: '12px',
                            width: '400px',
                            maxWidth: '90%',
                            border: `1px solid ${theme.border}`,
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                        }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h2 style={{ margin: 0, color: theme.heading, fontSize: '20px' }}>Invest in {currentCompany.name}</h2>
                                <button onClick={() => setShowInvestModal(false)} style={{ background: 'none', border: 'none', color: theme.textSecondary, fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                            </div>

                            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: theme.activeBg, borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                                    <span style={{ color: theme.textSecondary }}>Current Price:</span>
                                    <span style={{ color: theme.heading, fontWeight: '600' }}>₹{currentCompany.price.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                    <span style={{ color: theme.textSecondary }}>Market Cap:</span>
                                    <span style={{ color: theme.heading }}>₹{currentCompany.marketCap}</span>
                                </div>
                            </div>

                            <form onSubmit={handleInvest}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: theme.textSecondary, fontSize: '14px' }}>Amount to Invest (₹)</label>
                                    <input
                                        type="number"
                                        value={investAmount}
                                        onChange={(e) => setInvestAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        required
                                        min="100"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: `1px solid ${theme.border}`,
                                            backgroundColor: theme.inputBg,
                                            color: theme.text,
                                            fontSize: '16px',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <button type="submit" style={{
                                    width: '100%',
                                    padding: '14px',
                                    backgroundColor: '#38a169',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}>
                                    Confirm Investment
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
            {/* Success Modal */}
            {
                showSuccessModal && lastInvestment && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1100
                    }} onClick={() => setShowSuccessModal(false)}>
                        <div style={{
                            backgroundColor: theme.cardBg,
                            padding: '30px',
                            borderRadius: '12px',
                            width: '400px',
                            maxWidth: '90%',
                            border: `1px solid ${theme.border}`,
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                        }} onClick={e => e.stopPropagation()}>
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <div style={{
                                    width: '60px', height: '60px',
                                    borderRadius: '50%', backgroundColor: 'rgba(56, 161, 105, 0.1)',
                                    color: '#38a169', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: '30px', margin: '0 auto 15px'
                                }}>
                                    ✓
                                </div>
                                <h2 style={{ margin: 0, color: theme.heading, fontSize: '22px' }}>Investment Successful!</h2>
                            </div>

                            <div style={{ marginBottom: '25px', color: theme.text, textAlign: 'center', lineHeight: '1.5' }}>
                                <p style={{ margin: '0 0 10px' }}>
                                    You have successfully invested <strong style={{ color: theme.heading }}>₹{lastInvestment.amount}</strong> in <strong style={{ color: theme.heading }}>{lastInvestment.company}</strong>.
                                </p>
                                <div style={{
                                    marginTop: '15px', padding: '15px',
                                    backgroundColor: theme.activeBg, borderRadius: '8px',
                                    border: `1px solid ${theme.border}`
                                }}>
                                    <div style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '5px' }}>Estimated 1-Year Profit</div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#38a169' }}>
                                        +₹{lastInvestment.profit.toFixed(2)}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#38a169', fontWeight: '500' }}>
                                        (12% Returns)
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setShowSuccessModal(false)} style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#64b5f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}>
                                OK
                            </button>
                        </div>
                    </div>
                )
            }
            <ChatWidget />
        </div >
    );
};

export default InvestmentsPage;
