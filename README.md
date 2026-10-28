# LuminaStay

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

**Modern, Multi-Tenant Hostel & Student Housing Management Platform**

A production-ready SaaS solution that streamlines property administration, room allocations, student onboarding, billing, meal tracking, and complaint handling into a unified, role-based dashboard.

[Features](#-key-features) • [Tech Stack](#-technology-stack) • [Architecture](#-system-architecture) • [Getting Started](#-getting-started) • [Environment Config](#-environment-configuration) • [API Reference](#-api-endpoints)

</div>

---

## ⚡ Overview

**LuminaStay** replaces manual registers and fragmented spreadsheets with an automated, scalable hostel management system. Built with **Next.js 16 (App Router)** and **Express 5**, it provides dedicated workspaces for **Super Admins**, **Hostel Admins**, and **Residents (Students)** with granular permissions, automated fee management, and instant notifications.

---

## ✨ Key Features

| Role / Domain | Capabilities |
| :--- | :--- |
| 🌐 **Super Admin** | Multi-hostel onboarding, tenant analytics, system-wide metrics, global user oversight. |
| 🏢 **Hostel Admin** | Floor, room, and bed inventory management, automated monthly fee generation, cash/UPI reconciliation, student check-in/out, and profile update approvals. |
| 🎓 **Student Portal** | Bed & room view, Razorpay online fee payments with downloadable receipts, daily mess menu tracking, complaint filing with real-time updates. |
| 🎟️ **Complaints & Grievances** | Full lifecycle tracking (`OPEN` ➔ `IN_PROGRESS` ➔ `RESOLVED`) with threaded comments between admins and students. |
| 🍽️ **Mess & Food Management** | Daily meal schedule planner (Breakfast, Lunch, Dinner item configurations). |
| 📩 **Smart Invite System** | Token-based & email invite links with expiration to streamline tenant and staff onboarding. |
| 🔔 **Notification Center** | Broadcast and targeted in-app alerts with read receipts, plus automated email triggers via Resend. |
| 🔐 **Authentication & Security** | Google OAuth 2.0, JWT access/refresh token rotation stored in HTTP-only cookies, and role-based access control (RBAC). |

---

## 🛠️ Technology Stack

```
Frontend:   Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Shadcn UI · Zustand · TanStack Query
Backend:    Node.js · Express 5 · Prisma ORM 7 · Zod Validation · Helmet · Cookie-Parser
Database:   PostgreSQL (Neon Serverless)
Cache/Queue:Redis (Upstash / ioredis with in-memory resilient fallback)
Integrations:Razorpay (Payments & Webhooks) · Resend (Transactional Email) · Google OAuth 2.0
Docs:       Swagger / OpenAPI 3.0 (`/api/docs`)
```

---

## 🏗️ System Architecture

```
                      ┌─────────────────────────────────────────┐
                      │        Next.js 16 Client Portal         │
                      │  Admin · SuperAdmin · Student Dashboard │
                      └────────────────────┬────────────────────┘
                                           │
                                    REST API / HTTPS
                                           │
                      ┌────────────────────▼────────────────────┐
                      │             Express 5 API               │
                      │   JWT Auth · RBAC Middleware · Zod      │
                      └──────┬─────────────┬─────────────┬──────┘
                             │             │             │
              ┌──────────────▼───┐  ┌──────▼──────┐  ┌───▼─────────────┐
              │ PostgreSQL (Neon)│  │ Redis Cache │  │ External APIs   │
              │   Prisma ORM     │  │   Upstash   │  │ Razorpay/Resend │
              └──────────────────┘  └─────────────┘  └─────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `>= 18.x`
- **npm** `>= 9.x`
- **PostgreSQL** database (Local or hosted like Neon / Supabase)
- **Redis** instance (Optional: Upstash Redis or local, auto-falls back to mock in dev)

---

### 1. Clone & Setup

```bash
git clone https://github.com/05tanish/Hostel-Managment.git
cd Hostel-Managment
```

---

### 2. Backend Setup

```bash
cd hostel-backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database and service credentials

# Run database migrations & generate Prisma client
npx prisma generate
npx prisma db push

# Start the development server (runs on http://localhost:5003)
npm run dev
```

> **API Documentation**: Once running, access the interactive Swagger documentation at `http://localhost:5003/api/docs`.

---

### 3. Frontend Setup

```bash
cd ../hostel-frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local if custom URLs are required

# Start Next.js development server (runs on http://localhost:3000)
npm run dev
```

---

## 🔐 Environment Configuration

Templates are provided in `.env.example` in both directories. **Never commit actual credentials to source control.**

### Backend (`hostel-backend/.env`)

```ini
# Server
PORT=5003
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"

# Auth Secrets
JWT_SECRET="your_strong_jwt_access_secret"
JWT_REFRESH_SECRET="your_strong_jwt_refresh_secret"
JWT_EXPIRY="7d"

# OAuth & Services
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
RESEND_API_KEY="re_your_resend_api_key"
EMAIL_FROM="noreply@yourdomain.com"

# Payment Gateway
RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
RAZORPAY_WEBHOOK_SECRET="your_razorpay_webhook_secret"

# Cache
UPSTASH_REDIS_REST_URL="rediss://..."
UPSTASH_REDIS_REST_TOKEN="your_redis_token"
```

### Frontend (`hostel-frontend/.env.local`)

```ini
NEXT_PUBLIC_API_URL=http://localhost:5003/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_your_key_id"
```

---

## 📡 API Endpoints

Interactive Swagger UI available at `http://localhost:5003/api/docs`.

| Endpoint Group | Prefix | Description |
| :--- | :--- | :--- |
| **Authentication** | `/api/auth` | User login, registration, Google OAuth, token refresh, logout |
| **Super Admin** | `/api/super-admin` | Multi-hostel creation, tenant metrics, admin assignment |
| **Hostel Admin** | `/api/admin` | Room/bed allocations, fee generation, cash receipts, profile approvals |
| **Student** | `/api/user` | Personal profile, occupancy details, fee status, request profile edit |
| **Rooms & Beds** | `/api/rooms` | Room capacity, bed mapping, occupancy status |
| **Payments** | `/api/payment` | Razorpay order creation, payment verification, webhook listener |
| **Complaints** | `/api/complaint` | Issue filing, status progression, comment threads |
| **Food & Mess** | `/api/food` | Daily menu schedule (Breakfast, Lunch, Dinner) |
| **Notifications** | `/api/notification`| System announcements, user-specific notifications, read status |
| **Invites** | `/api/invite` | Role-based join invite generation & validation |


## 🛡️ Security Highlights

- **HTTP-Only Cookies**: Tokens are protected against XSS; client JavaScript cannot access sensitive auth tokens.
- **Role-Based Access Control**: Middleware verifies both global system role and hostel-level tenancy.
- **SQL Injection Prevention**: Parameterized queries enforced at the compiler level via Prisma ORM.
- **Security Headers**: Powered by Helmet for robust Content Security Policy and frame guard protections.
- **Resilient Fallback**: Redis connection includes an automated in-memory fallback to avoid application crashes in offline/dev environments.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 👨‍💻 Author

**Tanish Jain**
- GitHub: [@05tanish](https://github.com/05tanish)
- Repository: [Hostel-Managment](https://github.com/05tanish/Hostel-Managment)
