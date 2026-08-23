# 10PearlsMERN – Backend (Node/Express + MongoDB)

REST API with JWT auth, per-user notes CRUD, search, export/import, validation, logging, and tests.

> For the full project manual (setup for both frontend + backend, user guide, full API reference) see the [root README](../README.md).

## ✨ Features
- Auth: register, login, get/update profile, change password (JWT)
- Notes CRUD (user-owned)
- Search: `GET /api/notes?q=...`
- Export: `GET /api/notes/export/json`
- Import: `POST /api/notes/import`
- Validation (Joi + middleware)
- Pino HTTP logs, Helmet, CORS, basic rate limit
- Tests (Mocha/Chai/Supertest + mongodb-memory-server), NYC coverage

## 🔧 Env (create `Backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/notes_dev
JWT_SECRET=replace_with_strong_secret
```

## ▶️ Run
```bash
npm install
npm run dev   # nodemon
# or
npm start
```

## 🔌 API quick list
### Auth
- `POST /api/auth/register`  `{ firstName, lastName, username, email, password }`
- `POST /api/auth/login`     `{ username or email, password }`
- `GET  /api/auth/me`
- `PUT  /api/auth/me`        `{ firstName, lastName, username }`
- `PUT  /api/auth/me/password` `{ oldPassword, newPassword }`

### Notes (need Authorization header)
- `GET    /api/notes?q=...`
- `POST   /api/notes`         `{ title, content }`
- `PUT    /api/notes/:id`     `{ title, content }`
- `DELETE /api/notes/:id`
- `GET    /api/notes/export/json`
- `POST   /api/notes/import`  `{ notes: [ {title, content}, ... ] }`

## 🧪 Tests & coverage
```bash
npm test
npm run coverage
```

## 🧾 Logging & Security
- Pino HTTP request/response logs + controller events (e.g., "User registered")
- Helmet, CORS, HTML sanitization for note content

## 🗂 .gitignore (important)
```
node_modules/
coverage/
.nyc_output/
mocha-results.json
.env
.env.*
```
