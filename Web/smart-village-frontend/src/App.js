import React, { useEffect, useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import RequestList from './components/service-requests/RequestList';
import RequestDetails from './components/service-requests/RequestDetails';
import CreateRequest from './components/service-requests/CreateRequest';
import AnnouncementList from './components/announcements/AnnouncementList';
import AnnouncementDetails from './components/announcements/AnnouncementDetails';
import Dashboard from './components/dashboard/Dashboard';
import Profile from './components/auth/Profile';
import AnnouncementManagement from './components/admin/AnnouncementManagement';
import CreateAnnouncement from './components/admin/CreateAnnouncement';
import EditAnnouncement from './components/admin/EditAnnouncement';
import CertificateList from './components/certificates/CertificateList';
import CertificateDetails from './components/certificates/CertificateDetails';
import CertificateApplication from './components/certificates/CertificateApplication';
import AuthService from './services/auth.service';
import { ProtectedRoute, AdminRoute } from './components/auth/ProtectedRoute';
import AuthenticatedHeader from './components/layout/Header';

// Create a global navigation context
const NavigationContext = createContext(null);

// Navigation Provider Component
const NavigationProvider = ({ children }) => {
  const navigate = useNavigate();

  // Centralized navigation methods
  const navigationMethods = {
    // Handle unexpected errors with graceful navigation
    handleErrorNavigation: (errorType = 'generic') => {
      console.error(`Navigating due to ${errorType} error`);

      switch (errorType) {
        case 'auth':
          navigate('/login', {
            state: {
              message: 'Your session has expired. Please log in again.'
            }
          });
          break;
        case 'permission':
          navigate('/dashboard', {
            state: {
              message: 'You do not have permission to access this page.'
            }
          });
          break;
        default:
          navigate('/error', {
            state: {
              message: 'An unexpected error occurred. Please try again.'
            }
          });
      }
    },

    // Redirect to a specific page with optional state
    redirectTo: (path, state = {}) => {
      navigate(path, { state });
    }
  };

  return (
    <NavigationContext.Provider value={navigationMethods}>
      {children}
    </NavigationContext.Provider>
  );
};

// Custom hook to use navigation methods
export const useAppNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === null) {
    throw new Error('useAppNavigation must be used within a NavigationProvider');
  }
  return context;
};

// Wrapper component to handle authentication and routing
const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check authentication status on mount and when auth changes
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = AuthService.isTokenValid();
      setIsAuthenticated(authenticated);
      setIsAdmin(authenticated && AuthService.isAdmin());
      setCheckingAuth(false);
    };

    checkAuth();

    // Set up event listener for storage changes (for multi-tab support)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Don't render anything while checking authentication
  if (checkingAuth) {
    return <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>;
  }

  return (
    <NavigationProvider>
      <div className="d-flex flex-column min-vh-100">
        {isAuthenticated ? <AuthenticatedHeader isAdmin={isAdmin} /> : <Header />}
        <main className="flex-grow-1">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/announcements" element={<AnnouncementList />} />
            <Route path="/announcements/:id" element={<AnnouncementDetails />} />

            {/* Error handling route */}
            <Route path="/error" element={<div className="container mt-4">
              <div className="alert alert-danger">
                An error occurred. Please try again or contact support.
              </div>
            </div>} />

            {/* Protected routes - Resident */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/service-requests" element={
              <ProtectedRoute>
                <RequestList />
              </ProtectedRoute>
            } />
            <Route path="/service-requests/create" element={
              <ProtectedRoute>
                <CreateRequest />
              </ProtectedRoute>
            } />
            <Route path="/service-requests/:id" element={
              <ProtectedRoute>
                <RequestDetails />
              </ProtectedRoute>
            } />
            <Route path="/certificates" element={
              <ProtectedRoute>
                <CertificateList />
              </ProtectedRoute>
            } />
            <Route path="/certificates/apply" element={
              <ProtectedRoute>
                <CertificateApplication />
              </ProtectedRoute>
            } />
            <Route path="/certificates/:id" element={
              <ProtectedRoute>
                <CertificateDetails />
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/requests" element={
              <AdminRoute>
                <RequestList adminView={true} />
              </AdminRoute>
            } />
            <Route path="/admin/announcements" element={
              <AdminRoute>
                <AnnouncementManagement />
              </AdminRoute>
            } />
            <Route path="/admin/announcements/create" element={
              <AdminRoute>
                <CreateAnnouncement />
              </AdminRoute>
            } />
            <Route path="/admin/announcements/edit/:id" element={
              <AdminRoute>
                <EditAnnouncement />
              </AdminRoute>
            } />
            <Route path="/admin/certificates" element={
              <AdminRoute>
                <CertificateList adminView={true} />
              </AdminRoute>
            } />

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </NavigationProvider>
  );
};

// Root component that wraps AppContent with BrowserRouter
const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;