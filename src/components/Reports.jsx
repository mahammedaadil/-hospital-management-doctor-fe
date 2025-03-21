import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axiosInstance from "../axios";

// Utility function to capitalize each word in a string
const capitalizeWords = (str) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const Reports = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [reportDate, setReportDate] = useState("");
  const [reportMonth, setReportMonth] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await axiosInstance.get("/appointment/getall", {
          withCredentials: true,
        });
        setAppointments(data.appointments);
      } catch (error) {
        setAppointments([]);
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

    fetchAppointments();
    fetchDoctors();
  }, []);

  const addReportHeader = (doc, title) => {
    const img = new Image();
    img.src = "public/logo.png";
    doc.addImage(img, "PNG", 10, 10, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("AadiCare - Your Health, Our Priority", 50, 20);
    doc.setFontSize(12);
    doc.text("Contact: +91-9106624120 | Email: adilchoice30@gmail.com", 50, 30);
    doc.text(capitalizeWords(title), 20, 50); // Capitalize title
    doc.text(`Report Generated On: ${new Date().toLocaleString()}`, 20, 60);
  };

  const generateDateWisePDFReport = () => {
    if (!reportDate) {
      toast.error("Please select a date for the report.");
      return;
    }

    const filteredAppointments = appointments.filter(
      (appt) =>
        new Date(appt.appointment_date).toLocaleDateString() ===
        new Date(reportDate).toLocaleDateString()
    );

    if (filteredAppointments.length === 0) {
      toast.error("No appointments found for the selected date.");
      return;
    }

    const doc = new jsPDF();
    addReportHeader(doc, `Appointments Report - ${new Date(reportDate).toLocaleDateString()}`);

    const tableColumn = ["Doctor", "Patient", "Department", "Date", "Time", "Status"].map((col) =>
      capitalizeWords(col)
    );
    const tableRows = filteredAppointments.map((appt) => [
      capitalizeWords(`${appt.doctor.firstName} ${appt.doctor.lastName}`),
      capitalizeWords(`${appt.firstName} ${appt.lastName}`),
      capitalizeWords(appt.department),
      new Date(appt.appointment_date).toLocaleDateString(),
      appt.timeSlot,
      capitalizeWords(appt.status),
    ]);

    autoTable(doc, {
      startY: 70,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
    });

    doc.save(`Appointments_Report_${reportDate}.pdf`);
    toast.success("Report downloaded successfully!");
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    addReportHeader(doc, "Department-wise Appointment Report");

    let startY = 70;
    const departmentWiseReport = appointments.reduce((acc, appt) => {
      const department = appt.department || "Unknown";
      if (!acc[department]) {
        acc[department] = [];
      }
      acc[department].push(appt);
      return acc;
    }, {});

    Object.entries(departmentWiseReport).forEach(([department, appts]) => {
      doc.setFontSize(14);
      doc.text(capitalizeWords(department), 20, startY); // Capitalize department name
      startY += 10;

      const tableColumn = ["Doctor", "Patient", "Date", "Time"].map((col) => capitalizeWords(col));
      const tableRows = appts.map((appt) => [
        capitalizeWords(`${appt.doctor.firstName} ${appt.doctor.lastName}`),
        capitalizeWords(`${appt.firstName} ${appt.lastName}`),
        new Date(appt.appointment_date).toLocaleDateString(),
        appt.timeSlot,
      ]);

      autoTable(doc, {
        startY,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
      });

      startY = doc.lastAutoTable.finalY + 10;
    });

    doc.save("Department_Report.pdf");
    toast.success("Report downloaded successfully!");
  };

  const generateDoctorReport = () => {
    if (!doctors || doctors.length === 0) {
      toast.error("No doctors available for report generation.");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    addReportHeader(doc, "Doctor Information Report");

    const tableHeaders = [
      "Doctor Name", "Email", "Phone", "DOB",
      "Gender", "Department", "Fees", "Joining Date", "Resignation Date", "Availability"
    ].map((col) => capitalizeWords(col));

    const tableData = doctors.map((doctor) => [
      capitalizeWords(`${doctor.firstName} ${doctor.lastName}`),
      doctor.email || "N/A",
      doctor.phone || "N/A",
      doctor.dob ? doctor.dob.substring(0, 10) : "N/A",
      capitalizeWords(doctor.gender || "N/A"),
      capitalizeWords(doctor.doctorDepartment || "N/A"),
      `₹${doctor.doctorFees || 0}`,
      doctor.joiningDate ? doctor.joiningDate.substring(0, 10) : "N/A",
      doctor.resignationDate ? doctor.resignationDate.substring(0, 10) : "N/A",
      doctor.doctorAvailability.length > 0
        ? doctor.doctorAvailability
            .map((slot) => `${capitalizeWords(slot.day)}: ${slot.timings}`)
            .join(", ")
        : "No Availability",
    ]);

    autoTable(doc, {
      startY: 70,
      head: [tableHeaders],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 4 },
      columnStyles: { 0: { cellWidth: 40 } },
      theme: "striped",
    });

    doc.save("Doctor_Report.pdf");
    toast.success("Doctor report downloaded successfully!");
  };

  const generateDoctorAvailabilityReport = () => {
    if (!doctors || doctors.length === 0) {
      toast.error("No doctors available for report generation.");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    addReportHeader(doc, "Doctor Availability Report");

    const tableHeaders = ["Doctor Name", "Availability"].map((col) => capitalizeWords(col));
    const tableData = doctors.map((doctor) => [
      capitalizeWords(`${doctor.firstName} ${doctor.lastName}`),
      doctor.doctorAvailability.length > 0
        ? doctor.doctorAvailability
            .map((slot) => `${capitalizeWords(slot.day)}: ${slot.timings}`)
            .join("\n")
        : "No Availability",
    ]);

    autoTable(doc, {
      startY: 70,
      head: [tableHeaders],
      body: tableData,
      styles: { fontSize: 10, cellPadding: 6 },
      columnStyles: { 1: { cellWidth: "auto" } },
      theme: "striped",
    });

    doc.save("Doctor_Availability_Report.pdf");
    toast.success("Doctor availability report downloaded successfully!");
  };

  const generateDoctorMonthlyReport = () => {
    if (!reportMonth) {
      toast.error("Please select a month for the report.");
      return;
    }

    const selectedMonth = new Date(reportMonth);
    const filteredAppointments = appointments.filter((appt) => {
      const apptDate = new Date(appt.appointment_date);
      return (
        apptDate.getMonth() === selectedMonth.getMonth() &&
        apptDate.getFullYear() === selectedMonth.getFullYear()
      );
    });

    if (filteredAppointments.length === 0) {
      toast.error("No appointments found for the selected month.");
      return;
    }

    const doctorAppointments = {};
    filteredAppointments.forEach((appt) => {
      const doctorName = `${appt.doctor.firstName} ${appt.doctor.lastName}`;
      doctorAppointments[doctorName] = (doctorAppointments[doctorName] || 0) + 1;
    });

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    addReportHeader(
      doc,
      `Doctor Monthly Appointment Report - ${selectedMonth.toLocaleString("default", { month: "long" })} ${selectedMonth.getFullYear()}`
    );

    const tableHeaders = ["Doctor Name", "Total Appointments"].map((col) => capitalizeWords(col));
    const tableData = Object.entries(doctorAppointments).map(([doctor, count]) => [
      capitalizeWords(doctor),
      count,
    ]);

    autoTable(doc, {
      startY: 70,
      head: [tableHeaders],
      body: tableData,
      styles: { fontSize: 10, cellPadding: 6 },
      theme: "striped",
    });

    doc.save(`Doctor_Monthly_Appointment_Report_${reportMonth}.pdf`);
    toast.success("Doctor monthly appointment report downloaded successfully!");
  };

  return (
    <div className="reports-container">
      <h2>Reports</h2>
      <table>
        <thead>
          <tr>
            <th>Report Name</th>
            <th>Report Description</th>
            <th>Report Type</th>
            <th>Input Field</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Department-Wise Doctor Report</td>
            <td>Here Doctor Report Can Be Fetched Department-Wise</td>
            <td>PDF</td>
            <td>N/A</td>
            <td>
              <button onClick={generatePDFReport} className="download-btn">
                Download
              </button>
            </td>
          </tr>
          <tr>
            <td>Appointments Report Date-Wise</td>
            <td>Here Appointment Report Can Be Fetched Date-Wise</td>
            <td>PDF</td>
            <td>
              <label htmlFor="reportDate">Select Date for Report:</label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
              />
            </td>
            <td>
              <button onClick={generateDateWisePDFReport} className="download-btn">
                Download
              </button>
            </td>
          </tr>
          <tr>
            <td>All Doctors Information Report</td>
            <td>Here All Doctors Information Report Can Be Fetched</td>
            <td>PDF</td>
            <td>N/A</td>
            <td>
              <button className="download-btn" onClick={generateDoctorReport}>
                Download
              </button>
            </td>
          </tr>
          <tr>
            <td>Doctor Availability Report</td>
            <td>List of all doctors with their available days and timings</td>
            <td>PDF</td>
            <td>N/A</td>
            <td>
              <button className="download-btn" onClick={generateDoctorAvailabilityReport}>
                Download
              </button>
            </td>
          </tr>
          <tr>
            <td>Doctor Monthly Appointment Report</td>
            <td>Shows total number of appointments for each doctor in a selected month</td>
            <td>PDF</td>
            <td>
              <label htmlFor="reportMonth">Select Month:</label>
              <input
                type="month"
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
              />
            </td>
            <td>
              <button className="download-btn" onClick={generateDoctorMonthlyReport}>
                Download
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Reports;