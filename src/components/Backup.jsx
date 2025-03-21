import React from 'react';
import axiosInstance from "../axios";
import { toast } from "react-toastify";
 // Import the CSS file

const Backup = () => {
  // Placeholder functions for button clicks

  const handleFullBackup = async () => {
    try {
      const response = await axiosInstance.get("backup/backup");
      toast.success(response.data.message);
    } catch (error) {
      console.error("Full Backup Error:", error);
      toast.error("Full Backup failed. Please try again.");
    }
  };

  
  const handleBackup = async () => {
    try {
      const response = await axiosInstance.post("/backup/backupnow");
      toast.success(response.data.message); // Use toast for better UI feedback
    } catch (error) {
      console.error("Backup Error:", error);
      toast.error("Backup failed. Please try again.");
    }
  };

  return (
    <div className="backup-container">
      <h2>Backup Information</h2>
      <div className="backup-info">
        <p>
          Backups are essential for protecting your data. Regular backups ensure that you can restore your system in case of data loss or corruption.
        </p>
        <p>
          <strong>Backup Database:</strong> This option creates a backup of the current database, including all user data and configurations.
        </p>
        <p>
          <strong>Full Backup:</strong> This option creates a complete backup of the entire system, including the database, files, and application settings.
        </p>
      </div>
      <div className="button-group">
        <button onClick={handleBackup} className="backup-button">
          Backup Database
        </button>
        <button onClick={handleFullBackup} className="backup-button">
          Full Backup
        </button>
      </div>
    </div>
  );
};

export default Backup;