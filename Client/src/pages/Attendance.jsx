import React, { useState } from "react";
import moment from "moment";
import { fetchAttendances } from "../services/attendance";
import toast from "react-hot-toast";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState(moment().format("MM"));
  const [year, setYear] = useState(moment().format("YYYY"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await fetchAttendances({
        employeeId,
        date: `${year}-${month}-01`,
        range: "month",
      });
      setAttendanceData(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const summaryStats = {
    totalDays: moment(`${year}-${month}`, "YYYY-MM").daysInMonth(),
    present: attendanceData.filter((record) => record.status !== "Absent").length,
    absent: attendanceData.filter((record) => record.status === "Absent").length,
    onTime: attendanceData.filter((record) => record.status === "On Time").length,
    late: attendanceData.filter((record) => record.isLate).length,
    averageHours:
      attendanceData.reduce((acc, record) => {
        return acc + (record.duration ? parseFloat(record.duration.split(" ")[0]) : 0);
      }, 0) / (attendanceData.length || 1),
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6">Employee Attendance Dashboard</h1>

          {/* Search Form */}
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

          {/* Summary Dashboard */}
          {attendanceData.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Monthly Summary - {moment(`${year}-${month}`).format("MMMM YYYY")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-600">Present</h3>
                  <p className="text-2xl font-bold">{summaryStats.present}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-600">Absent</h3>
                  <p className="text-2xl font-bold">{summaryStats.absent}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-600">Late Arrivals</h3>
                  <p className="text-2xl font-bold">{summaryStats.late}</p>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Records */}
          {attendanceData.length > 0 && (
            <div className="overflow-x-auto">
              <h2 className="text-xl font-semibold mb-4">Daily Records</h2>
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
                      <td>{moment(record.date).format("ddd, MMM D")}</td>
                      <td>{record.checkInTime || "-"}</td>
                      <td>{record.checkOutTime || "-"}</td>
                      <td>{record.duration || "-"}</td>
                      <td
                        className={`font-bold ${
                          record.status === "On Time"
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

          {/* Empty State */}
          {attendanceData.length === 0 && !loading && (
            <div className="text-center py-10 text-gray-500">No attendance records found for the selected criteria</div>
          )}

          {/* Loading State */}
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
