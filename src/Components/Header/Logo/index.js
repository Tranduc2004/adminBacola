import { Link } from "react-router-dom";
import React from "react";
import logo from "../../../assets/images/logo.webp";

const Logo = () => {
  return (
    <div className="col-xs-3">
      <Link to="/" className="d-flex align-items-center logo">
        <img src={logo} alt="logo" />
        <span className="ml-2">HOTASH</span>
      </Link>
    </div>
  );
};

export default Logo;
