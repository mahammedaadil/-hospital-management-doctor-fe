import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axiosInstance from "../axios";
import { toast } from "react-toastify";
import { GoCheckCircleFill } from "react-icons/go";
import { AiFillCloseCircle } from "react-icons/ai";
import { FaTrash, FaRegCalendarAlt } from "react-icons/fa"; // Add the reschedule icon

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal
  const [selectedAppointment, setSelectedAppointment] = useState(null); // Store selected appointment for rescheduling
  const [newDate, setNewDate] = useState(""); // Store new date
  const [newTimeSlot, setNewTimeSlot] = useState(""); // Store new time slot

  const { isAuthenticated } = useContext(Context);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await axiosInstance.get("/appointment/doctor", {
          withCredentials: true,
        });
        setAppointments(data.appointments);
        setTotalAppointments(data.appointments.length);
        setFilteredAppointments(data.appointments);
      } catch (error) {
        setAppointments([]);
        setTotalAppointments(0);
        setFilteredAppointments([]);
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

  const handleUpdatePresent = async (appointmentId, present) => {
    try {
      const { data } = await axiosInstance.put(
        `/appointment/update/${appointmentId}`,
        { present },
        { withCredentials: true }
      );
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, present }
            : appointment
        )
      );
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update present status");
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

  const handleDateFilterChange = (event) => {
    setSelectedDate(event.target.value);
    const filtered = appointments.filter((appointment) =>
      new Date(appointment.appointment_date).toLocaleDateString() ===
      new Date(event.target.value).toLocaleDateString()
    );
    setFilteredAppointments(filtered);
  };

  const handleSearch = (event) => {
    const filtered = appointments.filter((appointment) =>
      `${appointment.firstName} ${appointment.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredAppointments(filtered);
    setSearchTerm(event.target.value);
  };

  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment);
    setNewDate(appointment.appointment_date);
    setNewTimeSlot(appointment.timeSlot);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleReschedule = async () => {
    console.log('Reschedule Details:', selectedAppointment._id, newDate, newTimeSlot); // Log values to check
    try {
      const { data } = await axiosInstance.put(
        `/appointment/reschedule/${selectedAppointment._id}`,
        { appointment_date: newDate, timeSlot: newTimeSlot },
        { withCredentials: true }
      );
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === selectedAppointment._id
            ? { ...appointment, appointment_date: newDate, timeSlot: newTimeSlot }
            : appointment
        )
      );
      toast.success(data.message);
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reschedule appointment");
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
              <p>Hello, Dr.</p>
              <h5>
                {user ? `${user.firstName} ${user.lastName}`.toUpperCase() : "User"}
              </h5>
            </div>
            <p>
              Welcome To Aadicare {user?.role === "Doctor" ? "Doctor" : "Admin"} Dashboard.
              Here You Can See Your Patients Appointments, Change Status Of Appointment, Add New Doctors, Add New Patients,
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

      {/* Filters Row */}
      <div className="filters-row">
        {/* Search Bar */}
        <div className="filter search-bar">
          <label htmlFor="searchPatients">Search Patient: </label>
          <input
            type="text"
            id="searchPatients"
            placeholder="Search by name"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        {/* Date Filter */}
        <div className="filter">
          <label htmlFor="dateSelect">Filter by Date: </label>
          <input
            type="date"
            id="dateSelect"
            value={selectedDate}
            onChange={handleDateFilterChange}
          />
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
              <th>Present</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
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
                    <select
                      value={appointment.present}
                      onChange={(e) =>
                        handleUpdatePresent(appointment._id, e.target.value)
                      }
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </td>
                  <td>
                    <FaTrash
                      className="delete-icon"
                      onClick={() => handleDeleteAppointment(appointment._id)}
                      style={{ cursor: "pointer", color: "red" }}
                    />
                    <FaRegCalendarAlt
                      className="reschedule-icon"
                      onClick={() => openRescheduleModal(appointment)}
                      style={{ cursor: "pointer", color: "blue", marginLeft: "10px" }}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9">No Appointments Found!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reschedule Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h4>Reschedule Appointment</h4>
            <label htmlFor="newDate">Select New Date:</label>
            <input
              type="date"
              id="newDate"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
            <label htmlFor="newTimeSlot">Select New Time Slot:</label>
            <select
              id="newTimeSlot"
              value={newTimeSlot}
              onChange={(e) => setNewTimeSlot(e.target.value)}
            >
              <option value="09:00-09:30">09:00-09:30</option>
              <option value="09:30-10:00">09:30-10:00</option>
              <option value="10:00-10:30">10:00-10:30</option>
              <option value="10:30-11:00">10:30-11:00</option>
              <option value="11:00-11:30">11:00-11:30</option>
              <option value="11:30-12:00">11:30-12:00</option>
              {/* Add other time slots as required */}
            </select>
            <div className="modal-actions">
              <button onClick={handleReschedule}>Reschedule</button>
              <button onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Dashboard;