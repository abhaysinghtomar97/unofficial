import React from 'react';

import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './pages/DashboardLayout';
import Overview from './pages/Overview';
import { AuthProvider, useAuth } from './lib/auth';
import PlacedStudents from './pages/PlacedStudents';
import PlacementDrives from './pages/PlacementDrives';

function Protected() {
  const { user, bootstrapped } = useAuth();
  if (!bootstrapped) {
    return (
      <div className="min-h-screen grid place-items-center text-slate-500 text-sm" data-testid="bootstrapping">
        Loading PSIT Unofficial…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Protected />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="students" element={<PlacedStudents />} />
              <Route path="drives" element={<PlacementDrives />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
