import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
 
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const FormsList = lazy(() => import("@/pages/FormsList"));
const FormDetails = lazy(() => import("@/pages/FormDetails"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Protected Route component
const ProtectedRoute = lazy(() => import("@/components/ProtectedRoute"));

const AppRoutes = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/" element={<Navigate to="/forms" replace />} />
      
      {/* Public Routes */}
      <Route
        path="/login"
        element={           
            <Login />         
        }
      />
      <Route
        path="/register"
        element={
            <Register />
        }
      />
      
      {/* Protected Routes */}
      <Route
        path="/forms"
        element={
          <ProtectedRoute>
            <FormsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/forms/:id"
        element={
          <ProtectedRoute>
            <FormDetails />
          </ProtectedRoute>
        }
      />
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;