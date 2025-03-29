import React, { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import axios from "axios";
import { calculateDuration } from "../utils/dateCalculate";
import { fetchAttendances } from "../services/attendance";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState(moment().format("MM"));
  const [year, setYear] = useState(moment().format("YYYY"));

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchAttendances({
      employeeId,
      month,
      year,
    })
      .then((data) => {
        console.log(data);
        setAttendanceData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching attendance data:", error);
        setLoading(false);
      });
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6">Employee Attendance Record</h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Enter Employee ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="select select-bordered w-full"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={(i + 1).toString().padStart(2, "0")}>
                    {moment().month(i).format("MMMM")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select value={year} onChange={(e) => setYear(e.target.value)} className="select select-bordered w-full">
                {Array.from({ length: 10 }, (_, i) => {
                  const yr = moment().year() - 5 + i;
                  return (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex items-end">
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? "Loading..." : "Get Attendance"}
              </button>
            </div>
          </form>

          {attendanceData.length > 0 && (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th>Date</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td>{}</td>
                      <td>{record.checkInTime}</td>
                      <td>{record.checkOutTime}</td>
                      <td>{record.duration}</td>
                      <td
                        className={`font-bold ${
                          record.status.includes("On Time")
                            ? "text-green-500"
                            : record.isLate
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                      >
                        {record.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {attendanceData.length === 0 && !loading && (
            <div className="text-center py-10 text-gray-500">No attendance records found for the selected criteria</div>
          )}

          {loading && (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
