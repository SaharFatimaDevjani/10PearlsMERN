$FRONTEND_README = @"
# 10PearlsMERN – Frontend (React + Vite)

Single-page app for a notes system with auth, CRUD, search, export/import, and profile.

## ✨ Features
- Login / Signup (JWT in localStorage)
- Notes Dashboard: create, edit, delete, search (title/body)
- Export JSON & Import JSON
- Profile: update name/username & change password
- Jest + Testing Library unit tests

## 🧱 Tech
React 18, Vite, React Router, Axios, Jest, @testing-library/react.

## 📂 Structure
\`\`\`
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
\`\`\`

## 🔧 Env (create \`frontend/.env\`)
\`\`\`env
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_TITLE=Notes App
\`\`\`
Use with: \`import.meta.env.VITE_API_BASE_URL\`.

## ▶️ Run
\`\`\`bash
npm install
npm run dev       # http://localhost:5173
\`\`\`
Prod:
\`\`\`bash
npm run build
npm run preview
\`\`\`

## 🧪 Tests
\`\`\`bash
npm test
npx jest --coverage
\`\`\`

## 📤 Export / 📥 Import format
\`\`\`json
{ "notes": [ { "title": "Example", "content": "Hello" } ] }
\`\`\`

## 🗂 .gitignore (important)
\`\`\`
node_modules/
dist/
coverage/
.nyc_output/
.env
.env.*
\`\`\`

## 🧭 Branch/PR flow (frontend)
- base: \`development\`
- feature branches:
  - \`feat/frontend-bootstrap\`
  - \`feat/frontend-auth\`
  - \`feat/frontend-dashboard\`
  - \`feat/frontend-profile\`
  - \`test/frontend\`