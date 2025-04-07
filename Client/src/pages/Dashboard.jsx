import React, { useState, useEffect } from "react";
import moment from "moment";
import { fetchAttendances } from "../services/attendance";

const AttendanceDashboard = () => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(moment().format("YYYY-MM-DD")); // Default to today's date

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  useEffect(() => {
    let interval;

    const fetchData = async () => {
      try {
        const data = await fetchAttendances({ date, range: "day" });
        setAttendances(data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, [date]);

  const summaryCounts = {
    onTime: attendances.filter((a) => a.status === "On Time").length,
    late: attendances.filter((a) => a.isLate).length,
    absent: attendances.filter((a) => a.status === "Absent").length,
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="px-6 pt-4 w-1/2 mx-auto">
        <div className="px-6 pt-4">
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            max={moment().format("YYYY-MM-DD")} // Prevent selecting future dates
            className="input input-bordered w-full px-3 py-4 rounded-2xl bg-white shadow-sm h-12 text-lg"
          />
        </div>
      </div>

      {/* Rest of the component remains the same */}
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-100 p-4 rounded-lg shadow flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">On Time</h3>
              <p className="text-sm text-gray-600">Arrived by 9:00 AM</p>
            </div>
            <p className="text-2xl font-bold">{summaryCounts.onTime}</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg shadow flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Late</h3>
              <p className="text-sm text-gray-600">Arrived after 9:00 AM</p>
            </div>
            <p className="text-2xl font-bold">{summaryCounts.late}</p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg shadow flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Absent</h3>
              <p className="text-sm text-gray-600">No check-in recorded</p>
            </div>
            <p className="text-2xl font-bold">{summaryCounts.absent}</p>
          </div>
        </div>

        <div className="overflow-x-auto bg-white p-4 rounded-lg shadow">
          {attendances.length === 0 ? (
            <div className="text-center py-8">
              <p>No attendance records found for {moment(date).format("MMMM D, YYYY")}</p>
            </div>
          ) : (
            <table className="table w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th>Employee</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Duration</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((employee, index) => (
                  <tr key={employee._id} className="hover:bg-gray-50">
                    <td className="flex items-center space-x-3">
                      <div className="avatar">
                        <div className="w-10 rounded-full">
                          <img
                            src={employee.profilePic || "/default-avatar.png"}
                            alt={employee.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/default-avatar.png";
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">{employee.name}</span>
                        <p className="text-xs text-gray-500">{employee.userId?.userId || "N/A"}</p>
                        <p className="text-xs text-gray-500">{moment(employee.date).format("MMM D, YYYY")}</p>
                      </div>
                    </td>
                    <td>{employee.checkInTime || "-"}</td>
                    <td>{employee.checkOutTime || "-"}</td>
                    <td>{employee.duration || "-"}</td>
                    <td>{employee.department || "N/A"}</td>
                    <td
                      className={`font-bold ${
                        employee.status === "On Time"
                          ? "text-green-500"
                          : employee.isLate
                          ? "text-yellow-500"
                          : "text-red-500"
                      }`}
                    >
                      {employee.status || "Absent"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard;
