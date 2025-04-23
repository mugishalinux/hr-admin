
import React from "react";
import "./notfound.scss";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
    const navigate = useNavigate();
  
    return (
      <div className="not-found">
        <h1>404 - Page Not Found</h1>
        <p>The page you’re looking for doesn’t exist or has been moved.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  };

export default NotFound;
