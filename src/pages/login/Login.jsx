import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config/baseUrl";
import "./login.scss";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest, graphConfig } from "../../msalConfig";
import { useSignIn } from "react-auth-kit";
import { useAuthUser } from "react-auth-kit";

const Login = () => {
  const signIn = useSignIn();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();

  const [data, setData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const { instance, accounts } = useMsal();

  const auth = useAuthUser();


  const [profile, setProfile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);

  const fetchProfile = async () => {


    if (!isAuthenticated || !accounts.length) return;
 
 
    const account = accounts[0];
 
 
    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account,
      });
 
 
      const token_ = response.accessToken;
      localStorage.setItem("ms_access_token", token_);

      
 
 
      const profileRes = await fetch(graphConfig.profileEndpoint, {
        headers: {
          Authorization: `Bearer ${token_}`,
        },
      });
      const profileData = await profileRes.json();
      setProfile(profileData);
 
 
 
 
      const photoRes = await fetch(graphConfig.photoEndpoint, {
        headers: {
          Authorization: `Bearer ${token_}`,
        },
      });
 
      let photoUrl='';
 
      if (photoRes.ok) {
        const blob = await photoRes.blob();
        setPhotoUrl(URL.createObjectURL(blob));
        photoUrl=URL.createObjectURL(blob);
        console.log('photo',photoUrl);
      } else {
        console.warn("No photo found");
      }
      
      verifyToken(token_,photoUrl);

    } catch (err) {
      console.error("Error fetching profile or token", err);
    }
  };
 
  const handleLogin_ = () => {
    instance.loginRedirect(loginRequest);
  };

  // 🔐 Auto-redirect if user is already authenticated
  useEffect(() => {
    // if (isAuthenticated) {
    //   navigate("/home");
    // }
    const user = auth();
    console.log('user',user);
    if(user === null) fetchProfile();
  }, [isAuthenticated,instance,  accounts, navigate]);

   const verifyToken = async(token_,photoUrl)=>{
    setIsLoading(true);

    try {
      const verifyData = {
        token: token_
      }
      const response_ = await axios.post(`${BASE_URL}/api/users/verifyToken`, verifyData);

      const { id, token, permissions, departmentId } = response_.data;

      const success = signIn({
        token,
        expiresIn: 3600,
        tokenType: "Bearer",
        authState: { id, permissions, jwtToken: token, departmentId, image: photoUrl },
      });

      if (success) {
        toast.success("Login successful!");
        navigate("/home"); 
      } else {
        toast.error("Authentication failed. Please try again.");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred. Please try again.";
      toast.error(` ${message}`);
    } finally {
      setIsLoading(false);
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/api/users/login`, data);

      const { id, token, permissions, departmentId } = response.data;

      const success = signIn({
        token,
        expiresIn: 3600,
        tokenType: "Bearer",
        authState: { id, permissions, jwtToken: token, departmentId },
      });

      if (success) {
        toast.success("Login successful!");
        navigate("/home"); // You can later add role-based redirects here
      } else {
        toast.error("Authentication failed. Please try again.");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred. Please try again.";
      toast.error(` ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Welcome back</h2>
        <p>Please enter your details</p>
        <form onSubmit={handleLogin_}>
          <input
            type="email"
            placeholder="Email address"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            // required
          />
          <input
            type="password"
            placeholder="Password"
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
            // required
          />
          <div className="options">
            <a href="#">Forgot password?</a>
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
