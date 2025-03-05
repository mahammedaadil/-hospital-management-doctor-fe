import axiosInstance from "../axios"; 
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Navigate } from "react-router-dom"; 

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const { isAuthenticated } = useContext(Context);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [updatedDoctorData, setUpdatedDoctorData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    doctorDepartment: "",
    doctorFees: "",
    joiningDate: "",
    resignationDate: "",
    doctorAvailability: [],
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await axiosInstance.get("/user/doctors");
        setDoctors(data.doctors);
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching doctors");
      }
    };
    fetchDoctors();
  }, []);

  const deleteDoctor = async (id) => {
    try {
      await axiosInstance.delete(`/user/doctor/${id}`);
      toast.success("Doctor deleted successfully");
      setDoctors(doctors.filter((doctor) => doctor._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete doctor");
    }
  };

  const startEditing = (doctor) => {
    setEditingDoctorId(doctor._id);
    setUpdatedDoctorData({
      ...doctor,
      dob: doctor.dob ? doctor.dob.substring(0, 10) : "",
      joiningDate: doctor.joiningDate ? doctor.joiningDate.substring(0, 10) : "",
      resignationDate: doctor.resignationDate ? doctor.resignationDate.substring(0, 10) : "",
      doctorAvailability: doctor.doctorAvailability || [],
    });
  };

  const handleUpdateDoctor = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put(
        `/user/doctor/update/${editingDoctorId}`,
        { ...updatedDoctorData, doctorAvailability: JSON.stringify(updatedDoctorData.doctorAvailability) }
      );

      if (response.data.success) {
        toast.success("Doctor updated successfully!");
        setDoctors((prev) =>
          prev.map((doc) =>
            doc._id === editingDoctorId ? { ...doc, ...updatedDoctorData } : doc
          )
        );
        setEditingDoctorId(null);
      } else {
        toast.error("Update failed: " + response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating doctor.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedDoctorData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleAvailabilityChange = (index, field, value) => {
    const newAvailability = [...updatedDoctorData.doctorAvailability];
    newAvailability[index][field] = value;
    setUpdatedDoctorData((prevData) => ({ ...prevData, doctorAvailability: newAvailability }));
  };

  const addAvailabilitySlot = () => {
    setUpdatedDoctorData((prevData) => ({
      ...prevData,
      doctorAvailability: [...prevData.doctorAvailability, { day: "", timings: "", date: "" }],
    }));
  };

  const removeAvailabilitySlot = (index) => {
    const newAvailability = updatedDoctorData.doctorAvailability.filter((_, i) => i !== index);
    setUpdatedDoctorData((prevData) => ({ ...prevData, doctorAvailability: newAvailability }));
  };

  const isTimeSlotConflicting = (day, timings) => {
    return updatedDoctorData.doctorAvailability.some(slot => slot.day === day && slot.timings === timings);
  };

  const filteredDoctors = filterDepartment === "All"
    ? doctors
    : doctors.filter((doc) => doc.doctorDepartment === filterDepartment);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <section className="page doctors">
      <h1>DOCTORS</h1>
      <div className="filter-section">
        <label htmlFor="departmentFilter">Filter by Department:</label>
        <select
          id="departmentFilter"
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
        >
          <option value="All">All Departments</option>
          {Array.from(new Set(doctors.map((doc) => doc.doctorDepartment))).map((dept, idx) => (
            <option key={idx} value={dept}>{dept}</option>
          ))}
        </select>
      </div>
      <div className="banner">
        {filteredDoctors && filteredDoctors.length > 0 ? (
          filteredDoctors.map((element) => (
            <div className="doctor-card" key={element._id}>
              <img
                src={element.docAvatar?.url || "/default-avatar.png"}
                alt="doctor avatar"
              />
              <h4>{`${element.firstName} ${element.lastName}`.toUpperCase()}</h4>
              <div className="doctor-details">
                <p>Email: <span>{element.email}</span></p>
                <p>Phone: <span>{element.phone}</span></p>
                <p>DOB: <span>{element.dob ? element.dob.substring(0, 10) : "N/A"}</span></p>
                <p>Department: <span>{element.doctorDepartment}</span></p>
                <p>Gender: <span>{element.gender}</span></p>
                <p>Fees: <span>₹{element.doctorFees}</span></p>
                <p>Joining Date: <span>{element.joiningDate ? element.joiningDate.substring(0, 10) : "N/A"}</span></p>
                {element.resignationDate && (
                  <p>Resignation Date: <span>{element.resignationDate.substring(0, 10)}</span></p>
                )}
                <p>Availability:</p>
                {element.doctorAvailability && element.doctorAvailability.length > 0 ? (
                  <ul>
                    {element.doctorAvailability.map((slot, index) => (
                      <li key={index}>{slot.day}: {slot.timings}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No Availability Info</p>
                )}
              </div>
              <div className="actions">
                <button className="btn btn-update" onClick={() => startEditing(element)}>Update</button>
                <button className="btn btn-delete" onClick={() => deleteDoctor(element._id)}>Delete</button>
              </div>
            </div>
          ))
        ) : (
          <h1>No Registered Doctors Found!</h1>
        )}
      </div>

      {editingDoctorId && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-modal" onClick={() => setEditingDoctorId(null)}>&times;</span>
            <h2>Update Doctor</h2>
            <form onSubmit={handleUpdateDoctor}>
              <input type="text" name="firstName" placeholder="First Name" value={updatedDoctorData.firstName} onChange={handleInputChange} required />
              <input type="text" name="lastName" placeholder="Last Name" value={updatedDoctorData.lastName} onChange={handleInputChange} required />
              <input type="email" name="email" placeholder="Email" value={updatedDoctorData.email} onChange={handleInputChange} required />
              <input type="text" name="phone" placeholder="Phone" value={updatedDoctorData.phone} onChange={handleInputChange} required />
              <input type="date" name="dob" value={updatedDoctorData.dob} onChange={handleInputChange} required />
              <select name="gender" value={updatedDoctorData.gender} onChange={handleInputChange} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <select name="doctorDepartment" value={updatedDoctorData.doctorDepartment} onChange={handleInputChange} required>
                <option value="">Select Department</option>
                {["Pediatrics", "Orthopedics", "Cardiology", "Neurology", "Oncology", "Radiology", "Physical Therapy", "Dermatology", "ENT"].map((depart, index) => (
                  <option key={index} value={depart}>{depart}</option>
                ))}
              </select>
              <input type="number" name="doctorFees" placeholder="Fees" value={updatedDoctorData.doctorFees} onChange={handleInputChange} required />
              <h4>Joining Date</h4>
              <input type="date" name="joiningDate" value={updatedDoctorData.joiningDate} onChange={handleInputChange} required />
              <h4>Resignation Date(optional) </h4>
              <input type="date" name="resignationDate" value={updatedDoctorData.resignationDate || ""} onChange={handleInputChange} />

              <h4>Availability</h4>
              {updatedDoctorData.doctorAvailability.map((slot, index) => (
                <div key={index} className="availability-slot">
                  <select
                    value={slot.day}
                    onChange={(e) => handleAvailabilityChange(index, "day", e.target.value)}
                    required
                  >
                    <option value="">Select Day</option>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>

                  <select
                    value={slot.timings}
                    onChange={(e) => handleAvailabilityChange(index, "timings", e.target.value)}
                    required
                  >
                    <option value="">Select Time Slot</option>
                    {["09:00-09:30", "09:30-10:00", "10:00-10:30", "10:30-11:00", "11:00-11:30", "11:30-12:00", "12:00-12:30", "12:30-01:00", "14:00-14:30", "14:30-15:00", "15:00-15:30", "15:30-16:00", "16:00-16:30", "16:30-17:00", "17:00-17:30", "17:30-18:00", "18:00-18:30", "18:30-19:00", "19:00-19:30", "19:30-20:00"].map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>

                  
                <button type="button" className="remove-availability-btn" onClick={() => removeAvailabilitySlot(index)}>
                Remove
                </button>
                  
                </div>
              ))}
              <button type="button" className="add-availability-btn" onClick={addAvailabilitySlot}>
               Add Availability Slot
              </button>

              <button type="submit" className="update-button">Update Doctor</button>
              <button type="button" className="cancel-button" onClick={() => setEditingDoctorId(null)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Doctors;
