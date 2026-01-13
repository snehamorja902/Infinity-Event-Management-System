# 🎉 Infinity Event Management System

Infinity Event Management System is a full-stack web application designed to simplify event planning and management. It provides a seamless experience for users to explore events, make bookings, and manage requests, while offering a dedicated admin dashboard for system control and approvals.

---

## 🚀 Features

### 👤 User Module
- User registration & login
- Browse events and services
- Event booking and customization
- Budget and guest management
- Profile management

### 🛠️ Admin (SuperAdmin) Module
- Secure admin dashboard access
- Manage users and event requests
- Approve or reject bookings
- Monitor system activities
- Data management and analytics

> 🔐 Note: SuperAdmin has access **only to the Admin Dashboard**. User pages are restricted.

---

## 🧑‍💻 Tech Stack

### Frontend
- React.js
- HTML5, CSS3
- JavaScript
- Axios

### Backend
- Django
- Django REST Framework
- JWT Authentication

### Database
- SQLite (Development)
- PostgreSQL (Production ready)

---

## 📁 Project Structure

Infinity-Event-Management-System/
│
├── backend/ # Django backend
│ ├── manage.py
│ └── event_system/
│
├── frontend/ # React frontend
│ ├── src/
│ └── package.json
│
├── .gitignore
├── README.md
├── LICENSE



---

## ⚙️ Installation & Setup

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
---

## 👩‍💻 Author

Sneha Morja
GitHub: snehamorja902