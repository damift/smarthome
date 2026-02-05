import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/index.css";

import Login from "@/pages/LoginPage.jsx";
import Dashboard from "@/pages/DashboardPage.jsx";
import Routines from "@/pages/RoutinesPage.jsx";
import History from "@/pages/HistoryPage.jsx";
import Users from "@/pages/UsersManagementPage.jsx";
import Devices from "@/pages/DeviceConfigPage.jsx";
import AppLayout from "@/layout/AppLayout.jsx";
import ProtectedRoute from "@/components/ProtectedRoute.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* public */}
        <Route path="/login" element={<Login />} />

        {/* protected */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/routines" element={<Routines />} />
          <Route path="/history" element={<History />} />
          <Route path="/users" element={<Users />} />
          <Route path="/devices" element={<Devices />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
