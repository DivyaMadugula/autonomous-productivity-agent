import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Loader from "../components/common/Loader";
import logo from "../assets/logo.svg";
import API from "../api/api";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);  // backend expects username
      formData.append("password", password);

      const res = await API.post("/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      // ✅ SAVE TOKEN PROPERLY
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("auth", "true");

      setLoading(false);
      navigate("/dashboard");

    } catch (err) {
      setLoading(false);
      setError("Invalid credentials");
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card card">

        <div className="login-header">
          <h2 className="logo">▲ Aura</h2>
          <h2>Welcome Back</h2>
          <p className="login-subheading">
            Please enter your credentials
          </p>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        {loading ? (
          <Loader />
        ) : (
          <button onClick={handleLogin}>Login</button>
        )}

        <p onClick={() => navigate("/register")}>
          Don't have an account? Register
        </p>

      </div>
    </div>
  );
};

export default Login;