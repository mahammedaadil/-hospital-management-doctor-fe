import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axiosInstance from "../axios"; // Ensure correct import path
import { toast } from "react-toastify";
import { GoCheckCircleFill } from "react-icons/go";
import { AiFillCloseCircle } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [user, setUser] = useState(null); // Store admin or doctor details

  const { isAuthenticated} = useContext(Context);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await axiosInstance.get("/appointment/getall", {
          withCredentials: true,
        });
        setAppointments(data.appointments);
        setTotalAppointments(data.appointments.length);
      } catch (error) {
        setAppointments([]);
        setTotalAppointments(0);
      }
    };

    const fetchDoctors = async () => {
      try {
        const { data } = await axiosInstance.get("/user/doctors", {
          withCredentials: true,
        });
        setDoctors(data.doctors);
      } catch (error) {
        setDoctors([]);
      }
    };

    const fetchUserDetails = async () => {
      try {
        const { data } = await axiosInstance.get("/user/admin/me", {
          withCredentials: true,
        });
        setUser(data.user);
      } catch (error) {
        try {
          const { data } = await axiosInstance.get("/user/doctor/me", {
            withCredentials: true,
          });
          setUser(data.user);
        } catch (error) {
          setUser(null);
        }
      }
    };

    fetchAppointments();
    fetchDoctors();
    fetchUserDetails();
  }, []);

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      const { data } = await axiosInstance.put(
        `/appointment/update/${appointmentId}`,
        { status },
        { withCredentials: true }
      );
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status }
            : appointment
        )
      );
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      const { data } = await axiosInstance.delete(
        `/appointment/delete/${appointmentId}`,
        { withCredentials: true }
      );
      setAppointments((prevAppointments) =>
        prevAppointments.filter((appointment) => appointment._id !== appointmentId)
      );
      setTotalAppointments((prevTotal) => prevTotal - 1);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete appointment");
    }
  };

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <section className="dashboard page">
      <div className="banner">
        <div className="firstBox">
          <img src="/doc.png" alt="docImg" />
          <div className="content">
            <div>
              <p>Hello,Dr.</p>
              <h5>
                {user ? `${user.firstName} ${user.lastName}`.toUpperCase() : "User"}
              </h5>
            </div>
            <p>
              Welcome To Aadicare {user?.role === "Doctor" ? "Doctor" : "Admin"} Dashboard.
              Here You Can See Your Patients Appointments ,Change Status Of Appointment, Add New Doctors, Add New Patients,
             Also Can Check Messages Inquiries From Different Users Of Website.
            </p>
          </div>
        </div>
        <div className="secondBox">
          <p>Total Appointments</p>
          <h3>{totalAppointments}</h3>
        </div>
        <div className="thirdBox">
          <p>Registered Doctors</p>
          <h3>{doctors.length}</h3>
        </div>
      </div>
      <div className="banner">
        <h5>Appointments</h5>
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Time</th>
              <th>Department</th>
              <th>Doctor</th>
              <th>Status</th>
              <th>Visited</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>{`${appointment.firstName.toUpperCase()} ${appointment.lastName.toUpperCase()}`}</td>
                  <td>{new Date(appointment.appointment_date).toLocaleDateString()}</td>
                  <td>{appointment.timeSlot}</td>
                  <td>{appointment.department}</td>
                  <td>{`${appointment.doctor?.firstName} ${appointment.doctor?.lastName}`}</td>
                  <td>
                    <select
                      className={
                        appointment.status === "Pending"
                          ? "value-pending"
                          : appointment.status === "Accepted"
                          ? "value-accepted"
                          : "value-rejected"
                      }
                      value={appointment.status}
                      onChange={(e) =>
                        handleUpdateStatus(appointment._id, e.target.value)
                      }
                    >
                      <option value="Pending" className="value-pending">
                        Pending
                      </option>
                      <option value="Accepted" className="value-accepted">
                        Accepted
                      </option>
                      <option value="Rejected" className="value-rejected">
                        Rejected
                      </option>
                    </select>
                  </td>
                  <td>
                    {appointment.hasVisited ? (
                      <GoCheckCircleFill className="green" />
                    ) : (
                      <AiFillCloseCircle className="red" />
                    )}
                  </td>
                  <td>
                    <FaTrash
                      className="delete-icon"
                      onClick={() => handleDeleteAppointment(appointment._id)}
                      style={{ cursor: "pointer", color: "red" }}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No Appointments Found!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Dashboard;
