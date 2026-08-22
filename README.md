# 10PearlsMERN — Notes App

A full-stack **MERN** (MongoDB, Express, React, Node.js) notes application with
user accounts, JWT authentication, a rich-text notes editor, search, and
JSON export/import. This README is a complete manual: it explains what the
project does, how the two halves (backend/frontend) fit together, how to set
it up from scratch, and how to use every feature.

---

## Table of Contents

1. [What this project is](#1-what-this-project-is)
2. [Tech stack](#2-tech-stack)
3. [Project structure](#3-project-structure)
4. [Prerequisites](#4-prerequisites)
5. [Setup — step by step](#5-setup--step-by-step)
6. [Running the app](#6-running-the-app)
7. [Using the app (user guide)](#7-using-the-app-user-guide)
8. [Backend API reference](#8-backend-api-reference)
9. [Data models](#9-data-models)
10. [Security notes](#10-security-notes)
11. [Running the test suites](#11-running-the-test-suites)
12. [Troubleshooting](#12-troubleshooting)
13. [Deploying](#13-deploying)

---

## 1. What this project is

A simple, self-hosted **notes app**, similar in spirit to a lightweight
Evernote/Google Keep clone:

- Users create an account and log in.
- Each user has their own private list of notes (nobody else can see or edit them).
- Notes have a title and rich-text (formatted) content, edited with an
  in-browser WYSIWYG editor.
- Notes can be searched, created, edited, and deleted.
- The whole notes list can be exported to a `.json` file and re-imported later
  (handy as a manual backup, or to move notes between accounts).
- Users can update their profile (name/username) and change their password.

It is split into two independently run applications that talk to each other
over HTTP:

- **`Backend/`** — a Node.js/Express REST API, backed by MongoDB.
- **`frontend/`** — a React single-page app (built with Vite) that consumes that API.

---

## 2. Tech stack

**Backend**
| Purpose            | Library |
|---------------------|---------|
| Web server/routing  | Express 5 |
| Database            | MongoDB via Mongoose |
| Auth                | JSON Web Tokens (`jsonwebtoken`) + `bcryptjs` password hashing |
| Request validation  | Joi |
| HTML sanitization   | `sanitize-html` (cleans note content before saving) |
| Logging             | Pino (`pino`, `pino-http`, `pino-pretty`) |
| Security headers    | Helmet |
| Rate limiting       | `express-rate-limit` |
| Tests               | Mocha, Chai, Supertest, `mongodb-memory-server` |
| Coverage            | NYC |

**Frontend**
| Purpose            | Library |
|---------------------|---------|
| UI framework        | React 19 |
| Build tool/dev server| Vite |
| Routing             | React Router v7 |
| HTTP client         | Axios |
| Styling             | Tailwind CSS |
| Rich text editor    | `react-simple-wysiwyg` |
| Toast notifications | `react-hot-toast` |
| Confirm dialogs     | SweetAlert2 |
| Tests               | Jest + React Testing Library |

---

## 3. Project structure

```
10PearlsMERN/
├── Backend/
│   ├── index.js                  # App entry point: middleware, routes, server startup
│   ├── logger.js                 # Shared Pino logger instance
│   ├── Controllers/
│   │   ├── authController.js     # register/login/profile/change-password logic
│   │   └── noteController.js     # notes CRUD, search, export, import
│   ├── Middlewares/
│   │   ├── authMiddleware.js     # `protect` — verifies the JWT on protected routes
│   │   └── validate.js           # Joi-schema request validation middleware
│   ├── Models/
│   │   ├── User.js               # Mongoose User schema
│   │   └── Note.js                # Mongoose Note schema
│   ├── Routes/
│   │   ├── authRoutes.js         # /api/auth/* endpoints
│   │   └── noteRoutes.js         # /api/notes/* endpoints
│   ├── Schemas/
│   │   └── authSchemas.js        # Joi validation schemas for every request body
│   ├── tests/                    # Mocha/Supertest API tests
│   └── package.json
│
├── frontend/
│   ├── index.html                 # Vite HTML entry
│   ├── src/
│   │   ├── main.jsx                # Mounts <App/> into the DOM
│   │   ├── App.jsx                 # Route definitions
│   │   ├── ProtectedRoute.jsx      # Redirects to /login if not authenticated
│   │   ├── index.css               # Tailwind import
│   │   ├── Pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx       # Main notes screen (CRUD/search/export/import)
│   │   │   └── ProfilePage.jsx     # Edit profile / change password
│   │   └── tests/                  # Jest + Testing Library component tests
│   ├── vite.config.js
│   └── package.json
│
└── README.md                      # This file
```

---

## 4. Prerequisites

Install these before you start:

- **Node.js 18+** and **npm** (comes with Node) — [nodejs.org](https://nodejs.org)
- **MongoDB** — either:
  - a local MongoDB server ([Community Server](https://www.mongodb.com/try/download/community)), or
  - a free cloud cluster on [MongoDB Atlas](https://www.mongodb.com/atlas) (recommended if you don't want to install MongoDB locally)
- A terminal and a code editor (e.g. VS Code)

> The backend's automated tests do **not** need MongoDB installed — they spin
> up a temporary in-memory MongoDB instance automatically. You only need a
> real MongoDB connection to actually *run* the app.

---

## 5. Setup — step by step

### 5.1 Get the code

```bash
git clone <this-repo-url>
cd 10PearlsMERN
```

### 5.2 Configure the backend

Create a file named `.env` inside `Backend/` with the following content:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/notes_dev
JWT_SECRET=replace_with_a_long_random_secret
```

- `PORT` — port the API listens on (the frontend expects `5000` by default).
- `MONGO_URI` — your MongoDB connection string. For a local MongoDB install
  the value above is usually correct. For Atlas, copy the connection string
  from the Atlas dashboard (it looks like
  `mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/notes_dev`).
- `JWT_SECRET` — any long random string. This is used to sign login tokens —
  **never commit a real secret to source control**, and always set your own
  value (don't rely on the built-in fallback).

Install dependencies:

```bash
cd Backend
npm install
```

### 5.3 Configure the frontend

The frontend currently calls the backend at the hardcoded address
`http://localhost:5000` (see the `axios.get/post/put/delete` calls in
`frontend/src/Pages/*.jsx`), so no `.env` file is required for local
development as long as the backend runs on port 5000.

Install dependencies:

```bash
cd frontend
npm install
```

---

## 6. Running the app

You need **two terminals** running at the same time — one for the API, one
for the web app.

**Terminal 1 — backend (from `Backend/`):**
```bash
npm run dev      # starts on http://localhost:5000 with auto-restart (nodemon)
# or: npm start  # plain node, no auto-restart
```

You should see log lines like `MongoDB connected` and `Server running on port 5000`.

**Terminal 2 — frontend (from `frontend/`):**
```bash
npm run dev      # starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser. You should land on the Login page.

---

## 7. Using the app (user guide)

1. **Create an account** — click "Create one" on the login page, fill in
   first name, last name, username, email and password, and submit. You are
   automatically logged in afterwards.
2. **Log in** — enter your username and password. On success you're taken to
   the Dashboard.
3. **Create a note** — on the Dashboard, type a title, write formatted
   content in the editor box (bold, lists, links, etc. are supported), and
   click **Save Note**.
4. **Search notes** — type into the "Search notes..." box; the list filters
   live to notes whose title or content matches (case-insensitive).
5. **Edit a note** — click **Edit** on a note card, change the title/content,
   then **Save** (or **Cancel** to discard).
6. **Delete a note** — click **Delete** and confirm in the popup dialog.
7. **Export notes** — click **Export** to download all your notes as a
   `notes-export.json` file (a local backup).
8. **Import notes** — click **Import** and choose a previously exported (or
   hand-written) `.json` file containing an array of `{ "title", "content" }`
   objects; they're added to your account.
9. **Edit your profile** — go to the Profile page (linked from the app) to
   change your first/last name or username.
10. **Change your password** — on the same Profile page, enter your current
    password and a new one.
11. **Log out** — the app doesn't have a dedicated logout button; clearing
    the browser's localStorage (or using your browser's dev tools to remove
    the `token` key) ends the session. Reloading `/login` and logging in
    again also works.

---

## 8. Backend API reference

All endpoints are prefixed with `/api`. Protected endpoints require an
`Authorization` header carrying the JWT returned by register/login — either
`Authorization: Bearer <token>` or just `Authorization: <token>` (the backend
accepts both forms).

### Auth — `/api/auth`

| Method | Path              | Auth required | Body | Description |
|--------|-------------------|:---:|------|--------------|
| POST   | `/register`       | No  | `{ firstName, lastName, username, email, password }` | Create an account; returns a token + profile. |
| POST   | `/login`          | No  | `{ username, password }` (or `{ email, password }`) | Log in; returns a token + profile. |
| GET    | `/me`             | Yes | — | Get the logged-in user's profile. |
| PUT    | `/me`             | Yes | `{ firstName, lastName, username }` | Update the logged-in user's profile. |
| PUT    | `/me/password`    | Yes | `{ oldPassword, newPassword }` | Change the logged-in user's password. |

### Notes — `/api/notes`

| Method | Path              | Auth required | Body | Description |
|--------|-------------------|:---:|------|--------------|
| GET    | `/?q=term`        | Yes | — | List the current user's notes, newest first. `q` optionally filters by title/content substring. |
| POST   | `/`               | Yes | `{ title, content }` | Create a note. |
| PUT    | `/:id`            | Yes | `{ title, content }` | Update a note you own. |
| DELETE | `/:id`            | Yes | — | Delete a note you own. |
| GET    | `/export/json`    | Yes | — | Download all your notes as a JSON file. |
| POST   | `/import`         | Yes | `{ notes: [{ title, content }, ...] }` | Bulk-create notes (max 1000 per request). |

All error responses follow the shape `{ "message": "..." }`, and validation
failures additionally include `"details": [ "...", ... ]` describing each
invalid field.

---

## 9. Data models

**User** (`Backend/Models/User.js`)
```
firstName   String   required
lastName    String   required
username    String   required, unique
email       String   required, unique
password    String   required   (bcrypt hash, never plaintext)
createdAt / updatedAt   (automatic timestamps)
```

**Note** (`Backend/Models/Note.js`)
```
title       String
content     String   (sanitized HTML)
user        ObjectId required, references User — the note's owner
createdAt / updatedAt   (automatic timestamps)
```

---

## 10. Security notes

- Passwords are hashed with **bcrypt** before being stored; the plaintext
  password is never saved.
- Auth uses **JWTs** valid for 1 day; the server verifies the signature and
  expiry on every protected request (`Middlewares/authMiddleware.js`).
- Every notes query is scoped to `{ user: req.user }`, so one user can never
  read, edit, or delete another user's notes — even by guessing a note ID.
- Note content (HTML from the rich-text editor) is run through
  `sanitize-html` on the server before being saved, stripping `<script>`
  tags and other dangerous markup, since it's later rendered back with
  `dangerouslySetInnerHTML` on the frontend.
- **Helmet** sets standard hardening HTTP headers, and a basic rate limiter
  caps each IP to 300 requests per 15 minutes.
- Sensitive fields (passwords, the `Authorization` header) are redacted from
  all log output.
- Always replace the default `JWT_SECRET` fallback with a real secret in
  your `.env` before deploying anywhere beyond your own machine.

---

## 11. Running the test suites

**Backend** (from `Backend/`):
```bash
npm test               # runs the Mocha/Supertest suite (uses an in-memory Mongo)
npm run coverage        # same, plus a text + lcov coverage report
```

**Frontend** (from `frontend/`):
```bash
npm test                # runs the Jest + React Testing Library suite
npx jest --coverage      # with coverage
```

---

## 12. Troubleshooting

- **"MongoDB connection error" in the backend logs** — check that MongoDB is
  running locally (or that your Atlas `MONGO_URI` is correct, including
  username/password and that your IP is allow-listed on Atlas).
- **Frontend requests fail / CORS errors in the browser console** — make
  sure the backend is running on port `5000`. The backend's CORS config only
  allows `http://localhost:5173` by default (see `Backend/index.js`).
- **"Invalid token" / getting logged out unexpectedly** — JWTs expire after
  1 day; just log in again. Also make sure `JWT_SECRET` in `Backend/.env`
  hasn't changed since the token was issued (changing the secret invalidates
  every existing token).
- **Port already in use** — change `PORT` in `Backend/.env`, or stop
  whatever else is using port 5000/5173.
- **`npm install` fails** — make sure you're using Node.js 18 or newer
  (`node -v`).

---

## 13. Deploying

This repo is set up for local development. For a real deployment:

1. **Backend**: deploy `Backend/` to any Node host (Render, Railway, Fly.io,
   a VPS, etc.), set `PORT`, `MONGO_URI` (pointing at a production database,
   e.g. MongoDB Atlas), and a strong `JWT_SECRET` as environment variables.
   Update the `cors({ origin: ... })` call in `Backend/index.js` to allow
   your deployed frontend's URL instead of `localhost:5173`.
2. **Frontend**: update the hardcoded `http://localhost:5000` API URLs in
   `frontend/src/Pages/*.jsx` to point at your deployed backend URL (or
   refactor them to read from a Vite env variable, e.g.
   `import.meta.env.VITE_API_BASE_URL`), then run `npm run build` inside
   `frontend/` and deploy the generated `dist/` folder to any static host
   (Vercel, Netlify, GitHub Pages, etc.).
