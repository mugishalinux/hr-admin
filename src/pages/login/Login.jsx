import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest, graphConfig } from "../../msalConfig";
import { useSignIn, useAuthUser } from "react-auth-kit";
import { BASE_URL } from "../../config/baseUrl";
import "./login.scss";

const Login = () => {
  const navigate = useNavigate();
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const signIn = useSignIn();
  const auth = useAuthUser();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  // 🎯 Handle input changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // 🔐 Microsoft Authentication
  const fetchMicrosoftProfile = async () => {
    if (!isAuthenticated || !accounts.length) return;

    try {
      const account = accounts[0];
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account,
      });

      const msToken = response.accessToken;
      localStorage.setItem("ms_access_token", msToken);

      const profileRes = await fetch(graphConfig.profileEndpoint, {
        headers: { Authorization: `Bearer ${msToken}` },
      });
      const profile = await profileRes.json();

      let photoUrl = "";
      const photoRes = await fetch(graphConfig.photoEndpoint, {
        headers: { Authorization: `Bearer ${msToken}` },
      });

      if (photoRes.ok) {
        const blob = await photoRes.blob();
        photoUrl = URL.createObjectURL(blob);
      }

      verifyToken(msToken, photoUrl);
    } catch (error) {
      console.error("Microsoft auth error", error);
      toast.error("Microsoft authentication failed.");
    }
  };

  const handleMicrosoftLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  const verifyToken = async (msToken, photoUrl = null) => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${BASE_URL}/api/users/verifyToken`, {
        token: msToken,
      });

      const { id, token, permissions, departmentId } = data;

      const success = signIn({
        token,
        expiresIn: 3600,
        tokenType: "Bearer",
        authState: { id, permissions, jwtToken: token, departmentId, image: photoUrl, loginMethod: "microsoft" },
      });

      if (success) {
        toast.success("Login successful!");
        navigate("/home");
      } else {
        toast.error("Authentication failed.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Token verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔐 Manual Login
  const handleFormLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${BASE_URL}/api/users/login`, formData);
      const { id, token, permissions, departmentId } = data;

      const success = signIn({
        token,
        expiresIn: 3600,
        tokenType: "Bearer",
        authState: { id, permissions, jwtToken: token, departmentId, loginMethod: "normal"  },
      });

      if (success) {
        toast.success("Login successful!");
        navigate("/home");
      } else {
        toast.error("Login failed.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login error.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (auth() === null) fetchMicrosoftProfile();
  }, [isAuthenticated, accounts]);

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Login to Leave Management System</p>
        </div>

        <form className="login-form" onSubmit={handleFormLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleChange}
            className="input-field"
          />
          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="divider">OR</div>

        <button className="microsoft-login" onClick={handleMicrosoftLogin} disabled={isLoading}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
            alt="Microsoft"
            className="microsoft-logo"
          />
          {isLoading ? "Signing in..." : "Sign in with Microsoft"}
        </button>
      </div>
    </div>
  );
};

export default Login;
