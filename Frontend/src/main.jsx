import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/index.css";
import { Toaster } from "@/components/shadcn/sonner";

import Login from "@/pages/LoginPage";
import Register from "@/pages/RegisterPage";

import Dashboard from "@/pages/DashboardPage";
import RoomDetail from "@/pages/RoomDetailPage";
import Routines from "@/pages/RoutinesPage";
import History from "@/pages/HistoryPage";
import Users from "@/pages/UsersManagementPage";
import Devices from "@/pages/DeviceConfigPage";
import DeviceAccess from "@/pages/DeviceAccessPage";

import AppLayout from "@/layout/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* protected routes */}
        {/* Alles binnen deze wrapper vereist een geldige login/token. */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rooms/:roomId" element={<RoomDetail />} />
          <Route path="/routines" element={<Routines />} />
          <Route
            path="/history"
            element={
              <AdminRoute>
                <History />
              </AdminRoute>
            }
          />
          <Route
            path="/users"
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            }
          />
          <Route
            path="/devices"
            element={
              <AdminRoute>
                <Devices />
              </AdminRoute>
            }
          />
          <Route
            path="/device-access"
            element={
              <AdminRoute>
                <DeviceAccess />
              </AdminRoute>
            }
          />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
    <Toaster />
  </React.StrictMode>
);
