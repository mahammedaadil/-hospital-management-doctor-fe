import React, { useContext, useState } from "react";
import { TiHome } from "react-icons/ti";
import { RiLogoutBoxFill } from "react-icons/ri";
import { AiFillMessage } from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaUserDoctor } from "react-icons/fa6";
import { IoPersonAddSharp } from "react-icons/io5";
import { toast } from "react-toastify";
import { Context } from "../main";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [show, setShow] = useState(false);
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const navigateTo = useNavigate();

  const handleLogout = async () => {
    localStorage.clear();
    setIsAuthenticated(false);
    navigateTo("/login"); // Fixed function call
    toast.success("Admin Logged Out Successfully");
  };

  return (
    <>
      <nav
        style={!isAuthenticated ? { display: "none" } : { display: "flex" }}
        className={show ? "show sidebar" : "sidebar"}
      >
        <div className="links">
          <TiHome onClick={() => navigateTo("/")} />
          <FaUserDoctor onClick={() => navigateTo("/doctors")} />
          <IoPersonAddSharp onClick={() => navigateTo("/doctor/addnew")} />
          <AiFillMessage onClick={() => navigateTo("/messages")} />
          <RiLogoutBoxFill onClick={handleLogout} />
        </div>
      </nav>
      <div
        className="wrapper"
        style={isAuthenticated ? { display: "flex" } : { display: "none" }}
      >
        <GiHamburgerMenu className="hamburger" onClick={() => setShow(!show)} />
      </div>
    </>
  );
};

export default Sidebar;
