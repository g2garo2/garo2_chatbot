import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import LoadingSpinner from "./components/LoadingSpinner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { initAnalytics, trackPageView } from "./analytics";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsAndConditionsPage = lazy(() => import("./pages/TermsAndConditionsPage"));
const UsagePage = lazy(() => import("./pages/UsagePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const AccountDeletionPage = lazy(() => import("./pages/AccountDeletionPage"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(`${location.pathname}${location.search}${location.hash}`);
  }, [location]);

  return null;
}

function AppLoader() {
  return <LoadingSpinner centered />;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <AppLoader />;
  }

  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <AppLoader />;
  }

  return user ? <Navigate to="/app" replace /> : children;
}

function HomeRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <AppLoader />;
  }

  return <Navigate to={user ? "/app" : "/login"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <AnalyticsTracker />
      <Suspense fallback={<AppLoader />}>
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pricing"
            element={
              <ProtectedRoute>
                <PricingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usage"
            element={
              <ProtectedRoute>
                <UsagePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute>
                <FeedbackPage />
              </ProtectedRoute>
            }
          />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
          <Route path="/account-deletion" element={<AccountDeletionPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
