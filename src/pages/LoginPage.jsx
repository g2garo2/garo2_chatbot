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
        <div className="eyebrow">Bilingual AI assistant</div>
        <h1>Garo2</h1>
        <p>
          Chat in English and Garo, upload images, and continue your conversations from any device.
        </p>
        <GoogleLogin onSuccess={handleSuccess} onError={() => {}} />
      </div>
    </div>
  );
}
