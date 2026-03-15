import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AppLayout from "./layout/AppLayout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import React from "react";

// Auth Pages
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import VerifyEmail from "./pages/AuthPages/VerifyEmail";
import NotFound from "./pages/OtherPage/NotFound";

// Public Pages
import Landing from "./pages/Landing/Landing";

// App Pages
import Home from "./pages/Dashboard/Home";
import Leads from "./pages/Leads/Leads";
import SearchForm from "./pages/SearchForm/SearchForm";
import Executions from "./pages/Executions/Executions";
import ExecutionDetails from "./pages/ExecutionDetails/ExecutionDetails";
import PlaceDetail from "./pages/PlaceDetail/PlaceDetail";
import Profile from "./pages/Profile/Profile";
import PaymentHistory from "./pages/Profile/PaymentHistory";
import PaymentSuccess from "./pages/Payment/PaymentSuccess";
import PaymentPending from "./pages/Payment/PaymentPending";
import PaymentFailure from "./pages/Payment/PaymentFailure";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="w-10 h-10 border-4 border-brand-100 dark:border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }
  return user ? <>{children}</> : <Navigate to="/signin" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public landing page */}
          <Route path="/" element={<Landing />} />

          {/* Protected Routes */}
          <Route
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<Home />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/buscador" element={<SearchForm />} />
            <Route path="/executions" element={<Executions />} />
            <Route path="/executions/:id" element={<ExecutionDetails />} />
            <Route path="/places/:id" element={<PlaceDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/payments" element={<PaymentHistory />} />
          </Route>

          {/* Payment Routes (public — MP redirects here after checkout) */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/pending" element={<PaymentPending />} />
          <Route path="/payment/failure" element={<PaymentFailure />} />

          {/* Auth Routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
