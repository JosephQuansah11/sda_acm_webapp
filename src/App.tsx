import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './App.scss';
import { CustomNav } from './components/Nav';
import { Home } from './pages/home/Home';
import ErrorPage from './pages/error/ErrorPage';
import Members from './pages/members/Members';
import LoginPage from './pages/auth/LoginPage';
import UserProfile from './pages/profile/UserProfile';
import Settings from './pages/settings/Settings';
import UnauthorizedPage from './pages/error/UnauthorizedPage';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { withRequireAuth } from './security/withAuth';
// Import mock service for demo purposes
import './api/authPromise';
import AddMember from './pages/members/AddMember';

// Protected layout component
function ProtectedLayout() {
  return (
    <div className="d-flex">
      <CustomNav />
      <main className="main-content">
        <Routes>
          <Route path='/dashboard' element={<Home />} errorElement={<ErrorPage />} />
          <Route path='/members' element={<Members />} errorElement={<ErrorPage />} />
          <Route path='/profile' element={<UserProfile />} errorElement={<ErrorPage />} />
          <Route path='/settings' element={<Settings />} errorElement={<ErrorPage />} />
          <Route path='/add-member' element={<AddMember />} errorElement={<ErrorPage />} />
          <Route path='/' element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

// Wrap the protected layout with auth requirement
const AuthenticatedLayout = withRequireAuth(ProtectedLayout);

// Main app component
function AppContent() {

  return (
    <Routes>
      {/* Public routes */}
      <Route path='/login' element={<LoginPage />} />
      <Route path='/unauthorized' element={<UnauthorizedPage />} />

      {/* Protected routes */}
      <Route path='/*' element={<AuthenticatedLayout />} />
    </Routes>
  );
}

function App() {
  console.log(localStorage.getItem('authToken'));
  console.log(localStorage.getItem('loginMethod'));
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
