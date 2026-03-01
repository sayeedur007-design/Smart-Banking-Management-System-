# 🏦 Smart Banking Management System

A full-stack banking management system built to simulate modern digital banking operations including authentication, transactions, loan management, dashboards, and administrative controls.

This project demonstrates real-world backend architecture, frontend integration, REST API communication, and Docker-based containerized deployment.

---

## 🚀 Tech Stack

### Frontend
- React.js
- HTML5
- CSS3
- JavaScript

### Backend
- FastAPI (Python)
- RESTful APIs
- SQLite Database

### DevOps
- Docker
- Docker Compose

---

## 🎯 Core Features

### 👤 User Module
- Secure User Registration & Login
- Account Dashboard
- Balance Tracking
- Transaction History
- Loan Requests
- Savings & Investment Sections

### 🛠 Admin Module
- Admin Dashboard
- User Management
- Loan Approval / Rejection
- Account Blocking

### 💬 Additional Functionalities
- Chat System
- Context-Based State Management
- Modular Component Architecture
- API Integration Between Frontend & Backend

---

## 🗂 Project Structure

Smart-Banking-Management-System/

├── backend/              # FastAPI backend  
├── BankingSystem/        # React frontend  
├── ModernUI/             # Static UI prototype  
├── docker-compose.yml  
└── README.md  

---

## ⚙️ How To Run Locally

### 1️⃣ Backend Setup

cd backend  
python -m venv venv  
venv\Scripts\activate  
pip install -r requirements.txt  
uvicorn app.main:app --reload  

Backend runs on: http://127.0.0.1:8000  

---

### 2️⃣ Frontend Setup

cd BankingSystem  
npm install  
npm start  

Frontend runs on: http://localhost:3000  

---

## 🐳 Run With Docker

docker-compose up --build

---

## 🧠 What This Project Demonstrates

- Full-stack system design
- REST API development
- Frontend-backend communication
- Authentication handling
- Database modeling
- Containerized deployment
- Modular and scalable structure

---

## 📌 Future Improvements

- JWT-based authentication
- PostgreSQL integration
- Role-Based Access Control (RBAC)
- CI/CD integration
- Cloud deployment (AWS / Azure)

---

## 👤 Author

Sayeed  
Full Stack Developer | Python | React | AI/ML Enthusiast
