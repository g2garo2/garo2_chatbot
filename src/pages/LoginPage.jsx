import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { login, registerWithEmail, loginWithEmail } = useAuth();
  const navigate = useNavigate();
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loadingAction, setLoadingAction] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const finishAuth = async (action) => {
    setSuccess(action);
    navigate("/app", { replace: true });
  };

  const handleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      return;
    }

    setLoadingAction("google");
    setError("");
    setSuccess("");
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
    setError("");
    setSuccess("");
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
    setError("");
    setSuccess("");
    try {
      await loginWithEmail({ email: normalizedEmail });
      await finishAuth("You are now signed in.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not log you in."));
    } finally {
      setLoadingAction("");
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <img src="/g2-logo.jpeg" alt="Garo2 logo" className="login-logo" />
        <h1>Garo2</h1>
        <p className="login-helper-text">Continue with Google or use name and email.</p>

        <div className="login-auth-section">
          <p className="login-option-label">Continue with Google</p>
          <GoogleLogin onSuccess={handleSuccess} onError={() => setError("Could not continue with Google.")} />
        </div>

        <div className="login-divider">
          <span>or</span>
        </div>

        <div className="login-form-grid">
          <form className="login-auth-section login-form-section" onSubmit={handleRegister}>
            <p className="login-option-label">Create Account</p>
            <input
              type="text"
              className="login-input"
              placeholder="Name"
              value={registerName}
              onChange={(event) => setRegisterName(event.target.value)}
              disabled={loadingAction !== ""}
            />
            <input
              type="email"
              className="login-input"
              placeholder="Email"
              value={registerEmail}
              onChange={(event) => setRegisterEmail(event.target.value)}
              disabled={loadingAction !== ""}
            />
            <button type="submit" className="primary-button login-submit-button" disabled={loadingAction !== ""}>
              {loadingAction === "register" ? "Creating..." : "Create Account"}
            </button>
          </form>

          <form className="login-auth-section login-form-section" onSubmit={handleLogin}>
            <p className="login-option-label">Login</p>
            <input
              type="email"
              className="login-input"
              placeholder="Email"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              disabled={loadingAction !== ""}
            />
            <button type="submit" className="secondary-button login-submit-button" disabled={loadingAction !== ""}>
              {loadingAction === "login" ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>

        {success ? <p className="success-banner login-status-banner">{success}</p> : null}
        {error ? <p className="error-banner login-status-banner">{error}</p> : null}
      </div>
    </div>
  );
}
