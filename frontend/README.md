# 10PearlsMERN – Frontend (React + Vite)

Single-page app for a notes system with auth, CRUD, search, export/import, and profile.

> For the full project manual (setup for both frontend + backend, user guide, full API reference) see the [root README](../README.md).

## ✨ Features
- Login / Signup (JWT in localStorage)
- Notes Dashboard: create, edit, delete, search (title/body)
- Export JSON & Import JSON
- Profile: update name/username & change password
- Jest + Testing Library unit tests

## 🧱 Tech
React 19, Vite, React Router, Axios, Tailwind CSS, Jest, @testing-library/react.

## 📂 Structure
```
src/
  Pages/
    Dashboard.jsx
    Login.jsx
    Signup.jsx
    ProfilePage.jsx
  tests/
    Dashboard.crud.test.jsx
    DashboardTitle.test.jsx
    Login.test.jsx
    ProfilePage.test.jsx
    Signup.test.jsx
  App.jsx
  main.jsx
  index.css
```

## ▶️ Run
The API base URL is currently hardcoded to `http://localhost:5000` in the
`Pages/*.jsx` files, so just make sure the backend (see `../Backend`) is
running on port 5000, then:
```bash
npm install
npm run dev       # http://localhost:5173
```
Prod:
```bash
npm run build
npm run preview
```

## 🧪 Tests
```bash
npm test
npx jest --coverage
```

## 📤 Export / 📥 Import format
```json
[ { "title": "Example", "content": "Hello" } ]
```

## 🗂 .gitignore (important)
```
node_modules/
dist/
coverage/
.env
.env.*
```
