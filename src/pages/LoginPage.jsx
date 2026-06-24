import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) return;
    await login(credentialResponse.credential);
    navigate("/app", { replace: true });
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <img src="/g2-logo.jpeg" alt="Garo2 logo" className="login-logo" />
        <h1>Garo2</h1>
        <GoogleLogin onSuccess={handleSuccess} onError={() => {}} />
      </div>
    </div>
  );
}
