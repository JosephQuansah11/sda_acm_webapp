// src/App.tsx
import "./App.scss";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { CustomNav } from "./components/Nav";
import { Home } from "./pages/home/Home";
import ErrorPage from "./pages/error/ErrorPage";
import Members from "./pages/members/Members";
import LoginPage from "./pages/auth/LoginPage";
import UserProfile from "./pages/profile/UserProfile";
import Settings from "./pages/settings/Settings";
import UnauthorizedPage from "./pages/error/UnauthorizedPage";
import AddMember from "./pages/members/AddMember";
import SignUpPage from "./pages/auth/SignUpPage";
import { ThemeProvider } from "./contexts/ThemeContext";
import { withRequireAuth } from "./security/withAuth";

// Import mock service for demo purposes
import "./api/authPromise";

// Protected layout component
function ProtectedLayout() {
  return (
    <div className="d-flex">
      <CustomNav />
      <main className="app-main main-content">
        <Routes>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/members" element={<Members />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/add-member" element={<AddMember />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </main>
    </div>
  );
}

// Wrap the protected layout with auth requirement
const AuthenticatedLayout = withRequireAuth(ProtectedLayout);

// Main app content
function AppContent() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<SignUpPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected Routes */}
      <Route path="/*" element={<AuthenticatedLayout />} />
    </Routes>
  );
}

// Root App (will be wrapped by ReactKeycloakProvider in main.tsx)
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
