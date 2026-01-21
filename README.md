# 🏨 Hostel Management System

## 📌 Overview

The **Hostel Management System** is a full-stack web application designed to simplify and automate hostel operations such as student management, room allocation, and complaint handling.
The system is built using **React with TypeScript** for the frontend and **Node.js with Express** for the backend, with **PostgreSQL (Neon)** as the database and **Prisma ORM** for database management.

## 🧑‍💻 Tech Stack

### Frontend

* React
* TypeScript
* CSS / Tailwind CSS *(if applicable)*

### Backend

* Node.js
* Express.js
* Prisma ORM

### Database

* PostgreSQL (Neon)

### Tools

* Prisma Studio
* VS Code
* Git & GitHub

## 📂 Folder Structure

```
app/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── services/
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   └── utils/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── config/
│   └── server.ts
│
└── README.md
```

## 🚀 Features

### Admin

* Manage students and hostel staff
* Room allocation and availability tracking
* View and manage hostel records
* Handle complaints and requests

### Students

* Login and profile management
* View room and hostel details
* Submit complaints or maintenance requests

## ⚙️ Setup & Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/hostel-management-system.git
cd app
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
DATABASE_URL="postgresql://username:password@neon-db-url/dbname"
```

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Start the backend server:

```bash
npm run dev
```

### 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

## 🗄️ Database Management

* Prisma is used as the ORM
* Neon provides serverless PostgreSQL
* Prisma schema is located in:

```
backend/prisma/schema.prisma
```

Open Prisma Studio:

```bash
npx prisma studio
```

## 🔐 Security

* Environment variables for sensitive data
* Role-based access control
* Secure API endpoints

## 📈 Future Enhancements

* Online fee payment system
* Email / notification integration
* Attendance tracking
* Mobile-friendly UI

## 🤝 Contributing

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Open a pull request

## 📄 License

This project is licensed under the **MIT License**.

## 👨‍💻 Author
GitHub: 05tanish

