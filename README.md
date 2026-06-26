# 📦 Scrap Metal Management System

## 🎯 Project Overview

A **full‑stack web application** that showcases an AI‑integrated command center for a fictional scrap‑metal recycling company.  It provides:
- **User authentication** with role‑based access (Admin, Manager, Worker).
- **Dashboard** with real‑time statistics.
- **Inventory**, **Scrap Management**, **Sales**, **Workflow Tracking** and **User Management** modules.
- **AI image classification** (MobileNetV2 via TensorFlow.js) that predicts the type of metal from an uploaded photograph.
- **In‑memory MongoDB** for rapid prototyping, with an easy switch to a persistent MongoDB instance.

The UI follows a dark, industrial design language using **React 19**, **Tailwind‑CSS**, and animated micro‑interactions for a premium feel.

---

## Deployment Link

- Live Demo :- https://scrap-metal-system.onrender.com 

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite 8, Tailwind 3, Lucide‑React icons, Redux Toolkit |
| **Backend** | Node.js ≥ 20, Express, Mongoose, Multer, JWT, bcrypt |
| **Database** | MongoDB (default: in‑memory `MongoMemoryServer`; optional external MongoDB) |
| **AI** | TensorFlow.js, pretrained MobileNetV2 (client‑side) |
| **Styling** | Tailwind with custom utility classes (`form-input‑pl‑10`, `form-input‑pl‑9`) |

---

## 📦 Repository Layout

```
scrap-metal-system/
│
├─ backend/            # Express API
│   ├─ config/        # DB connection
│   ├─ controllers/   # Business logic and AI controller
│   ├─ middleware/    # Auth & upload handling
│   ├─ models/        # Mongoose schemas (User, Inventory, Scrap, Sale)
│   ├─ routes/        # API endpoints
│   ├─ uploads/       # Temporary storage for uploaded images
│   └─ server.js      # Entry point
│
├─ frontend/          # React + Vite app
│   ├─ src/           # Components, pages, Redux store, AI service
│   ├─ public/        # Static assets (place demo images here)
│   ├─ index.html
│   ├─ package.json
│   └─ vite.config.js
│
├─ .gitignore
└─ README.md          # <‑‑ THIS FILE
```

---

## 🚀 Getting Started

### 1️⃣ Prerequisites

| Tool | Minimum version | Install link |
|------|----------------|--------------|
| **Node.js** | 20.x | <https://nodejs.org> |
| **Git** (optional) | any | <https://git-scm.com> |
| **Visual Studio Code** (recommended) | any | <https://code.visualstudio.com> |
| **MongoDB** (optional, for persistence) | 5.x | <https://www.mongodb.com/try/download/community> |

Verify installation:
```powershell
node -v
npm -v
code --version   # VS Code (optional)
```

### 2️⃣ Clone / Open the project

If you already have the folder (it lives at `C:\Users\Dell\.gemini\scratch\scrap-metal-system`), simply open it in VS Code:
```powershell
code "C:\Users\Dell\.gemini\scratch\scrap-metal-system"
```

> **Tip:** You can also clone from a remote repo – the folder structure will be identical.

### 3️⃣ Install dependencies

Open **two integrated terminals** (``Ctrl+` ``) so you can run backend and frontend side‑by‑side.

#### Backend
```powershell
cd backend
npm install
```
#### Frontend
```powershell
cd ..\frontend
npm install
```

### 4️⃣ (Optional) Configure a real MongoDB

The server falls back to an in‑memory database, which is great for demos but **does not persist data** between restarts. To use a persistent MongoDB:
1. Start a MongoDB instance (local or Docker).
2. Create a `.env` file inside `backend/` (or set the variable in PowerShell) with the URI:
```text
# backend/.env
MONGODB_URI=mongodb://localhost:27017/scrapmetal
```
3. Restart the backend – you’ll see a log line like:
```
--- [DATABASE] Connected to mongodb://localhost:27017/scrapmetal ---
```

### 5️⃣ Run the application (development mode)

#### 5.1 Start the API
```powershell
# In the backend terminal
npx --yes kill-port 5000   # make sure the port is free
node server.js
```
You should see seeding messages and:
```
--- [SERVER ACTIVE] Running in development mode on Port: 5000 ---
API endpoints active: http://localhost:5000/api
```

#### 5.2 Start the front‑end UI
```powershell
# In the frontend terminal
npm run dev
```
Vite will launch and output:
```
  ➜  Local:   http://localhost:5173/
```
Open that URL in a browser.

### 6️⃣ Log in (demo accounts)
| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@scrap.com` | `Password123` |
| **Manager** | `manager@scrap.com` | `Password123` |
| **Worker** | `worker@scrap.com` | `Password123` |

The **Admin** can manage users; **Manager** can access sales; **Worker** can only view inventory/scrap.


---

## 🛠️ Troubleshooting & FAQ

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| **Port 5000 already in use** | Another process occupies the API port. | Run `npx --yes kill-port 5000` before `node server.js`. |
| **Image upload fails – “Only image files are allowed!”** | You selected a non‑image file or the MIME type is missing. | Choose a `.jpg`, `.jpeg`, or `.png` file. |
| **Tailwind styles not applying** | You forgot to run `npm install` or the dev server was started before the recent CSS utility changes. | Re‑run `npm install` in the frontend folder and restart `npm run dev`. |

---

## 📦 Inventory Management Page

The **Inventory** page lets admins view, add, edit, and delete metal stock entries. Each entry shows:
- Metal type (e.g., Steel, Aluminium, Copper)
- Quantity (kg)
- Location in the warehouse
- Timestamp of last update

Features:
- Search bar with fuzzy matching.
- Inline editing with validation (numeric only for quantity).
- Bulk delete via checkboxes.
- Responsive layout for desktop and tablets.

## 🛠️ UI Fixes & Improvements

- Fixed collapsing symbols in all text‑area inputs by adding custom Tailwind utilities `form-input-pl‑10` and `form-input-pl‑9` (see `frontend/src/index.css`).
- Updated all affected components (`Login.jsx`, `UserManagement.jsx`, `Inventory.jsx`, `SalesManagement.jsx`, `ScrapManagement.jsx`) to use the new padding classes, ensuring symbols no longer disappear when typing.

## 📂 MongoDB Configuration

The backend defaults to an **in‑memory MongoDB** (via `mongodb-memory-server`) which is great for demos but does **not persist data** after a restart. For production or persistent testing:
1. Install and start a MongoDB instance locally or via Docker.
2. Create a `.env` file in `backend/` with:
   ```text
   MONGODB_URI=mongodb://localhost:27017/scrapmetal
   ```
3. Restart the backend server to connect to the persistent database.

---

## 📄 License

This project is provided for **educational/demo purposes** only.  Feel free to fork, experiment, and adapt the code, but do not use it in production without proper security audits.

---

## 🙋 Contributing

1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/awesome‑thing`).
3. Make your changes, run the dev servers to verify.
4. Submit a Pull Request with a clear description of the change.

---

## 📞 Contact & Support

For questions, open an issue on the repository or reach out to the original author at `admin@scrap.com` (demo account).

---

