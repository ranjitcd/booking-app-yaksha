import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

function ProtectedRoute({ children }) {
  const [isValid, setIsValid] = useState(null);
  const token = localStorage.getItem("adminToken");
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Token verification response:", res.data);
        setIsValid(res.data.success);
      } catch (error) {
        console.error("Token verification failed:", error.response?.data || error.message);
        setIsValid(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setIsValid(false);
    }
  }, [token]);

  if (isValid === null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '18px'
      }}>
        ⏳ Verifying credentials...
      </div>
    );
  }

  return isValid ? children : <Navigate to="/" replace />;
}

export default ProtectedRoute;