import React, { useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axiosInstance from "./axios";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import AddNewDoctor from "./components/AddNewDoctor";
import Messages from "./components/Messages";
import Doctors from "./components/Doctors";
import { Context } from "./main";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./components/Sidebar";
import "./App.css";

const ProtectedRoute = ({ element, allowedRoles }) => {
  const { isAuthenticated, user } = useContext(Context);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />;
  }

  return element;
};

const App = () => {
  const { isAuthenticated, setIsAuthenticated, user, setUser } = useContext(Context);

  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    const storedUser = localStorage.getItem("user");

    if (storedAuth === "true" && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    } else {
      const fetchUser = async () => {
        try {
          const response = await axiosInstance.get("user/doctor/me", {
            withCredentials: true,
          });
          setIsAuthenticated(true);
          setUser(response.data.user);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          localStorage.setItem("isAuthenticated", "true");
        } catch (error) {
          setIsAuthenticated(false);
          setUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("isAuthenticated");
        }
      };
      fetchUser();
    }
  }, [setIsAuthenticated, setUser]);

  return (
    <Router>
      {isAuthenticated && <Sidebar />} {/* Sidebar only shows if authenticated */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/doctor/addnew" element={<ProtectedRoute element={<AddNewDoctor />} allowedRoles={["Doctor","Admin",]} />} />
        <Route path="/messages" element={<ProtectedRoute element={<Messages />} allowedRoles={["Admin","Doctor"]} />} />
        <Route path="/doctors" element={<ProtectedRoute element={<Doctors />} allowedRoles={["Doctor", "Admin"]} />} />
      </Routes>
      <ToastContainer position="top-center" />
    </Router>
  );
};

export default App;