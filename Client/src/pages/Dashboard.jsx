import React, { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import axios from "axios";
import { Datepicker } from "@meinefinsternis/react-horizontal-date-picker";
import { enUS } from "date-fns/locale";

const AttendanceDashboard = () => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const ENTRY_TIME = "09:00:00";
  const GRACE_PERIOD = 15;
  const [selectedDate, setSelectedDate] = useState(moment().toDate());

  // Fetch attendance data for selected date
  const fetchAttendances = async (date) => {
    try {
      setLoading(true);
      const formattedDate = moment(date).format("YYYY-MM-DD");
      const response = await axios.get(
        `http://localhost:5000/attendances?date=${formattedDate}`
      );
      
      const processedData = response.data.map((attendance) => {
        let status = "Absent";
        let lateDuration = null;
        let isLate = false;

        if (attendance.checkInTime) {
          const checkInMoment = moment(attendance.checkInTime);
          const entryMoment = moment(ENTRY_TIME, "HH:mm:ss");
          const diffMinutes = checkInMoment.diff(entryMoment, "minutes");

          if (diffMinutes <= GRACE_PERIOD) {
            status = "On Time";
          } else {
            const lateHours = Math.floor(diffMinutes / 60);
            const lateMins = diffMinutes % 60;
            lateDuration = `${lateHours > 0 ? lateHours + "h " : ""}${lateMins}m`;
            status = `Late (${lateDuration})`;
            isLate = true;
          }
        }

        return {
          ...attendance,
          name: attendance.userId?.name || "Unknown",
          department: attendance.userId?.dep || "N/A",
          profilePic: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            attendance.userId?.name || "Unknown"
          )}&background=random`,
          checkInTime: attendance.checkInTime
            ? moment(attendance.checkInTime).format("h:mm A")
            : "N/A",
          checkOutTime: attendance.checkOutTime
            ? moment(attendance.checkOutTime).format("h:mm A")
            : "N/A",
          duration:
            attendance.checkInTime && attendance.checkOutTime
              ? calculateDuration(attendance.checkInTime, attendance.checkOutTime)
              : "N/A",
          status,
          lateDuration,
          isLate,
          rawCheckInTime: attendance.checkInTime,
          date: moment(attendance.date).format("MMM D, YYYY"),
        };
      });

      setAttendances(processedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setLoading(false);
    }
  };

  const calculateDuration = (start, end) => {
    const startTime = moment(start);
    const endTime = moment(end);
    const duration = moment.duration(endTime.diff(startTime));
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    return `${hours}h ${minutes}m`;
  };

  const handleDateChange = (date) => {
    console.log(moment(date[1]).format());
    const [startValue] = date;
    if (startValue) {
      setSelectedDate(startValue);
      fetchAttendances(startValue);
    }
  };

  useEffect(() => {
    fetchAttendances(selectedDate);
  }, [selectedDate]);

  const filteredAttendances = attendances.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const summaryCounts = {
    onTime: attendances.filter((a) => a.status === "On Time").length,
    late: attendances.filter((a) => a.isLate).length,
    absent: attendances.filter((a) => a.status === "Absent").length,
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="navbar bg-white shadow-md px-6">
        <div className="flex-1">
          <a className="text-xl font-bold">Attendance System</a>
        </div>
        <div className="flex-none flex items-center space-x-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or department"
              className="input input-bordered pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="avatar">
            <div className="w-10 rounded-full">
              <img src="https://via.placeholder.com/40" alt="User Avatar" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pt-4">
        <Datepicker
          onChange={handleDateChange}
          locale={enUS}
          startValue={selectedDate}
          classNames={{
            dayItem: (date) => {
              const baseClass = "text-center p-2 rounded-full";
              const isToday = moment(date).isSame(moment(), "day");
              const isSelected = moment(date).isSame(selectedDate, "day");
              
              if (isSelected) {
                return `${baseClass} bg-blue-500 text-white`;
              }
              if (isToday) {
                return `${baseClass} bg-blue-100 text-blue-800`;
              }
              return baseClass;
            },
          }}
        />
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-100 p-4 rounded-lg shadow flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">On Time</h3>
              <p className="text-sm text-gray-600">Arrived by 9:15 AM</p>
            </div>
            <p className="text-2xl font-bold">{summaryCounts.onTime}</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg shadow flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Late</h3>
              <p className="text-sm text-gray-600">Arrived after 9:15 AM</p>
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
          {loading ? (
            <div className="flex justify-center">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <table className="table w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th>Employee</th>
                  <th>ID</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Duration</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendances.map((employee, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="flex items-center space-x-3">
                      <div className="avatar">
                        <div className="w-10 rounded-full">
                          <img src={employee.profilePic} alt={employee.name} />
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">{employee.name}</span>
                        <p className="text-xs text-gray-500">{employee.date}</p>
                      </div>
                    </td>
                    <td>{employee.userId?.userId || "N/A"}</td>
                    <td>{employee.checkInTime}</td>
                    <td>{employee.checkOutTime}</td>
                    <td>{employee.duration}</td>
                    <td>{employee.department}</td>
                    <td
                      className={`font-bold ${
                        employee.status.includes("On Time")
                          ? "text-green-500"
                          : employee.isLate
                          ? "text-yellow-500"
                          : "text-red-500"
                      }`}
                    >
                      {employee.status}
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