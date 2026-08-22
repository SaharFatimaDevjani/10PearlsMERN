// frontend/src/ProtectedRoute.jsx
// Route guard used by App.jsx: renders its children only if a JWT is present
// in localStorage, otherwise redirects to /login. This is a client-side-only
// check for UX purposes — the backend still independently verifies the JWT
// on every protected API call (see Middlewares/authMiddleware.js).

import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  // `replace` avoids adding a history entry, so the back button won't
  // bounce the user back into the protected page.
  return token ? children : <Navigate to="/login" replace />;
}
