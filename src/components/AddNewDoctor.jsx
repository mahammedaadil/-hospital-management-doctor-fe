import React, { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";
import axiosInstance from "../axios";

const AddNewDoctor = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [doctorDepartment, setDoctorDepartment] = useState("");
  const [doctorFees, setDoctorFees] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [resignationDate, setResignationDate] = useState("");
  const [doctorAvailability, setDoctorAvailability] = useState([
    { day: "", timings: "" },
  ]);
  const [docAvatar, setDocAvatar] = useState("");
  const [docAvatarPreview, setDocAvatarPreview] = useState("");

  const navigateTo = useNavigate();

  const departmentsArray = [
    "Pediatrics",
    "Orthopedics",
    "Cardiology",
    "Neurology",
    "Oncology",
    "Radiology",
    "Physical Therapy",
    "Dermatology",
    "ENT",
  ];

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setDocAvatarPreview(reader.result);
      setDocAvatar(file);
    };
  };

  const handleAvailabilityChange = (index, field, value) => {
    const newAvailability = [...doctorAvailability];
    newAvailability[index][field] = value;
    setDoctorAvailability(newAvailability);
  };

  const handleAddNewDoctor = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);
      formData.append("dob", dob);
      formData.append("gender", gender);
      formData.append("doctorDepartment", doctorDepartment);
      formData.append("doctorFees", doctorFees);
      formData.append("joiningDate", joiningDate);
      formData.append("resignationDate", resignationDate);
      formData.append("doctorAvailability", JSON.stringify(doctorAvailability));
      formData.append("docAvatar", docAvatar);

      const response = await axiosInstance.post("/user/doctor/addnew", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(response.data.message);
      setIsAuthenticated(true);
      navigateTo("/");

      // Reset form fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setDob("");
      setGender("");
      setPassword("");
      setConfirmPassword("");
      setDoctorFees("");
      setJoiningDate("");
      setResignationDate("");
      setDoctorAvailability([{ day: "", timings: "" }]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to register doctor");
    }
  };

  const handleAddAvailabilitySlot = () => {
    setDoctorAvailability([...doctorAvailability, { day: "", timings: "" }]);
  };

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <section className="page">
      <section className="container add-doctor-form">
        <img src="/logo.png" alt="logo" className="logo" />
        <h1 className="form-title">REGISTER A NEW DOCTOR</h1>
        <form onSubmit={handleAddNewDoctor}>
          <div className="first-wrapper">
            <div>
              <img
                src={docAvatarPreview || "/docHolder.jpg"}
                alt="Doctor Avatar"
              />
              <input type="file" onChange={handleAvatar} />
            </div>
            <div>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="number"
                placeholder="Mobile Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirm Your Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <input
                type="date"
                placeholder="Date of Birth"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <select
                value={doctorDepartment}
                onChange={(e) => setDoctorDepartment(e.target.value)}
              >
                <option value="">Select Department</option>
                {departmentsArray.map((depart, index) => (
                  <option value={depart} key={index}>
                    {depart}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Doctor Fees"
                value={doctorFees}
                onChange={(e) => setDoctorFees(e.target.value)}
              />
              <input
                type="date"
                placeholder="Joining Date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
              />
              <input
                type="date"
                placeholder="Resignation Date (Optional)"
                value={resignationDate}
                onChange={(e) => setResignationDate(e.target.value)}
              />

              {/* Availability Section */}
              <div>
                <h3>Doctor's Availability</h3>
                {doctorAvailability.map((slot, index) => (
                  <div key={index} className="availability-slot">
                    <select
                      value={slot.day}
                      onChange={(e) =>
                        handleAvailabilityChange(index, "day", e.target.value)
                      }
                    >
                      <option value="">Select Day</option>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                    <select
                      value={slot.timings}
                      onChange={(e) =>
                        handleAvailabilityChange(index, "timings", e.target.value)
                      }
                    >
                      <option value="">Select Time Slot</option>
                      <option value="09:00-09:30">09:00-09:30</option>
                      <option value="09:30-10:00">09:30-10:00</option>
                      <option value="10:00-10:30">10:00-10:30</option>
                      <option value="10:30-11:00">10:30-11:00</option>
                      <option value="11:00-11:30">11:00-11:30</option>
                      <option value="11:30-12:00">11:30-12:00</option>
                      <option value="12:00-12:30">12:00-12:30</option>
                      <option value="12:30-01:00">12:30-01:00</option>
                      <option value="14:00-14:30">14:00-14:30</option>
                      <option value="14:30-15:00">14:30-15:00</option>
                      <option value="15:00-15:30">15:00-15:30</option>
                      <option value="15:30-16:00">15:30-16:00</option>
                      <option value="16:00-16:30">16:00-16:30</option>
                      <option value="16:30-17:00">16:30-17:00</option>
                      <option value="17:00-17:30">17:00-17:30</option>
                      <option value="17:30-18:00">17:30-18:00</option>
                      <option value="18:00-18:30">18:00-18:30</option>
                      <option value="18:30-19:00">18:30-19:00</option>
                      <option value="19:00-19:30">19:00-19:30</option>
                      <option value="19:30-20:00">19:30-20:00</option>
                    </select>
                  </div>
                ))}
                <button type="button" onClick={handleAddAvailabilitySlot}>
                  Add Another Availability Slot
                </button>
              </div>

              <button type="submit">Register New Doctor</button>
            </div>
          </div>
        </form>
      </section>
    </section>
  );
};

export default AddNewDoctor;
