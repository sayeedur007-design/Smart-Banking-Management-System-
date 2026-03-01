import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import api from '../services/api';
import ChatWidget from './ChatWidget';

const Homepage = () => {
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [messageForm, setMessageForm] = useState({ email: '', message: '' });
  const { darkMode, toggleTheme } = useTheme();
  const toast = useToast();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/messages', messageForm);
      toast.success('Message sent successfully! Our team will get back to you soon.');
      setShowMessageModal(false);
      setMessageForm({ email: '', message: '' });
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Email not registered in our system. Please register first.');
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    }
  };

  return (
    <div className={`homepage ${darkMode ? 'dark-theme' : ''}`}>
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <img src="/sn4-logo.jpg" alt="SN4 Financial Group Logo" className="logo-image" />
          </div>
          <div className="nav-menu">
            <a href="#home" className="nav-link">Home</a>
            <a href="#services" className="nav-link">Services</a>
            <a href="#offers" className="nav-link">Offers</a>
            <a href="#security" className="nav-link">Security</a>
            <a href="#contact" className="nav-link">Contact</a>
          </div>
          <div className="nav-buttons">
            <button className="btn-register" onClick={() => setShowRegister(true)}>Register</button>
            <div className="login-dropdown">
              <button className="btn-login" onClick={() => setShowLoginDropdown(!showLoginDropdown)}>
                Login <i className="fas fa-chevron-down"></i>
              </button>
              {showLoginDropdown && (
                <div className="login-dropdown-content">
                  <a href="#!" onClick={() => { setShowUserLogin(true); setShowLoginDropdown(false); }}>
                    <i className="fas fa-user"></i> User Login
                  </a>
                  <a href="#!" onClick={() => { setShowAdminLogin(true); setShowLoginDropdown(false); }}>
                    <i className="fas fa-user-shield"></i> Admin Login
                  </a>
                </div>
              )}
            </div>
            {/* <button className="btn-theme-toggle" onClick={toggleTheme} title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </button> */}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1>Banking Made <span className="highlight">Simple</span></h1>
            <p>Experience seamless digital banking with instant payments, secure transactions, and 24/7 customer support. Your financial partner for life.</p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => setShowRegister(true)}>Open Account</button>
              <button className="btn-secondary" onClick={() => setShowTermsModal(true)}>Learn More</button>
            </div>
          </div>
          <div className="hero-image">
            <img src="/sn4-logo.jpg" alt="SN4 Logo" className="hero-logo-image" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            {[{
              icon: 'fa-credit-card', title: 'Digital Payments', desc: 'Send money instantly to anyone, anywhere with our secure payment system'
            }, {
              icon: 'fa-wallet', title: 'Digital Wallet', desc: 'Store money securely and make quick payments with our digital wallet'
            }, {
              icon: 'fa-piggy-bank', title: 'Savings Account', desc: 'Earn high interest on your savings with zero balance requirements'
            }, {
              icon: 'fa-car', title: 'FASTag', desc: 'Skip toll queues with our convenient FASTag recharge service'
            }, {
              icon: 'fa-mobile', title: 'Mobile Recharge', desc: 'Recharge your mobile, DTH, and data cards instantly'
            }, {
              icon: 'fa-shield-alt', title: 'Insurance', desc: 'Protect yourself and your family with our comprehensive insurance plans'
            }].map((service, index) => (
              <div key={index} className="service-card">
                <i className={`fas ${service.icon}`}></i>
                <p className="heading">{service.title}</p>
                <p>{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose">
        <div className="container">
          <h2 className="section-title">Why Choose SN4?</h2>
          <div className="features-grid">
            {[{
              icon: 'fa-clock', title: '24/7 Banking', desc: 'Bank anytime, anywhere with our round-the-clock digital services'
            }, {
              icon: 'fa-lock', title: 'Bank-Grade Security', desc: 'Your money and data are protected with military-grade encryption'
            }, {
              icon: 'fa-bolt', title: 'Instant Transfers', desc: 'Send and receive money instantly with our UPI-enabled platform'
            }, {
              icon: 'fa-percentage', title: 'Zero Hidden Fees', desc: 'Transparent pricing with no hidden charges'
            }].map((feature, index) => (
              <div key={index} className="feature-item">
                <i className={`fas ${feature.icon}`}></i>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section id="offers" className="offers">
        <div className="container">
          <h2 className="section-title">Special Offers</h2>
          <div id="offersCarousel" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-indicators">
              {[0, 1, 2, 3, 4].map((index) => (
                <button
                  key={index}
                  type="button"
                  data-bs-target="#offersCarousel"
                  data-bs-slide-to={index}
                  className={index === 0 ? "active" : ""}
                  aria-current={index === 0 ? "true" : "false"}
                  aria-label={`Slide ${index + 1}`}
                ></button>
              ))}
            </div>
            <div className="carousel-inner">
              {[{
                badge: 'New User', title: '₹100 Welcome Bonus', desc: 'Get ₹100 cashback on your first transaction of ₹500 or more', color: 'linear-gradient(135deg, #e53e3e, #c53030)'
              }, {
                badge: 'Limited Time', title: '5% Cashback', desc: 'Earn 5% cashback on mobile recharges and bill payments', color: 'linear-gradient(135deg, #3182ce, #2b6cb0)'
              }, {
                badge: 'Exclusive', title: 'Free FASTag', desc: 'Get your FASTag for free with zero issuance charges', color: 'linear-gradient(135deg, #38a169, #2f855a)'
              }, {
                badge: 'Premium', title: 'Zero Balance Account', desc: 'Open a premium savings account with zero minimum balance requirement', color: 'linear-gradient(135deg, #805ad5, #6b46c1)'
              }, {
                badge: 'Referral', title: 'Refer & Earn ₹500', desc: 'Invite friends to SN4 Bank and earn ₹500 for every successful referral', color: 'linear-gradient(135deg, #d69e2e, #b7791f)'
              }].map((offer, index) => (
                <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                  <div className="offer-card" style={{ background: offer.color }}>
                    <div className="offer-badge">{offer.badge}</div>
                    <h3>{offer.title}</h3>
                    <p>{offer.desc}</p>
                    <button
                      className="btn-offer"
                      onClick={() => {
                        const isLoggedIn = localStorage.getItem('token');
                        if (isLoggedIn) {
                          toast.success('Offer Claimed Successfully!');
                        } else {
                          setShowUserLogin(true);
                        }
                      }}
                    >
                      Claim Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target="#offersCarousel" data-bs-slide="prev">
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#offersCarousel" data-bs-slide="next">
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="security">
        <div className="container">
          <div className="security-content">
            <div className="security-text">
              <h2>Your Security is Our Priority</h2>
              <div className="security-features">
                {[{
                  icon: 'fa-shield-alt', title: '256-bit SSL Encryption', desc: 'All your data is encrypted with bank-grade security protocols'
                }, {
                  icon: 'fa-fingerprint', title: 'Biometric Authentication', desc: 'Secure login with fingerprint and face recognition technology'
                }, {
                  icon: 'fa-bell', title: 'Real-time Alerts', desc: 'Instant notifications for all your account activities'
                }].map((item, index) => (
                  <div key={index} className="security-item">
                    <i className={`fas ${item.icon}`}></i>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="security-image">
              <i className="fas fa-user-shield"></i>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="services" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <div className="container">
          <h2 className="section-title">Get in Touch</h2>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center',
            background: 'var(--card-bg)',
            padding: '40px',
            borderRadius: '15px',
            boxShadow: '0 5px 20px var(--shadow-sm)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '30px',
              marginBottom: '30px'
            }}>
              <div>
                <i className="fas fa-phone" style={{ fontSize: '2rem', color: 'var(--accent-color)', marginBottom: '10px' }}></i>
                <h4 style={{ color: 'var(--text-heading)', marginBottom: '8px' }}>Phone</h4>
                <p style={{ color: 'var(--text-secondary)' }}>1800-123-4567</p>
              </div>
              <div>
                <i className="fas fa-envelope" style={{ fontSize: '2rem', color: 'var(--accent-color)', marginBottom: '10px' }}></i>
                <h4 style={{ color: 'var(--text-heading)', marginBottom: '8px' }}>Email</h4>
                <p style={{ color: 'var(--text-secondary)' }}>support@sn4bank.com</p>
              </div>
              <div>
                <i className="fas fa-map-marker-alt" style={{ fontSize: '2rem', color: 'var(--accent-color)', marginBottom: '10px' }}></i>
                <h4 style={{ color: 'var(--text-heading)', marginBottom: '8px' }}>Address</h4>
                <p style={{ color: 'var(--text-secondary)' }}>Hyderabad, Telangana</p>
              </div>
            </div>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1.1rem',
              marginBottom: '20px'
            }}>
              Have questions? Our customer support team is available 24/7 to assist you.
            </p>
            <button
              className="btn-primary"
              onClick={() => window.open(`${window.location.origin}/chat`, '_blank')}
              style={{ marginTop: '10px' }}
            >
              Send us a Message
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            {[{
              title: 'About SN4', links: ['About Us', 'Careers', 'Press', 'Investor Relations']
            }, {
              title: 'Services', links: ['Savings Account', 'Digital Payments', 'Mobile Banking', 'Insurance']
            }, {
              title: 'Support', links: ['Help Center', 'Contact Us', 'Security', 'Report Fraud']
            }, {
              title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Compliance']
            }].map((section, index) => (
              <div key={index} className="footer-section">
                <h3>{section.title}</h3>
                <ul>
                  {section.links.map((link, i) => (
                    <li key={i}><a href="#!">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 SN4. All rights reserved. | Licensed by RBI</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showUserLogin && (
        <LoginModal
          type="user"
          onClose={() => setShowUserLogin(false)}
          onSwitchToRegister={() => {
            setShowUserLogin(false);
            setShowRegister(true);
          }}
        />
      )}
      {showAdminLogin && <LoginModal type="admin" onClose={() => setShowAdminLogin(false)} />}
      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="modal" onClick={() => setShowMessageModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setShowMessageModal(false)}>&times;</span>
            <div className="form-header">
              <i className="fas fa-envelope"></i>
              <h2>Send us a Message</h2>
              <p>We'll get back to you within 24 hours</p>
            </div>
            <form onSubmit={handleSendMessage}>
              <div className="form-group">
                <label>Registered Email</label>
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={messageForm.email}
                  onChange={(e) => setMessageForm({ ...messageForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  placeholder="Type your message here..."
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                  rows="6"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                ></textarea>
              </div>
              <button type="submit" className="btn-submit">Send Message</button>
            </form>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="modal" onClick={() => setShowTermsModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '700px',
              background: darkMode ? '#1a1f2e' : '#fff',
              color: darkMode ? '#e8e8e8' : '#333',
              border: darkMode ? '1px solid #2d3748' : 'none'
            }}
          >
            <span className="close" onClick={() => setShowTermsModal(false)}>&times;</span>
            <div className="form-header">
              <i className="fas fa-university" style={{ color: darkMode ? '#ff6b6b' : '#e53e3e' }}></i>
              <h2 style={{ color: darkMode ? '#fff' : '#333' }}>About SN4 Bank</h2>
              <p style={{ color: darkMode ? '#b8b8b8' : '#666' }}>Your Trusted Financial Partner</p>
            </div>

            <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '20px' }}>
              {/* Bank Description */}
              <section style={{ marginBottom: '30px' }}>
                <h3 style={{ color: darkMode ? '#ff6b6b' : '#e53e3e', marginBottom: '15px' }}>Who We Are</h3>
                <p style={{ lineHeight: '1.8', color: darkMode ? '#b8b8b8' : '#666' }}>
                  SN4 Bank is a leading digital banking platform committed to providing innovative financial solutions
                  to our customers. Founded with a vision to make banking simple, secure, and accessible, we leverage
                  cutting-edge technology to deliver seamless banking experiences.
                </p>
                <p style={{ lineHeight: '1.8', color: darkMode ? '#b8b8b8' : '#666', marginTop: '10px' }}>
                  Headquartered in Hyderabad, Telangana, we serve millions of customers across India with our comprehensive
                  suite of banking services including savings accounts, investments, insurance, and digital payments.
                </p>
              </section>

              {/* Our Services */}
              <section style={{ marginBottom: '30px' }}>
                <h3 style={{ color: darkMode ? '#ff6b6b' : '#e53e3e', marginBottom: '15px' }}>Our Services</h3>
                <ul style={{ lineHeight: '2', color: darkMode ? '#b8b8b8' : '#666', paddingLeft: '20px' }}>
                  <li>Zero Balance Savings Accounts</li>
                  <li>Instant Digital Payments & UPI</li>
                  <li>Investment in Mutual Funds, Stocks & FDs</li>
                  <li>Comprehensive Insurance Solutions</li>
                  <li>FASTag & Mobile Recharge</li>
                  <li>24/7 Customer Support</li>
                </ul>
              </section>

              {/* Terms & Conditions */}
              <section>
                <h3 style={{ color: 'var(--accent-color)', marginBottom: '15px' }}>Terms & Conditions</h3>

                <div style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  <h4 style={{ marginTop: '15px', marginBottom: '10px', fontSize: '1rem' }}>1. Account Usage</h4>
                  <p>By opening an account with SN4 Bank, you agree to use your account for lawful purposes only.
                    Any fraudulent activity will result in immediate account suspension and legal action.</p>

                  <h4 style={{ marginTop: '15px', marginBottom: '10px', fontSize: '1rem' }}>2. Security & Privacy</h4>
                  <p>We employ bank-grade 256-bit SSL encryption to protect your data. You are responsible for
                    maintaining the confidentiality of your login credentials and must notify us immediately of any
                    unauthorized access.</p>

                  <h4 style={{ marginTop: '15px', marginBottom: '10px', fontSize: '1rem' }}>3. Transaction Limits</h4>
                  <p>Daily transaction limits apply as per RBI guidelines. For higher limits, please contact our
                    customer support or visit your nearest branch.</p>

                  <h4 style={{ marginTop: '15px', marginBottom: '10px', fontSize: '1rem' }}>4. Fees & Charges</h4>
                  <p>SN4 Bank operates with transparent pricing. Zero hidden charges. Service fees, if applicable,
                    will be clearly communicated before any transaction.</p>

                  <h4 style={{ marginTop: '15px', marginBottom: '10px', fontSize: '1rem' }}>5. Dispute Resolution</h4>
                  <p>In case of any disputes, please contact our customer support at support@sn4bank.com or
                    call 1800-123-4567. All disputes are subject to Hyderabad jurisdiction.</p>

                  <h4 style={{ marginTop: '15px', marginBottom: '10px', fontSize: '1rem' }}>6. Regulatory Compliance</h4>
                  <p>SN4 Bank is licensed and regulated by the Reserve Bank of India (RBI). We comply with all
                    KYC and AML regulations as mandated by Indian banking laws.</p>
                </div>
              </section>

              {/* Contact Information */}
              <section style={{
                marginTop: '30px',
                padding: '20px',
                background: darkMode ? '#0d1419' : '#f7fafc',
                borderRadius: '8px',
                border: darkMode ? '1px solid #2d3748' : 'none'
              }}>
                <h4 style={{ marginBottom: '10px', color: darkMode ? '#fff' : '#333' }}>Need Help?</h4>
                <p style={{ color: darkMode ? '#b8b8b8' : '#666', marginBottom: '10px' }}>
                  📧 Email: support@sn4bank.com<br />
                  📞 Phone: 1800-123-4567<br />
                  📍 Address: Hyderabad, Telangana
                </p>
              </section>
            </div>

            <div style={{
              padding: '20px',
              borderTop: darkMode ? '1px solid #2d3748' : '1px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <button className="btn-primary" onClick={() => setShowTermsModal(false)}>
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Widget for logged-in users */}
      {localStorage.getItem('token') && <ChatWidget />}
    </div>
  );
};

export default Homepage;