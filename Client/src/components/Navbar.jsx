import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">AMS</a>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-10 space-x-6">
          <li>
            <Link to="/dashboard"> Dashboard</Link>
          </li>
          <li>
            <Link to="/attendance"> Attendance</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Navbar;
