import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../axios";


const ForgotPassword = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("user/forgot-password", { email });
      toast.success(response.data.message);
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("user/verify-otp", { email, otp });
      toast.success(response.data.message);
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("user/reset-password", { email, newPassword });
      toast.success(response.data.message);
      onClose(); // Close popup after success
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="forgot-password-overlay">
      <div className="forgot-password-container">
        <button className="close-btn" onClick={onClose}>✖</button>
        <h2>Forgot Password</h2>
        <p>Enter your details to reset your password</p>

        {step === 1 && (
          <form className="forgot-password-form" onSubmit={handleSendOtp}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit">Send OTP</button>
          </form>
        )}

        {step === 2 && (
          <form className="forgot-password-form" onSubmit={handleVerifyOtp}>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button type="submit">Verify OTP</button>
          </form>
        )}

        {step === 3 && (
          <form className="forgot-password-form" onSubmit={handleResetPassword}>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button type="submit">Reset Password</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
