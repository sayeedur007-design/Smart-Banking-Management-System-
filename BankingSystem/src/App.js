import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Homepage from './components/Homepage';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import InvestmentsPage from './components/InvestmentsPage';
import SavingsPage from './components/SavingsPage';
import ChatPage from './components/ChatPage';
import LoansPage from './components/LoansPage';
import InsurancePage from './components/InsurancePage';
import './App.css';

import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/user-dashboard" element={<UserDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/investments" element={<InvestmentsPage />} />
                <Route path="/savings" element={<SavingsPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/loans" element={<LoansPage />} />
                <Route path="/insurance" element={<InsurancePage />} />
              </Routes>
            </div>
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;