# SecureBank - React Banking Application

A complete banking application built with React.js featuring user and admin dashboards with Airtel Payments Bank inspired design.

## Features

### Homepage
- Professional banking homepage with hero section
- Services showcase (Digital Payments, Wallet, Savings, etc.)
- Special offers and security features
- Dual login system (User/Admin)
- Registration functionality

### User Dashboard
- Account balance overview
- Quick actions (Send Money, Recharge, Pay Bills, QR Pay)
- Banking services grid
- Recent transactions history
- Interactive modals for transactions

### Admin Dashboard
- Statistics overview with animated counters
- User management with add/edit/block functionality
- Transaction monitoring with filters
- Reports generation
- System settings configuration

## Tech Stack
- React 18
- React Router DOM
- Font Awesome Icons
- CSS3 with Flexbox/Grid
- Responsive Design

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view in browser.

## API Endpoints

### User Endpoints
- `POST /api/register` - User registration
- `POST /api/user/login` - User login
- `POST /api/transfer` - Money transfer
- `POST /api/recharge` - Mobile recharge
- `POST /api/bill-payment` - Bill payment

### Admin Endpoints
- `POST /api/admin/login` - Admin login
- `POST /api/admin/users` - Add new user
- `POST /api/admin/settings` - Save settings

## Project Structure
```
src/
├── components/
│   ├── Homepage.js
│   ├── LoginModal.js
│   ├── RegisterModal.js
│   ├── UserDashboard.js
│   └── AdminDashboard.js
├── App.js
├── App.css
└── index.js
```

## Design Features
- Airtel Payments Bank inspired design
- Red (#e53e3e) and white color scheme
- Soft peach gradient backgrounds
- Smooth animations and hover effects
- Mobile-first responsive design
- Professional banking portal appearance

## Security Features
- Role-based authentication
- Form validation
- Password show/hide toggle
- Admin verification code
- Session management with tokens