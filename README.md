# StudyVault — Study Resource Sharing Platform

A full-stack web app for students to upload, share, and download study materials.

---

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + React Router
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcryptjs
- **File Upload**: Multer (local storage)

---

## Prerequisites

Make sure you have installed:
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally on port 27017)
- npm

---

## Setup & Run

### 1. Clone / Extract the project

```bash
cd study-platform
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Edit `.env` if needed (default works with local MongoDB):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/studyplatform
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

Start backend:
```bash
npm run dev
```

Backend runs on: http://localhost:5000

---

### 3. Setup Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

---

## Create Admin Account

1. Sign up normally at http://localhost:5173/signup
2. Open MongoDB Compass or mongosh
3. Run:
```js
use studyplatform
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```
4. Log out and log back in — Admin tab will appear in navbar

---

## Features

| Feature | Description |
|---|---|
| Signup / Login | JWT-based auth with bcrypt hashing |
| Upload Resources | PDF, notes, links with subject + tags |
| Browse & Search | Filter by subject, type, keyword |
| Pagination | 12 per page |
| Download | File download with counter |
| My Profile | View uploads, edit name/bio/password |
| Admin Dashboard | Stats, manage all resources & users |
| Hide/Show Resources | Admin can hide inappropriate files |
| Role Management | Admin can promote/demote users |

---

## Folder Structure

```
study-platform/
├── backend/         # Express API
│   ├── config/      # DB connection
│   ├── controllers/ # Business logic
│   ├── middleware/  # Auth + Upload
│   ├── models/      # Mongoose schemas
│   ├── routes/      # API routes
│   ├── uploads/     # Stored files
│   └── server.js
│
├── frontend/        # React app
│   └── src/
│       ├── api/     # Axios instance
│       ├── components/
│       ├── context/ # Auth context
│       └── pages/
│
└── README.md
```
