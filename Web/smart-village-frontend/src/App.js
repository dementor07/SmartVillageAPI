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
      <Header />
      <main className="min-vh-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/announcements" element={<AnnouncementList />} />
          <Route path="/announcements/:id" element={<AnnouncementDetails />} />

          {/* Protected routes */}
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
              <RequestList />
            </AdminRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;