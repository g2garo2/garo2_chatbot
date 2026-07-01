import { GoogleLogin } from "@react-oauth/google";
import { CircleAlert, CircleCheck, Eye, EyeOff, Lock, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { login, registerWithEmail, loginWithEmail } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [loadingAction, setLoadingAction] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const finishAuth = async (action) => {
    setSuccess(action);
    navigate("/app", { replace: true });
  };

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      return;
    }

    setLoadingAction("google");
    resetMessages();
    try {
      await login(credentialResponse.credential);
      await finishAuth("Signed in successfully.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not continue with Google."));
    } finally {
      setLoadingAction("");
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const normalizedName = registerName.trim();
    const normalizedEmail = registerEmail.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail) {
      setError("Name and email are required.");
      setSuccess("");
      return;
    }
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      setSuccess("");
      return;
    }

    setLoadingAction("register");
    resetMessages();
    try {
      await registerWithEmail({ name: normalizedName, email: normalizedEmail });
      await finishAuth("You are now signed in.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create your account."));
    } finally {
      setLoadingAction("");
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const normalizedEmail = loginEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Email is required.");
      setSuccess("");
      return;
    }
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      setSuccess("");
      return;
    }

    setLoadingAction("login");
    resetMessages();
    try {
      await loginWithEmail({ email: normalizedEmail });
      await finishAuth("You are now signed in.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not log you in."));
    } finally {
      setLoadingAction("");
    }
  };

  const handleForgotPassword = () => {
    setSuccess("");
    setError("Forgot password is not available yet. Please continue with Google or use your email login.");
  };

  const isBusy = loadingAction !== "";

  return (
    <div className="login-shell">
      <div className="login-card login-card-modern">
        <img src="/g2-logo.jpeg" alt="Garo2 logo" className="login-logo login-logo-modern" />

        <div className="login-card-header login-card-header-modern">
          <h1>{mode === "login" ? "Log In" : "Create Account"}</h1>
          <p className="login-helper-text">
            {mode === "login"
              ? "Sign in to continue chatting, translating, and managing your workspace."
              : "Create your account with name and email, or continue instantly with Google."}
          </p>
        </div>

        {success ? (
          <div className="login-status-banner login-status-success" role="status">
            <CircleCheck size={18} />
            <span>{success}</span>
          </div>
        ) : null}
        {error ? (
          <div className="login-status-banner login-status-error" role="alert">
            <CircleAlert size={18} />
            <span>{error}</span>
          </div>
        ) : null}

        {mode === "login" ? (
          <form className="login-form-stack" onSubmit={handleLogin}>
            <label className="login-field">
              <span className="login-label">Email</span>
              <span className="login-input-wrap">
                <Mail size={18} className="login-input-icon" />
                <input
                  type="email"
                  className="login-input login-input-modern"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  disabled={isBusy}
                />
              </span>
            </label>

            <label className="login-field">
              <span className="login-label">Password</span>
              <span className="login-input-wrap">
                <Lock size={18} className="login-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="login-input login-input-modern login-input-with-action"
                  placeholder="••••••••••"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  disabled={isBusy}
                />
                <button
                  type="button"
                  className="login-input-action"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>

            <button type="submit" className="primary-button login-submit-button login-submit-primary" disabled={isBusy}>
              {loadingAction === "login" ? (
                <span className="login-button-loading">
                  <span className="login-spinner" />
                  Log In
                </span>
              ) : (
                "Log In"
              )}
            </button>

            <button type="button" className="login-link-button" onClick={handleForgotPassword}>
              Forgot password?
            </button>
          </form>
        ) : (
          <form className="login-form-stack" onSubmit={handleRegister}>
            <label className="login-field">
              <span className="login-label">Name</span>
              <span className="login-input-wrap">
                <UserRound size={18} className="login-input-icon" />
                <input
                  type="text"
                  className="login-input login-input-modern"
                  placeholder="Your name"
                  value={registerName}
                  onChange={(event) => setRegisterName(event.target.value)}
                  disabled={isBusy}
                />
              </span>
            </label>

            <label className="login-field">
              <span className="login-label">Email</span>
              <span className="login-input-wrap">
                <Mail size={18} className="login-input-icon" />
                <input
                  type="email"
                  className="login-input login-input-modern"
                  placeholder="you@example.com"
                  value={registerEmail}
                  onChange={(event) => setRegisterEmail(event.target.value)}
                  disabled={isBusy}
                />
              </span>
            </label>

            <label className="login-field">
              <span className="login-label">Password</span>
              <span className="login-input-wrap">
                <Lock size={18} className="login-input-icon" />
                <input
                  type={showSignupPassword ? "text" : "password"}
                  className="login-input login-input-modern login-input-with-action"
                  placeholder="Create a password"
                  value={registerPassword}
                  onChange={(event) => setRegisterPassword(event.target.value)}
                  disabled={isBusy}
                />
                <button
                  type="button"
                  className="login-input-action"
                  onClick={() => setShowSignupPassword((current) => !current)}
                  aria-label={showSignupPassword ? "Hide password" : "Show password"}
                >
                  {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>

            <button
              type="submit"
              className="primary-button login-submit-button login-submit-primary"
              disabled={isBusy}
            >
              {loadingAction === "register" ? (
                <span className="login-button-loading">
                  <span className="login-spinner" />
                  Create Account
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        )}

        <div className="login-divider login-divider-modern">
          <span>or</span>
        </div>

        {mode === "login" ? (
          <button
            type="button"
            className="secondary-button login-submit-button login-submit-secondary"
            onClick={() => {
              setMode("signup");
              resetMessages();
            }}
          >
            Create New Account
          </button>
        ) : (
          <button
            type="button"
            className="login-link-button login-link-button-strong"
            onClick={() => {
              setMode("login");
              resetMessages();
            }}
          >
            Back to Login
          </button>
        )}

        <div className="login-google-section">
          <div className="login-google-label">
            <span className="login-google-icon">G</span>
            <span>Continue with Google</span>
          </div>
          <div className="login-google-wrap">
            <GoogleLogin onSuccess={handleSuccess} onError={() => setError("Could not continue with Google.")} />
          </div>
        </div>
      </div>
    </div>
  );
}
