import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import AuthService from './services/auth.service';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = AuthService.isTokenValid();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin route component
const AdminRoute = ({ children }) => {
  const isAuthenticated = AuthService.isTokenValid();
  const isAdmin = AuthService.isAdmin();
  return isAuthenticated && isAdmin ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/announcements" element={<AnnouncementList />} />
            <Route path="/announcements/:id" element={<AnnouncementDetails />} />

            {/* Protected routes */}
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
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;